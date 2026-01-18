'use client'

import { useState } from 'react'
import { Mail, X } from 'lucide-react'

interface FriendInvitationCardProps {
  invitation: {
    id: string
    invited_email: string
    created_at: string
  }
}

export default function FriendInvitationCard({ invitation }: FriendInvitationCardProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isRescinded, setIsRescinded] = useState(false)

  const handleRescind = async () => {
    if (!confirm(`Are you sure you want to rescind the invitation to ${invitation.invited_email}?`)) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/rescind-friend-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitationId: invitation.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to rescind invitation')
      }

      setMessage('Invitation rescinded')
      setIsRescinded(true)
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      setMessage(error.message || 'Failed to rescind invitation')
    } finally {
      setLoading(false)
    }
  }

  if (isRescinded) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {invitation.invited_email}
          </h3>
          <p className="text-sm text-gray-600">
            Friend invitation sent
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(invitation.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {message && (
        <div className={`mb-3 p-2 text-sm rounded-md ${
          message.includes('Failed') || message.includes('error')
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
        <Mail className="h-4 w-4" />
        <span>Waiting for them to sign up</span>
      </div>

      <button
        onClick={handleRescind}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <X className="h-4 w-4" />
        {loading ? 'Rescinding...' : 'Rescind Invitation'}
      </button>
    </div>
  )
}
