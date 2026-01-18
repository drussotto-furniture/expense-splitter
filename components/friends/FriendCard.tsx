'use client'

import { User, Check, X } from 'lucide-react'
import { Friend } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import RemoveFriendButton from './RemoveFriendButton'

interface FriendCardProps {
  friend: Friend
  isPending: boolean
  isReceived: boolean
  currentUserId: string
}

export default function FriendCard({ friend, isPending, isReceived, currentUserId }: FriendCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()

  const handleAccept = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error: updateError } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', friend.id)

      if (updateError) throw updateError

      setSuccess('Friend request accepted!')
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to accept friend request')
    } finally {
      setLoading(false)
    }
  }

  const handleDecline = async () => {
    setLoading(true)
    setError('')

    try {
      const { error: deleteError } = await supabase
        .from('friends')
        .delete()
        .eq('id', friend.id)

      if (deleteError) throw deleteError

      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to decline friend request')
      setLoading(false)
    }
  }

  const friendProfile = friend.profile
  const displayName = friendProfile?.full_name || friendProfile?.email || 'Unknown User'
  const displayEmail = friendProfile?.email

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-blue-100 rounded-full p-3 mr-3">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
            {displayEmail && (
              <p className="text-sm text-gray-600">{displayEmail}</p>
            )}
          </div>
        </div>
      </div>

      {isPending && isReceived && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="h-4 w-4" />
            {loading ? 'Accepting...' : 'Accept'}
          </button>
          <button
            onClick={handleDecline}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" />
            Decline
          </button>
        </div>
      )}

      {isPending && !isReceived && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Waiting for response...</p>
          <button
            onClick={handleDecline}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" />
            {loading ? 'Cancelling...' : 'Cancel Request'}
          </button>
        </div>
      )}

      {!isPending && (
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Friends since {new Date(friend.created_at).toLocaleDateString()}
          </p>
          <RemoveFriendButton friendId={friend.id} friendName={displayName} />
        </div>
      )}
    </div>
  )
}
