'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Users, Check, X } from 'lucide-react'

interface InvitationCardProps {
  invitation: {
    id: string
    group: {
      id: string
      name: string
      base_currency: string
    }
    inviter: {
      full_name: string | null
      email: string
    }
    created_at: string
  }
}

export default function InvitationCard({ invitation }: InvitationCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleAccept = async () => {
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check if already an active member
      const { data: existingActiveMember } = await supabase
        .from('group_members')
        .select('id, status')
        .eq('group_id', invitation.group.id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (existingActiveMember) {
        throw new Error('You are already a member of this group')
      }

      // Update invitation status first (this will trigger the database trigger to activate member)
      const { error: inviteError } = await supabase
        .from('invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id)

      if (inviteError) throw inviteError

      // Redirect to the group
      router.push(`/groups/${invitation.group.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleDecline = async () => {
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'declined' })
        .eq('id', invitation.id)

      if (error) throw error

      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to decline invitation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="bg-slate-100 rounded-lg p-3">
            <Users className="h-6 w-6 text-slate-800" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {invitation.group.name}
            </h3>
            <p className="text-sm text-gray-600">
              Invited by {invitation.inviter.full_name || invitation.inviter.email}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(invitation.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-gray-100 text-gray-800 text-sm rounded-md border border-gray-300">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleAccept}
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="h-4 w-4" />
          Accept
        </button>
        <button
          onClick={handleDecline}
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-4 w-4" />
          Decline
        </button>
      </div>
    </div>
  )
}
