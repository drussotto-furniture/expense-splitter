'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Trash2, X, AlertTriangle } from 'lucide-react'

interface DeleteGroupButtonProps {
  groupId: string
  groupName: string
  memberCount: number
  expenseCount: number
}

export default function DeleteGroupButton({
  groupId,
  groupName,
  memberCount,
  expenseCount
}: DeleteGroupButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setError(null)
    setLoading(true)

    try {
      // Get all expenses in the group
      const { data: expenses } = await supabase
        .from('expenses')
        .select('id')
        .eq('group_id', groupId)

      const expenseIds = expenses?.map(e => e.id) || []

      // Delete expense splits first
      if (expenseIds.length > 0) {
        const { error: splitsError } = await supabase
          .from('expense_splits')
          .delete()
          .in('expense_id', expenseIds)

        if (splitsError) throw splitsError
      }

      // Delete expenses
      const { error: expensesError } = await supabase
        .from('expenses')
        .delete()
        .eq('group_id', groupId)

      if (expensesError) throw expensesError

      // Delete settlements
      const { error: settlementsError } = await supabase
        .from('settlements')
        .delete()
        .eq('group_id', groupId)

      if (settlementsError) throw settlementsError

      // Delete invitations
      const { error: invitationsError } = await supabase
        .from('invitations')
        .delete()
        .eq('group_id', groupId)

      if (invitationsError) throw invitationsError

      // Delete group members
      const { error: membersError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)

      if (membersError) throw membersError

      // Delete the group
      const { error: groupError } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId)

      if (groupError) throw groupError

      router.push('/groups')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to delete group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
        Delete Group
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Delete Group</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-start gap-3 p-4 bg-gray-100 rounded-lg mb-4 border border-gray-300">
                <AlertTriangle className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Warning: This action cannot be undone
                  </p>
                  <p className="text-sm text-gray-700">
                    This will permanently delete all data associated with this group.
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-3">
                Are you sure you want to delete <strong>{groupName}</strong>?
              </p>

              <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 space-y-1">
                <p>This will delete:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{expenseCount} expense{expenseCount !== 1 ? 's' : ''} and their splits</li>
                  <li>{memberCount} group member{memberCount !== 1 ? 's' : ''}</li>
                  <li>All invitations</li>
                  <li>All settlements</li>
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
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Deleting...' : 'Delete Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
