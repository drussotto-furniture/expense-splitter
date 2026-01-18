'use client'

import { useState, useMemo } from 'react'
import { Receipt, Image as ImageIcon, X, ArrowUpDown } from 'lucide-react'
import DeleteExpenseButton from './DeleteExpenseButton'
import EditExpenseButton from './EditExpenseButton'

interface Expense {
  id: string
  description: string
  amount: number
  currency: string
  paid_by: string | null
  paid_by_pending_member: string | null
  created_by: string
  category: string
  notes: string | null
  receipt_url: string | null
  expense_date: string
  split_type: string
  payer: {
    id: string
    full_name: string | null
    email: string
  } | null
  pending_payer: {
    id: string
    pending_email: string | null
  } | null
}

interface Split {
  id: string
  expense_id: string
  user_id: string | null
  pending_member_id: string | null
  amount: number
  profile: {
    id: string
    full_name: string | null
    email: string
  } | null
  pending_member: {
    id: string
    pending_email: string | null
  } | null
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
  isGroupAdmin: boolean
}

export default function ExpenseList({ expenses, splits, groupId, currentUserId, members, currency, isGroupAdmin }: ExpenseListProps) {
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPayer, setFilterPayer] = useState<string>('all')

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

  // Get unique categories and payers for filters
  const categories = useMemo(() => {
    const uniqueCategories = new Set(expenses.map(e => e.category))
    return ['all', ...Array.from(uniqueCategories).sort()]
  }, [expenses])

  const payers = useMemo(() => {
    const uniquePayers = new Map<string, string>()
    expenses.forEach(e => {
      if (e.pending_payer) {
        uniquePayers.set(e.paid_by_pending_member || '', e.pending_payer.pending_email || 'Pending User')
      } else if (e.payer) {
        uniquePayers.set(e.paid_by || '', e.payer.full_name || e.payer.email)
      }
    })
    return [
      { id: 'all', name: 'All Payers' },
      ...Array.from(uniquePayers.entries()).map(([id, name]) => ({ id, name }))
    ]
  }, [expenses])

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = [...expenses]

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(e => e.category === filterCategory)
    }

    // Apply payer filter
    if (filterPayer !== 'all') {
      filtered = filtered.filter(e =>
        (e.paid_by && e.paid_by === filterPayer) ||
        (e.paid_by_pending_member && e.paid_by_pending_member === filterPayer)
      )
    }

    // Sort expenses
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'date':
          // Parse dates properly (expense_date is in YYYY-MM-DD format)
          const dateA = new Date(a.expense_date + 'T00:00:00').getTime()
          const dateB = new Date(b.expense_date + 'T00:00:00').getTime()
          comparison = dateA - dateB
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'description':
          comparison = a.description.localeCompare(b.description)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    console.log('Sorted expenses:', {
      sortBy,
      sortOrder,
      expenses: filtered.slice(0, 5).map(e => ({
        description: e.description,
        date: e.expense_date,
        timestamp: new Date(e.expense_date + 'T00:00:00').getTime()
      }))
    })

    return filtered
  }, [expenses, filterCategory, filterPayer, sortBy, sortOrder])

  const toggleSort = (field: 'date' | 'amount' | 'description') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
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
      {/* Filters and Sort Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Payer Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paid By
            </label>
            <select
              value={filterPayer}
              onChange={(e) => setFilterPayer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              {payers.map(payer => (
                <option key={payer.id} value={payer.id}>
                  {payer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Controls */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => toggleSort('date')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  sortBy === 'date'
                    ? 'bg-slate-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => toggleSort('amount')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  sortBy === 'amount'
                    ? 'bg-slate-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Amount {sortBy === 'amount' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => toggleSort('description')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  sortBy === 'description'
                    ? 'bg-slate-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Name {sortBy === 'description' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredAndSortedExpenses.length} of {expenses.length} expenses
        </div>
      </div>

      {/* Expense List */}
      {filteredAndSortedExpenses.map((expense) => {
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
                    Paid by {
                      expense.pending_payer
                        ? `${expense.pending_payer.pending_email} (Pending)`
                        : (expense.payer?.full_name || expense.payer?.email || 'Unknown')
                    }
                  </div>
                </div>
                {(expense.created_by === currentUserId || isGroupAdmin) && (
                  <div className="flex items-center gap-2">
                    <EditExpenseButton
                      expense={expense as any}
                      splits={(() => {
                        const mapped = expenseSplits.map(s => ({
                          user_id: s.user_id,
                          pending_member_id: s.pending_member_id,
                          amount: s.amount
                        }))
                        console.log('Passing splits to EditExpenseButton:', {
                          expenseId: expense.id,
                          expenseDescription: expense.description,
                          expenseSplitsLength: expenseSplits.length,
                          mappedLength: mapped.length,
                          mapped: JSON.stringify(mapped)
                        })
                        return mapped
                      })()}
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
                  const isActive = split.user_id ? isMemberActive(split.user_id) : true
                  return (
                    <span
                      key={split.id}
                      className={`text-xs px-2 py-1 rounded ${
                        isActive
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {split.pending_member?.pending_email
                        ? `${split.pending_member.pending_email} (Pending)`
                        : (split.profile?.full_name || split.profile?.email || 'Unknown User')}
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
