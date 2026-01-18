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
    console.log('Rescind clicked for friend invitation:', invitation.id)

    if (!confirm(`Are you sure you want to rescind the invitation to ${invitation.invited_email}?`)) {
      console.log('User cancelled rescind')
      return
    }

    console.log('User confirmed, starting rescind...')
    setLoading(true)
    setMessage(null)

    try {
      console.log('Sending POST request to /api/rescind-friend-invitation')
      const response = await fetch('/api/rescind-friend-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitationId: invitation.id,
        }),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to rescind invitation')
      }

      // Show how many rows were deleted for debugging
      setMessage(`Invitation rescinded (deleted: ${data.deleted})`)
      setIsRescinded(true)

      console.log('Will reload in 1 second...')
      setTimeout(() => {
        // Force cache bust with timestamp
        const newUrl = window.location.pathname + '?t=' + Date.now()
        console.log('Reloading to:', newUrl)
        window.location.href = newUrl
      }, 1000)
    } catch (error: any) {
      console.error('Error rescinding friend invitation:', error)
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
