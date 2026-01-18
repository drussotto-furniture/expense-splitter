'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UserPlus, X } from 'lucide-react'

interface AddFriendButtonProps {
  currentUserId: string
}

export default function AddFriendButton({ currentUserId }: AddFriendButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      const emailLower = email.toLowerCase().trim()

      if (!validateEmail(emailLower)) {
        throw new Error('Please enter a valid email address')
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check if trying to add yourself
      const { data: ownProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single()

      if (ownProfile?.email?.toLowerCase() === emailLower) {
        throw new Error("You can't add yourself as a friend")
      }

      // Check if user exists in the system
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', emailLower)
        .single()

      if (targetProfile) {
        // User exists - create a direct friend request
        // Check if friendship already exists (in either direction)
        const { data: existingFriendship } = await supabase
          .from('friends')
          .select('id, status, user_id, friend_id')
          .or(`and(user_id.eq.${user.id},friend_id.eq.${targetProfile.id}),and(user_id.eq.${targetProfile.id},friend_id.eq.${user.id})`)
          .single()

        if (existingFriendship) {
          if (existingFriendship.status === 'pending') {
            // Check if WE sent the request or THEY sent it
            if (existingFriendship.user_id === user.id) {
              throw new Error('You already sent a friend request to this user')
            } else {
              throw new Error('This user already sent you a friend request. Check your pending requests!')
            }
          } else if (existingFriendship.status === 'accepted') {
            throw new Error('You are already friends with this user')
          } else if (existingFriendship.status === 'declined') {
            throw new Error('This friend request was previously declined')
          }
        }

        // Create friend request
        const { error: friendError } = await supabase
          .from('friends')
          .insert({
            user_id: user.id,
            friend_id: targetProfile.id,
            status: 'pending',
          })

        if (friendError) throw friendError

        // TODO: Send email notification to the target user
        setSuccessMessage(`Friend request sent to ${targetProfile.full_name || targetProfile.email}!`)
      } else {
        // User doesn't exist yet - they'll need to sign up
        // For now, show a message telling them the user needs an account
        throw new Error(`${emailLower} doesn't have an account yet. They need to sign up first before you can add them as a friend.`)
      }

      setEmail('')
      setTimeout(() => {
        setIsOpen(false)
        setSuccessMessage(null)
        router.refresh()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to send friend request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
      >
        <UserPlus className="h-4 w-4" />
        Add Friend
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add Friend</h2>
              <button
                onClick={() => {
                  setIsOpen(false)
                  setEmail('')
                  setError(null)
                  setSuccessMessage(null)
                }}
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

            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Friend's Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter the email address of the person you want to add as a friend.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    setEmail('')
                    setError(null)
                    setSuccessMessage(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !!successMessage}
                  className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : successMessage ? 'Sent!' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
