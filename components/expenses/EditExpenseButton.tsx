'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Edit, X } from 'lucide-react'
import type { Expense } from '@/types'
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

interface Split {
  user_id: string | null
  pending_member_id: string | null
  amount: number
}

interface EditExpenseButtonProps {
  expense: Pick<Expense, 'id' | 'description' | 'amount' | 'currency' | 'category' | 'notes' | 'receipt_url' | 'expense_date' | 'split_type' | 'paid_by' | 'paid_by_pending_member'>
  splits: Split[]
  members: Member[]
  groupId: string
}

export default function EditExpenseButton({ expense, splits, members, groupId }: EditExpenseButtonProps) {
  // Include active and pending members (exclude only inactive)
  const activeMembers = members.filter(m => m.is_active !== false)

  // Helper to get member identifier (user_id for active, id for pending)
  const getMemberId = (member: Member) => member.user_id || member.id

  const [isOpen, setIsOpen] = useState(false)
  const [description, setDescription] = useState(expense.description)
  const [amount, setAmount] = useState(expense.amount.toString())
  const [category, setCategory] = useState(expense.category)
  const [paidBy, setPaidBy] = useState(() => {
    // Initialize paidBy with either user_id or the pending member's id
    if (expense.paid_by) {
      return expense.paid_by
    } else if (expense.paid_by_pending_member) {
      // Find the pending member and return its id
      const pendingMember = activeMembers.find(m => m.id === expense.paid_by_pending_member)
      return pendingMember ? getMemberId(pendingMember) : expense.paid_by_pending_member
    }
    return expense.paid_by || ''
  })
  const [notes, setNotes] = useState(expense.notes || '')
  const [expenseDate, setExpenseDate] = useState(expense.expense_date)
  const [splitType, setSplitType] = useState<'equal' | 'personal' | 'custom' | 'percentage' | 'shares'>(
    expense.split_type as any
  )

  // Initialize selectedMembers by finding the members who have splits
  const [selectedMembers, setSelectedMembers] = useState<string[]>(() => {
    console.log('Initializing selectedMembers', {
      splitsLength: splits.length,
      splits: JSON.stringify(splits),
      activeMembersLength: activeMembers.length,
      activeMembers: JSON.stringify(activeMembers.map(m => ({ id: m.id, user_id: m.user_id, status: m.status })))
    })
    const result = splits.map(split => {
      // Find the member by user_id or pending_member_id
      const member = split.user_id
        ? activeMembers.find(m => m.user_id === split.user_id)
        : activeMembers.find(m => m.id === split.pending_member_id)
      console.log('Split match:', { split: JSON.stringify(split), foundMember: !!member, memberId: member ? getMemberId(member) : null })
      return member ? getMemberId(member) : null
    }).filter(Boolean) as string[]
    console.log('Selected members result:', result)
    return result
  })

  // Initialize custom amounts from splits
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>(() => {
    const amounts: Record<string, string> = {}
    splits.forEach(split => {
      const member = split.user_id
        ? activeMembers.find(m => m.user_id === split.user_id)
        : activeMembers.find(m => m.id === split.pending_member_id)
      if (member) {
        const memberId = getMemberId(member)
        amounts[memberId] = split.amount.toString()
        console.log('Setting custom amount:', { memberId, amount: split.amount })
      } else {
        console.log('Could not find member for split:', split)
      }
    })
    console.log('Custom amounts initialized:', amounts)
    return amounts
  })

  // Initialize percentages from splits if split type is percentage
  const [percentages, setPercentages] = useState<Record<string, string>>(() => {
    if (expense.split_type !== 'percentage') return {}
    const amountNum = expense.amount
    const percentages: Record<string, string> = {}
    splits.forEach(split => {
      const member = split.user_id
        ? activeMembers.find(m => m.user_id === split.user_id)
        : activeMembers.find(m => m.id === split.pending_member_id)
      if (member) {
        const percentage = (split.amount / amountNum) * 100
        percentages[getMemberId(member)] = percentage.toFixed(1)
      }
    })
    return percentages
  })

  // Initialize shares from splits if split type is shares
  const [shares, setShares] = useState<Record<string, string>>(() => {
    if (expense.split_type !== 'shares') return {}
    // For shares, we need to calculate the ratio
    // We'll just use the amounts as shares (simplified approach)
    const shares: Record<string, string> = {}
    const minAmount = Math.min(...splits.map(s => s.amount))
    splits.forEach(split => {
      const member = split.user_id
        ? activeMembers.find(m => m.user_id === split.user_id)
        : activeMembers.find(m => m.id === split.pending_member_id)
      if (member && minAmount > 0) {
        const shareValue = split.amount / minAmount
        shares[getMemberId(member)] = shareValue.toFixed(1)
      }
    })
    return shares
  })

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
      const payerMember = activeMembers.find(m => getMemberId(m) === paidBy)

      // Update the expense
      const { error: expenseError } = await supabase
        .from('expenses')
        .update({
          description,
          amount: amountNum,
          category,
          ...(payerMember?.user_id
            ? { paid_by: payerMember.user_id, paid_by_pending_member: null }
            : { paid_by: null, paid_by_pending_member: payerMember!.id }
          ),
          notes: notes || null,
          expense_date: expenseDate,
          split_type: splitType,
        })
        .eq('id', expense.id)

      if (expenseError) throw expenseError

      // Delete existing splits
      const { error: deleteSplitsError } = await supabase
        .from('expense_splits')
        .delete()
        .eq('expense_id', expense.id)

      if (deleteSplitsError) throw deleteSplitsError

      // Calculate new splits - now supports both active and pending members
      let newSplits: { user_id?: string; pending_member_id?: string; amount: number }[] = []

      if (splitType === 'equal') {
        const splitAmount = amountNum / selectedMembers.length
        newSplits = selectedMembers.map(memberId => {
          const member = activeMembers.find(m => getMemberId(m) === memberId)
          return {
            ...(member?.user_id ? { user_id: member.user_id } : { pending_member_id: member!.id }),
            amount: parseFloat(splitAmount.toFixed(2)),
          }
        })
      } else if (splitType === 'personal') {
        newSplits = [{
          user_id: user.id,
          amount: amountNum,
        }]
      } else if (splitType === 'custom') {
        const totalCustom = selectedMembers.reduce((sum, memberId) => {
          return sum + parseFloat(customAmounts[memberId] || '0')
        }, 0)

        if (Math.abs(totalCustom - amountNum) > 0.01) {
          throw new Error(`Custom amounts (${totalCustom}) must equal total amount (${amountNum})`)
        }

        newSplits = selectedMembers.map(memberId => {
          const member = activeMembers.find(m => getMemberId(m) === memberId)
          return {
            ...(member?.user_id ? { user_id: member.user_id } : { pending_member_id: member!.id }),
            amount: parseFloat(customAmounts[memberId] || '0'),
          }
        })
      } else if (splitType === 'percentage') {
        const totalPercentage = selectedMembers.reduce((sum, memberId) => {
          return sum + parseFloat(percentages[memberId] || '0')
        }, 0)

        if (Math.abs(totalPercentage - 100) > 0.01) {
          throw new Error(`Percentages (${totalPercentage.toFixed(1)}%) must equal 100%`)
        }

        newSplits = selectedMembers.map(memberId => {
          const member = activeMembers.find(m => getMemberId(m) === memberId)
          const percentage = parseFloat(percentages[memberId] || '0')
          const amount = (amountNum * percentage) / 100
          return {
            ...(member?.user_id ? { user_id: member.user_id } : { pending_member_id: member!.id }),
            amount: parseFloat(amount.toFixed(2)),
          }
        })
      } else if (splitType === 'shares') {
        const totalShares = selectedMembers.reduce((sum, memberId) => {
          return sum + parseFloat(shares[memberId] || '0')
        }, 0)

        if (totalShares === 0) {
          throw new Error('Total shares must be greater than 0')
        }

        newSplits = selectedMembers.map(memberId => {
          const member = activeMembers.find(m => getMemberId(m) === memberId)
          const memberShares = parseFloat(shares[memberId] || '0')
          const amount = (amountNum * memberShares) / totalShares
          return {
            ...(member?.user_id ? { user_id: member.user_id } : { pending_member_id: member!.id }),
            amount: parseFloat(amount.toFixed(2)),
          }
        })
      }

      // Insert new splits
      const { error: splitsError } = await supabase
        .from('expense_splits')
        .insert(
          newSplits.map(split => ({
            expense_id: expense.id,
            ...(split.user_id ? { user_id: split.user_id } : { pending_member_id: split.pending_member_id }),
            amount: split.amount,
          }))
        )

      if (splitsError) throw splitsError

      // Track what changed
      const changes: string[] = []
      if (description !== expense.description) {
        changes.push(`Description: "${expense.description}" → "${description}"`)
      }
      if (amountNum !== expense.amount) {
        changes.push(`Amount: ${expense.currency} ${expense.amount} → ${expense.currency} ${amountNum}`)
      }
      if (category !== expense.category) {
        changes.push(`Category: ${expense.category} → ${category}`)
      }
      if (expenseDate !== expense.expense_date) {
        changes.push(`Date: ${expense.expense_date} → ${expenseDate}`)
      }
      if (splitType !== expense.split_type) {
        changes.push(`Split type: ${expense.split_type} → ${splitType}`)
      }
      const oldPaidBy = expense.paid_by || expense.paid_by_pending_member
      if (paidBy !== oldPaidBy) {
        const oldPayer = activeMembers.find(m => getMemberId(m) === oldPaidBy)
        const newPayer = activeMembers.find(m => getMemberId(m) === paidBy)
        const oldPayerName = oldPayer?.profile?.full_name || oldPayer?.profile?.email || oldPayer?.pending_email || 'Unknown'
        const newPayerName = newPayer?.profile?.full_name || newPayer?.profile?.email || newPayer?.pending_email || 'Unknown'
        changes.push(`Paid by: ${oldPayerName} → ${newPayerName}`)
      }

      // Log activity
      await logActivity({
        groupId,
        activityType: 'expense_updated',
        details: {
          expense_id: expense.id,
          description,
          old_description: expense.description,
          amount: amountNum,
          currency: expense.currency,
          category,
          split_type: splitType,
          changes,
        },
      })

      // Upload new receipt if provided
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop()
        const fileName = `${expense.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, receiptFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Receipt upload error:', uploadError)
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('receipts')
            .getPublicUrl(fileName)

          await supabase
            .from('expenses')
            .update({ receipt_url: publicUrl })
            .eq('id', expense.id)
        }
      }

      setIsOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to update expense')
    } finally {
      setLoading(false)
    }
  }

  const toggleMember = (userId: string) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId))
    } else {
      setSelectedMembers([...selectedMembers, userId])
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-400 hover:text-blue-600 transition-colors"
        title="Edit expense"
      >
        <Edit className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Edit Expense</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-800 text-sm rounded-md">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What was this expense for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount ({expense.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    required
                  >
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Add any additional details"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {expense.receipt_url ? 'Replace Receipt (optional)' : 'Add Receipt (optional)'}
                  </label>
                  {expense.receipt_url && (
                    <p className="text-xs text-gray-600 mb-2">
                      Current receipt will be kept unless you upload a new one
                    </p>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  />
                  {receiptFile && (
                    <p className="mt-2 text-xs text-gray-600">
                      New receipt: {receiptFile.name}
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
                          ? 'bg-blue-600 text-white'
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
                          ? 'bg-blue-600 text-white'
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
                          ? 'bg-blue-600 text-white'
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
                          ? 'bg-blue-600 text-white'
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
                          ? 'bg-blue-600 text-white'
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
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                              className="ml-auto w-24 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
