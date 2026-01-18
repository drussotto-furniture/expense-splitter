'use client'

import { useMemo } from 'react'
import { DollarSign, ArrowRight } from 'lucide-react'

interface Expense {
  id: string
  amount: number
  paid_by: string
}

interface Split {
  expense_id: string
  user_id: string
  amount: number
}

interface Member {
  user_id: string
  profile: {
    id: string
    full_name: string | null
    email: string
  }
}

interface BalancesCardProps {
  expenses: Expense[]
  splits: Split[]
  members: Member[]
  groupId: string
  currency: string
}

interface Balance {
  userId: string
  userName: string
  balance: number
}

interface Settlement {
  from: string
  to: string
  amount: number
  fromName: string
  toName: string
}

export default function BalancesCard({ expenses, splits, members, groupId, currency }: BalancesCardProps) {
  const { balances, settlements } = useMemo(() => {
    // Calculate balances
    const balanceMap = new Map<string, number>()
    const nameMap = new Map<string, string>()

    // Initialize with all active members (filter out pending members without profiles)
    members.forEach(member => {
      if (member.profile && member.user_id) {
        balanceMap.set(member.user_id, 0)
        nameMap.set(member.user_id, member.profile.full_name || member.profile.email)
      }
    })

    // Add amounts paid
    expenses.forEach(expense => {
      const current = balanceMap.get(expense.paid_by) || 0
      balanceMap.set(expense.paid_by, current + expense.amount)
    })

    // Subtract amounts owed
    splits.forEach(split => {
      const current = balanceMap.get(split.user_id) || 0
      balanceMap.set(split.user_id, current - split.amount)
    })

    // Convert to array
    const balances: Balance[] = Array.from(balanceMap.entries()).map(([userId, balance]) => ({
      userId,
      userName: nameMap.get(userId) || 'Unknown',
      balance: parseFloat(balance.toFixed(2)),
    }))

    // Calculate settlements using greedy algorithm
    const settlements: Settlement[] = []
    const debtors = balances.filter(b => b.balance < -0.01).map(b => ({ ...b }))
    const creditors = balances.filter(b => b.balance > 0.01).map(b => ({ ...b }))

    debtors.sort((a, b) => a.balance - b.balance)
    creditors.sort((a, b) => b.balance - a.balance)

    let i = 0
    let j = 0

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i]
      const creditor = creditors[j]
      const amount = Math.min(-debtor.balance, creditor.balance)

      if (amount > 0.01) {
        settlements.push({
          from: debtor.userId,
          to: creditor.userId,
          amount: parseFloat(amount.toFixed(2)),
          fromName: debtor.userName,
          toName: creditor.userName,
        })

        debtor.balance += amount
        creditor.balance -= amount
      }

      if (Math.abs(debtor.balance) < 0.01) i++
      if (Math.abs(creditor.balance) < 0.01) j++
    }

    return { balances, settlements }
  }, [expenses, splits, members])

  const formatCurrency = (amount: number) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: '$',
      AUD: '$',
      INR: '₹',
    }
    return `${symbols[currency] || currency} ${Math.abs(amount).toFixed(2)}`
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Balances</h3>
      </div>

      {/* Individual balances */}
      <div className="space-y-2 mb-6">
        {balances.map((balance) => (
          <div key={balance.userId} className="flex justify-between items-center">
            <span className="text-sm text-gray-900">{balance.userName}</span>
            <span
              className={`text-sm font-medium ${
                balance.balance > 0.01
                  ? 'text-green-600'
                  : balance.balance < -0.01
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              {balance.balance > 0.01
                ? `gets back ${formatCurrency(balance.balance)}`
                : balance.balance < -0.01
                ? `owes ${formatCurrency(balance.balance)}`
                : 'settled up'}
            </span>
          </div>
        ))}
      </div>

      {/* Settlements */}
      {settlements.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Suggested Payments</h4>
          <div className="space-y-3">
            {settlements.map((settlement, index) => (
              <div key={index} className="bg-blue-50 p-3 rounded-md">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{settlement.fromName}</span>
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                  <span className="font-medium text-gray-900">{settlement.toName}</span>
                </div>
                <div className="text-center mt-1">
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(settlement.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {settlements.length === 0 && expenses.length > 0 && (
        <div className="text-center text-sm text-gray-600 border-t pt-4">
          All settled up!
        </div>
      )}

      {expenses.length === 0 && (
        <div className="text-center text-sm text-gray-600">
          No expenses yet. Add an expense to see balances.
        </div>
      )}
    </div>
  )
}
