'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UserMinus, X, AlertCircle } from 'lucide-react'
import { logActivity } from '@/lib/actions/activity'

interface RemoveMemberButtonProps {
  memberId: string
  memberName: string
  userId: string | null
  groupId: string
  isPending?: boolean
}

export default function RemoveMemberButton({
  memberId,
  memberName,
  userId,
  groupId,
  isPending = false
}: RemoveMemberButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasExpenses, setHasExpenses] = useState(false)
  const [expenseCount, setExpenseCount] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  const checkMemberExpenses = async () => {
    // Skip expense check for pending members
    if (isPending || !userId) {
      setHasExpenses(false)
      setExpenseCount(0)
      return
    }

    // Check if member has paid expenses or has splits
    const { data: paidExpenses } = await supabase
      .from('expenses')
      .select('id')
      .eq('group_id', groupId)
      .eq('paid_by', userId)

    const { data: splits } = await supabase
      .from('expense_splits')
      .select('expense_id')
      .eq('user_id', userId)

    const totalCount = (paidExpenses?.length || 0) + (splits?.length || 0)
    setExpenseCount(totalCount)
    setHasExpenses(totalCount > 0)
  }

  const handleOpen = async () => {
    setIsOpen(true)
    await checkMemberExpenses()
  }

  const handleRemove = async () => {
    setError(null)
    setLoading(true)

    try {
      if (isPending) {
        // For pending members, delete them entirely (no expense history)
        const { error: deleteError } = await supabase
          .from('group_members')
          .delete()
          .eq('id', memberId)

        if (deleteError) throw deleteError
      } else {
        // For active members, soft delete: set is_active to false
        const { error: updateError } = await supabase
          .from('group_members')
          .update({ is_active: false, status: 'inactive' })
          .eq('id', memberId)

        if (updateError) throw updateError
      }

      // Log activity
      await logActivity({
        groupId,
        activityType: 'member_removed',
        details: {
          member_name: memberName,
          was_pending: isPending || false,
        },
      })

      setIsOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to remove member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-gray-600 hover:text-gray-900 transition-colors"
        title="Remove member"
      >
        <UserMinus className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Remove Member</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Are you sure you want to {isPending ? 'cancel the invitation for' : 'remove'} <strong>{memberName}</strong> {isPending ? '' : 'from this group'}?
              </p>

              {isPending && (
                <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 mb-4 border border-yellow-200">
                  <p>This invitation will be cancelled and can be resent later if needed.</p>
                </div>
              )}

              {hasExpenses && (
                <div className="flex items-start gap-3 p-4 bg-slate-100 rounded-lg mb-4 border border-slate-300">
                  <AlertCircle className="h-5 w-5 text-slate-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">
                      Member has expense history
                    </p>
                    <p className="text-sm text-slate-700">
                      {memberName} is associated with {expenseCount} expense record{expenseCount !== 1 ? 's' : ''}.
                      They will be marked as inactive but their expense history will be preserved.
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 space-y-2">
                <p className="font-medium">What happens when you remove a member:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>They won't appear in new expense splits</li>
                  <li>Their past expenses remain visible in history</li>
                  <li>They will show as "(Inactive)" in expense records</li>
                  <li>They can be re-invited if needed</li>
                </ul>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-gray-100 text-gray-800 text-sm rounded-md border border-gray-300">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Removing...' : 'Remove Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
