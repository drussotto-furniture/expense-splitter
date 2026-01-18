'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { logActivity } from '@/lib/actions/activity'

interface Member {
  id: string
  user_id: string | null
  is_active: boolean
  status?: 'active' | 'pending' | 'inactive'
  pending_email?: string | null
  profile: {
    id: string
    full_name: string | null
    email: string
  } | null
}

interface AddExpenseButtonProps {
  groupId: string
  members: Member[]
  currency: string
}

export default function AddExpenseButton({ groupId, members, currency }: AddExpenseButtonProps) {
  // Include active and pending members (exclude only inactive)
  const activeMembers = members.filter(m => m.status !== 'inactive' && m.is_active !== false)

  // Helper to get member identifier (user_id for active, id for pending)
  const getMemberId = (member: Member) => member.user_id || member.id

  const [isOpen, setIsOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food & Dining')
  const [paidBy, setPaidBy] = useState('')
  const [notes, setNotes] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])
  const [splitType, setSplitType] = useState<'equal' | 'personal' | 'custom' | 'percentage' | 'shares'>('equal')
  const [selectedMembers, setSelectedMembers] = useState<string[]>(activeMembers.map(m => getMemberId(m)))
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({})
  const [percentages, setPercentages] = useState<Record<string, string>>({})
  const [shares, setShares] = useState<Record<string, string>>({})
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const amountNum = parseFloat(amount)
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid amount')
      }

      // Determine who paid - could be active member (user_id) or pending member (group_members.id)
      const payerId = paidBy || user.id
      const payerMember = activeMembers.find(m => getMemberId(m) === payerId)

      // Create the expense
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          group_id: groupId,
          description,
          amount: amountNum,
          currency,
          ...(payerMember?.user_id
            ? { paid_by: payerMember.user_id, paid_by_pending_member: null }
            : { paid_by: null, paid_by_pending_member: payerMember!.id }
          ),
          category,
          notes: notes || null,
          expense_date: expenseDate,
          split_type: splitType,
        })
        .select()
        .single()

      if (expenseError) throw expenseError

      // Calculate splits for both active and pending members
      let splits: { user_id?: string; pending_member_id?: string; amount: number }[] = []

      if (splitType === 'equal') {
        const splitAmount = amountNum / selectedMembers.length
        splits = selectedMembers.map(memberId => {
          const member = activeMembers.find(m => getMemberId(m) === memberId)
          return {
            ...(member?.user_id ? { user_id: member.user_id } : { pending_member_id: member!.id }),
            amount: parseFloat(splitAmount.toFixed(2)),
          }
        })
      } else if (splitType === 'personal') {
        splits = [{
          user_id: user.id,
          amount: amountNum,
        }]
      } else if (splitType === 'custom') {
        // Validate that ALL selected members add up to total
        const totalCustom = selectedMembers.reduce((sum, memberId) => {
          return sum + parseFloat(customAmounts[memberId] || '0')
        }, 0)

        if (Math.abs(totalCustom - amountNum) > 0.01) {
          throw new Error(`Custom amounts (${totalCustom}) must equal total amount (${amountNum})`)
        }

        // Create splits for all members
        splits = selectedMembers.map(memberId => {
          const member = activeMembers.find(m => getMemberId(m) === memberId)
          return {
            ...(member?.user_id ? { user_id: member.user_id } : { pending_member_id: member!.id }),
            amount: parseFloat(customAmounts[memberId] || '0'),
          }
        })
      } else if (splitType === 'percentage') {
        // Validate that ALL selected members add up to 100%
        const totalPercentage = selectedMembers.reduce((sum, memberId) => {
          return sum + parseFloat(percentages[memberId] || '0')
        }, 0)

        if (Math.abs(totalPercentage - 100) > 0.01) {
          throw new Error(`Percentages (${totalPercentage.toFixed(1)}%) must equal 100%`)
        }

        // Create splits for all members
        splits = selectedMembers.map(memberId => {
          const member = activeMembers.find(m => getMemberId(m) === memberId)
          const percentage = parseFloat(percentages[memberId] || '0')
          const amount = (amountNum * percentage) / 100
          return {
            ...(member?.user_id ? { user_id: member.user_id } : { pending_member_id: member!.id }),
            amount: parseFloat(amount.toFixed(2)),
          }
        })
      } else if (splitType === 'shares') {
        // Calculate total shares
        const totalShares = selectedMembers.reduce((sum, memberId) => {
          return sum + parseFloat(shares[memberId] || '0')
        }, 0)

        if (totalShares === 0) {
          throw new Error('Total shares must be greater than 0')
        }

        // Create splits for all members
        splits = selectedMembers.map(memberId => {
          const member = activeMembers.find(m => getMemberId(m) === memberId)
          const memberShares = parseFloat(shares[memberId] || '0')
          const amount = (amountNum * memberShares) / totalShares
          return {
            ...(member?.user_id ? { user_id: member.user_id } : { pending_member_id: member!.id }),
            amount: parseFloat(amount.toFixed(2)),
          }
        })
      }

      // Insert splits
      const { error: splitsError } = await supabase
        .from('expense_splits')
        .insert(
          splits.map(split => ({
            expense_id: expense.id,
            ...(split.user_id ? { user_id: split.user_id } : { pending_member_id: split.pending_member_id }),
            amount: split.amount,
          }))
        )

      if (splitsError) throw splitsError

      // Get payer name for activity log
      const payerName = payerMember?.profile?.full_name || payerMember?.profile?.email || payerMember?.pending_email || 'Unknown'

      // Get split member names
      const splitMemberNames = selectedMembers.map(memberId => {
        const member = activeMembers.find(m => getMemberId(m) === memberId)
        return member?.profile?.full_name || member?.profile?.email || member?.pending_email || 'Unknown'
      })

      // Log activity
      await logActivity({
        groupId,
        activityType: 'expense_created',
        details: {
          expense_id: expense.id,
          description,
          amount: amountNum,
          currency,
          category,
          split_type: splitType,
          paid_by_name: payerName,
          split_members: splitMemberNames,
          split_count: selectedMembers.length,
        },
      })

      // Upload receipt if provided
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop()
        const fileName = `${expense.id}/${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, receiptFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Receipt upload error:', uploadError)
          // Don't throw error - expense was created successfully
        } else {
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('receipts')
            .getPublicUrl(fileName)

          // Update expense with receipt URL
          await supabase
            .from('expenses')
            .update({ receipt_url: publicUrl })
            .eq('id', expense.id)
        }
      }

      setIsOpen(false)
      resetForm()
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setDescription('')
    setAmount('')
    setCategory('Food & Dining')
    setPaidBy(user?.id || '')
    setNotes('')
    setExpenseDate(new Date().toISOString().split('T')[0])
    setSplitType('equal')
    setSelectedMembers(activeMembers.map(m => getMemberId(m)))
    setCustomAmounts({})
    setPercentages({})
    setShares({})
    setReceiptFile(null)
  }

  const toggleMember = (userId: string) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId))
    } else {
      setSelectedMembers([...selectedMembers, userId])
    }
  }

  const handleOpenModal = async () => {
    // Set default paidBy to current user when opening modal
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setPaidBy(user.id)
    }
    setIsOpen(true)
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Expense
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add Expense</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-gray-100 text-gray-800 text-sm rounded-md border border-gray-300">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                    placeholder="What was this expense for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paid By
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    required
                  >
                    <option value="">Select who paid</option>
                    {activeMembers.map((member) => {
                      const memberId = getMemberId(member)
                      const displayName = member.status === 'pending'
                        ? `${member.pending_email} (Pending)`
                        : (member.profile?.full_name || member.profile?.email || 'Unknown User')
                      return (
                        <option key={memberId} value={memberId}>
                          {displayName}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                    rows={2}
                    placeholder="Add any additional details"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receipt / Photo (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  />
                  {receiptFile && (
                    <p className="mt-2 text-xs text-gray-600">
                      Selected: {receiptFile.name}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Split Type
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    <button
                      type="button"
                      className={`py-2 px-3 rounded-md text-sm font-medium ${
                        splitType === 'equal'
                          ? 'bg-slate-800 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setSplitType('equal')}
                    >
                      Equal
                    </button>
                    <button
                      type="button"
                      className={`py-2 px-3 rounded-md text-sm font-medium ${
                        splitType === 'personal'
                          ? 'bg-slate-800 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setSplitType('personal')}
                    >
                      Personal
                    </button>
                    <button
                      type="button"
                      className={`py-2 px-3 rounded-md text-sm font-medium ${
                        splitType === 'custom'
                          ? 'bg-slate-800 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setSplitType('custom')}
                    >
                      Custom
                    </button>
                    <button
                      type="button"
                      className={`py-2 px-3 rounded-md text-sm font-medium ${
                        splitType === 'percentage'
                          ? 'bg-slate-800 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setSplitType('percentage')}
                    >
                      Percent
                    </button>
                    <button
                      type="button"
                      className={`py-2 px-3 rounded-md text-sm font-medium ${
                        splitType === 'shares'
                          ? 'bg-slate-800 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setSplitType('shares')}
                    >
                      Shares
                    </button>
                  </div>
                </div>

                {splitType !== 'personal' && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Split Between
                    </label>
                    <div className="space-y-2">
                      {activeMembers.map((member) => {
                        const memberId = getMemberId(member)
                        return (
                        <div key={memberId} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(memberId)}
                            onChange={() => toggleMember(memberId)}
                            className="h-4 w-4 text-slate-800 focus:ring-slate-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-900">
                            {member.status === 'pending'
                              ? `${member.pending_email} (Pending)`
                              : (member.profile?.full_name || member.profile?.email || 'Unknown User')}
                          </span>
                          {splitType === 'custom' && selectedMembers.includes(memberId) && (
                            <input
                              type="number"
                              step="0.01"
                              className="ml-auto w-24 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                              placeholder="0.00"
                              value={customAmounts[memberId] || ''}
                              onChange={(e) =>
                                setCustomAmounts({
                                  ...customAmounts,
                                  [memberId]: e.target.value,
                                })
                              }
                            />
                          )}
                          {splitType === 'percentage' && selectedMembers.includes(memberId) && (
                            <div className="ml-auto flex items-center gap-1">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                                placeholder="0"
                                value={percentages[memberId] || ''}
                                onChange={(e) =>
                                  setPercentages({
                                    ...percentages,
                                    [memberId]: e.target.value,
                                  })
                                }
                              />
                              <span className="text-sm text-gray-600">%</span>
                            </div>
                          )}
                          {splitType === 'shares' && selectedMembers.includes(memberId) && (
                            <div className="ml-auto flex items-center gap-1">
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                                placeholder="1"
                                value={shares[memberId] || ''}
                                onChange={(e) =>
                                  setShares({
                                    ...shares,
                                    [memberId]: e.target.value,
                                  })
                                }
                              />
                              <span className="text-sm text-gray-600">shares</span>
                            </div>
                          )}
                        </div>
                      )})}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || selectedMembers.length === 0}
                  className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
