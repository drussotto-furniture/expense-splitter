'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'

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
  const [notes, setNotes] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])
  const [splitType, setSplitType] = useState<'equal' | 'personal' | 'custom'>('equal')
  const [selectedMembers, setSelectedMembers] = useState<string[]>(activeMembers.map(m => getMemberId(m)))
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({})
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

      // Create the expense
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          group_id: groupId,
          description,
          amount: amountNum,
          currency,
          paid_by: user.id,
          category,
          notes: notes || null,
          expense_date: expenseDate,
          split_type: splitType,
        })
        .select()
        .single()

      if (expenseError) throw expenseError

      // Calculate splits
      let splits: { user_id: string; amount: number }[] = []

      if (splitType === 'equal') {
        const splitAmount = amountNum / selectedMembers.length
        splits = selectedMembers.map(userId => ({
          user_id: userId,
          amount: parseFloat(splitAmount.toFixed(2)),
        }))
      } else if (splitType === 'personal') {
        splits = [{
          user_id: user.id,
          amount: amountNum,
        }]
      } else if (splitType === 'custom') {
        splits = selectedMembers.map(userId => ({
          user_id: userId,
          amount: parseFloat(customAmounts[userId] || '0'),
        }))

        const totalCustom = splits.reduce((sum, s) => sum + s.amount, 0)
        if (Math.abs(totalCustom - amountNum) > 0.01) {
          throw new Error(`Custom amounts (${totalCustom}) must equal total amount (${amountNum})`)
        }
      }

      // Insert splits
      const { error: splitsError } = await supabase
        .from('expense_splits')
        .insert(
          splits.map(split => ({
            expense_id: expense.id,
            user_id: split.user_id,
            amount: split.amount,
            percentage: null,
          }))
        )

      if (splitsError) throw splitsError

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

  const resetForm = () => {
    setDescription('')
    setAmount('')
    setCategory('Food & Dining')
    setNotes('')
    setExpenseDate(new Date().toISOString().split('T')[0])
    setSplitType('equal')
    setSelectedMembers(activeMembers.map(m => m.user_id))
    setCustomAmounts({})
    setReceiptFile(null)
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
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
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
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
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
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
                        splitType === 'custom'
                          ? 'bg-slate-800 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setSplitType('custom')}
                    >
                      Custom
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
