'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UserPlus, X } from 'lucide-react'
import { logActivity } from '@/lib/actions/activity'

interface InviteMemberButtonProps {
  groupId: string
  groupName: string
}

interface UserSuggestion {
  id: string
  email: string
  full_name: string | null
}

export default function InviteMemberButton({ groupId, groupName }: InviteMemberButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeTab, setActiveTab] = useState<'search' | 'browse'>('search')
  const [allUsers, setAllUsers] = useState<UserSuggestion[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const searchUsers = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Search for users you've worked with in other groups
      const { data: pastMembers } = await supabase
        .from('group_members')
        .select(`
          user_id,
          profiles!inner (
            id,
            email,
            full_name
          )
        `)
        .neq('user_id', user.id)
        .eq('is_active', true)
        .or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`, { foreignTable: 'profiles' })
        .limit(5)

      if (pastMembers) {
        // Deduplicate and format
        const uniqueUsers = new Map<string, UserSuggestion>()
        pastMembers.forEach((member: any) => {
          if (member.profiles) {
            uniqueUsers.set(member.profiles.id, {
              id: member.profiles.id,
              email: member.profiles.email,
              full_name: member.profiles.full_name,
            })
          }
        })
        setSuggestions(Array.from(uniqueUsers.values()))
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error('Error searching users:', error)
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    searchUsers(value)
  }

  const selectSuggestion = (suggestion: UserSuggestion) => {
    setEmail(suggestion.email)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const loadAllUsers = async () => {
    setLoadingUsers(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get current group members to filter them out
      const { data: currentMembers } = await supabase
        .from('group_members')
        .select('user_id, pending_email')
        .eq('group_id', groupId)
        .eq('is_active', true)

      const currentMemberIds = new Set(
        currentMembers?.map(m => m.user_id).filter(Boolean) || []
      )
      const currentPendingEmails = new Set(
        currentMembers?.map(m => m.pending_email).filter(Boolean) || []
      )

      // Get all users you've worked with in any group
      const { data: pastMembers } = await supabase
        .from('group_members')
        .select(`
          user_id,
          profiles!inner (
            id,
            email,
            full_name
          )
        `)
        .neq('user_id', user.id)
        .eq('is_active', true)
        .eq('status', 'active')

      if (pastMembers) {
        // Deduplicate and filter out current members
        const uniqueUsers = new Map<string, UserSuggestion>()
        pastMembers.forEach((member: any) => {
          if (member.profiles &&
              !currentMemberIds.has(member.profiles.id) &&
              !currentPendingEmails.has(member.profiles.email)) {
            uniqueUsers.set(member.profiles.id, {
              id: member.profiles.id,
              email: member.profiles.email,
              full_name: member.profiles.full_name,
            })
          }
        })
        setAllUsers(Array.from(uniqueUsers.values()))
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    if (activeTab === 'browse') {
      loadAllUsers()
    }
  }

  const handleTabChange = (tab: 'search' | 'browse') => {
    setActiveTab(tab)
    if (tab === 'browse' && allUsers.length === 0) {
      loadAllUsers()
    }
  }

  const selectUser = async (user: UserSuggestion) => {
    setEmail(user.email)
    setActiveTab('search')
    // Auto-submit when selecting from browse
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      await addMember(user.email)
    } catch (err: any) {
      setError(err.message || 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  const addMember = async (emailToAdd: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if invitation already exists
    const { data: existingInvite } = await supabase
      .from('invitations')
      .select('id, status')
      .eq('group_id', groupId)
      .eq('invited_email', emailToAdd.toLowerCase())
      .eq('status', 'pending')
      .maybeSingle()

    if (existingInvite) {
      throw new Error('An invitation has already been sent to this email')
    }

    // Check if user profile exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('email', emailToAdd.toLowerCase())
      .maybeSingle()

    if (profile) {
      // User exists in the system - check if already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id, is_active, status')
        .eq('group_id', groupId)
        .eq('user_id', profile.id)
        .maybeSingle()

      if (existingMember) {
        if (existingMember.is_active === false || existingMember.status === 'inactive') {
          throw new Error('This user was previously removed from the group')
        }
        throw new Error('This user is already a member of the group')
      }

      // Check if this user is already a friend (accepted friendship)
      const { data: friendship } = await supabase
        .from('friends')
        .select('id, status')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${profile.id}),and(user_id.eq.${profile.id},friend_id.eq.${user.id})`)
        .eq('status', 'accepted')
        .maybeSingle()

      if (friendship) {
        // Already friends - add directly to group without invitation
        const { error: addMemberError } = await supabase
          .from('group_members')
          .insert({
            group_id: groupId,
            user_id: profile.id,
            role: 'member',
            status: 'active',
            is_active: true,
          })

        if (addMemberError) throw addMemberError

        // Log activity
        await logActivity({
          groupId,
          activityType: 'member_invited',
          details: {
            member_email: emailToAdd.toLowerCase(),
            member_name: profile.full_name || emailToAdd,
            added_directly: true,
            is_friend: true,
          },
        })

        // Send email notification
        try {
          await fetch('/api/notify-member-added', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              addedUserEmail: emailToAdd.toLowerCase(),
              addedUserName: profile.full_name || emailToAdd,
              groupName,
              groupId,
            }),
          })
        } catch (emailError) {
          console.error('Error sending notification email:', emailError)
        }

        setSuccessMessage(`${profile.full_name || emailToAdd} (your friend) has been added to the group!`)
      } else {
        // Not friends yet - create invitation (will auto-create friendship when accepted)
        const { error: inviteError } = await supabase
          .from('invitations')
          .insert({
            group_id: groupId,
            invited_by: user.id,
            invited_email: emailToAdd.toLowerCase(),
            status: 'pending',
          })

        if (inviteError) throw inviteError

        // Log activity
        await logActivity({
          groupId,
          activityType: 'member_invited',
          details: {
            member_email: emailToAdd.toLowerCase(),
            member_name: profile.full_name || emailToAdd,
            invited_to_join: true,
            will_create_friendship: true,
          },
        })

        // Send invitation email
        let emailSent = false
        try {
          const response = await fetch('/api/send-invitation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              invitedEmail: emailToAdd.toLowerCase(),
              groupName,
              groupId,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error('Failed to send invitation email:', errorData)
          } else {
            emailSent = true
          }
        } catch (emailError) {
          console.error('Error sending invitation email:', emailError)
        }

        if (emailSent) {
          setSuccessMessage(`Invitation sent to ${profile.full_name || emailToAdd}! You'll become friends when they accept.`)
        } else {
          setSuccessMessage(`Invitation created for ${profile.full_name || emailToAdd}. You'll become friends when they accept.`)
        }
      }
    } else {
      // User doesn't exist - create invitation
      const { error: inviteError } = await supabase
        .from('invitations')
        .insert({
          group_id: groupId,
          invited_by: user.id,
          invited_email: emailToAdd.toLowerCase(),
          status: 'pending',
        })

      if (inviteError) throw inviteError

      // Log activity
      await logActivity({
        groupId,
        activityType: 'member_invited',
        details: {
          member_email: emailToAdd.toLowerCase(),
          invited_to_join: true,
          will_create_friendship: true,
        },
      })

      // Send email notification
      let emailSent = false
      try {
        const response = await fetch('/api/send-invitation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            invitedEmail: emailToAdd.toLowerCase(),
            groupName,
            groupId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Failed to send invitation email:', errorData)
        } else {
          emailSent = true
        }
      } catch (emailError) {
        console.error('Error sending invitation email:', emailError)
      }

      if (emailSent) {
        setSuccessMessage(`Invitation sent to ${emailToAdd}! You'll become friends when they sign up and accept.`)
      } else {
        setSuccessMessage(`Invitation created for ${emailToAdd}. You'll become friends when they sign up and accept.`)
      }
    }

    setEmail('')
    setTimeout(() => {
      setIsOpen(false)
      setSuccessMessage(null)
      router.refresh()
    }, 4000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      await addMember(email)
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
      >
        <UserPlus className="h-4 w-4" />
        Invite Member
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add Member to {groupName}</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                type="button"
                onClick={() => handleTabChange('search')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'search'
                    ? 'text-slate-700 border-b-2 border-slate-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Search / Invite
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('browse')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'browse'
                    ? 'text-slate-700 border-b-2 border-slate-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Browse Members
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-gray-100 text-gray-800 text-sm rounded-md border border-gray-300">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-slate-100 text-slate-800 text-sm rounded-md border border-slate-300">
                {successMessage}
              </div>
            )}

            {/* Search Tab */}
            {activeTab === 'search' && (
              <form onSubmit={handleSubmit}>
                <div className="mb-6 relative">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address or Name
                  </label>
                  <input
                    type="text"
                    id="email"
                    required
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                    placeholder="Search for a user or enter email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onFocus={() => email.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                  />

                  {/* Suggestions dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          type="button"
                          onClick={() => selectSuggestion(suggestion)}
                          className="w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">
                            {suggestion.full_name || suggestion.email}
                          </div>
                          {suggestion.full_name && (
                            <div className="text-xs text-gray-600">{suggestion.email}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="mt-2 text-xs text-gray-500">
                    Start typing to see people you've worked with, or enter any email address.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !!successMessage}
                    className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Adding...' : successMessage ? 'Done!' : 'Add Member'}
                  </button>
                </div>
              </form>
            )}

            {/* Browse Tab */}
            {activeTab === 'browse' && (
              <div>
                {loadingUsers ? (
                  <div className="text-center py-8 text-gray-500">Loading users...</div>
                ) : allUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">No users found</p>
                    <p className="text-xs">You haven't worked with any other users yet.</p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-3">
                      Select a user you've worked with to add them to this group:
                    </p>
                    <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-md">
                      {allUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => selectUser(user)}
                          disabled={loading}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-gray-100 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="font-medium text-gray-900">
                            {user.full_name || user.email}
                          </div>
                          {user.full_name && (
                            <div className="text-xs text-gray-600">{user.email}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
