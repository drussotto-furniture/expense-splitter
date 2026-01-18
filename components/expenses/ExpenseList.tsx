'use client'

import { useState } from 'react'
import { Receipt, Image as ImageIcon, X } from 'lucide-react'
import DeleteExpenseButton from './DeleteExpenseButton'
import EditExpenseButton from './EditExpenseButton'

interface Expense {
  id: string
  description: string
  amount: number
  currency: string
  paid_by: string
  category: string
  notes: string | null
  receipt_url: string | null
  expense_date: string
  split_type: string
  payer: {
    id: string
    full_name: string | null
    email: string
  }
}

interface Split {
  id: string
  expense_id: string
  user_id: string
  amount: number
  profile: {
    id: string
    full_name: string | null
    email: string
  }
}

interface Member {
  user_id: string
  is_active: boolean
}

interface ExpenseListProps {
  expenses: Expense[]
  splits: Split[]
  groupId: string
  currentUserId: string
  members: Member[]
  currency: string
}

export default function ExpenseList({ expenses, splits, groupId, currentUserId, members, currency }: ExpenseListProps) {
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null)

  const getExpenseSplits = (expenseId: string) => {
    return splits.filter(split => split.expense_id === expenseId)
  }

  const isMemberActive = (userId: string) => {
    const member = members.find(m => m.user_id === userId)
    return member?.is_active ?? true
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: '$',
      AUD: '$',
      INR: '₹',
    }
    return `${symbols[currency] || currency} ${amount.toFixed(2)}`
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
        <p className="text-gray-600">Add your first expense to start tracking</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => {
        const expenseSplits = getExpenseSplits(expense.id)

        return (
          <div key={expense.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{expense.description}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <span className="bg-gray-100 px-2 py-1 rounded">{expense.category}</span>
                  <span>{new Date(expense.expense_date + 'T00:00:00').toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(expense.amount, expense.currency)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Paid by {expense.payer.full_name || expense.payer.email}
                  </div>
                </div>
                {expense.paid_by === currentUserId && (
                  <div className="flex items-center gap-2">
                    <EditExpenseButton
                      expense={expense as any}
                      splits={expenseSplits.map(s => ({
                        user_id: s.user_id,
                        amount: s.amount
                      }))}
                      members={members as any}
                      groupId={groupId}
                    />
                    <DeleteExpenseButton
                      expenseId={expense.id}
                      expenseDescription={expense.description}
                    />
                  </div>
                )}
              </div>
            </div>

            {expense.notes && (
              <p className="text-sm text-gray-600 mb-2">{expense.notes}</p>
            )}

            {expense.receipt_url && (
              <div className="mb-2">
                <button
                  onClick={() => setViewingReceipt(expense.receipt_url)}
                  className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900"
                >
                  <ImageIcon className="h-4 w-4" />
                  View Receipt
                </button>
              </div>
            )}

            <div className="border-t pt-2 mt-2">
              <div className="text-sm text-gray-600 mb-1">
                Split {expense.split_type}ly:
              </div>
              <div className="flex flex-wrap gap-2">
                {expenseSplits.map((split) => {
                  const isActive = isMemberActive(split.user_id)
                  return (
                    <span
                      key={split.id}
                      className={`text-xs px-2 py-1 rounded ${
                        isActive
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {split.profile?.full_name || split.profile?.email || 'Unknown User'}
                      {!isActive && ' (Inactive)'}: {formatCurrency(split.amount, expense.currency)}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}

      {viewingReceipt && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setViewingReceipt(null)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setViewingReceipt(null)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={viewingReceipt}
              alt="Receipt"
              className="w-full h-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
