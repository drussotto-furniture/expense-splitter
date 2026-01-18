'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UserMinus, X } from 'lucide-react'

interface RemoveFriendButtonProps {
  friendId: string
  friendName: string
}

export default function RemoveFriendButton({ friendId, friendName }: RemoveFriendButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleRemove = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendId)

      if (deleteError) throw deleteError

      setIsOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to remove friend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 px-3 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
      >
        <UserMinus className="h-3 w-3" />
        Remove
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Remove Friend</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                {error}
              </div>
            )}

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to remove <span className="font-semibold">{friendName}</span> from your friends list?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                You can always send them a new friend request later.
              </p>
            </div>

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
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Removing...' : 'Remove Friend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
