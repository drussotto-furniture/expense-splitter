'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UserPlus, X } from 'lucide-react'

interface AddFriendButtonProps {
  currentUserId: string
}

interface UserSuggestion {
  id: string
  email: string
  full_name: string | null
}

export default function AddFriendButton({ currentUserId }: AddFriendButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
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

  const searchUsers = async (term: string) => {
    if (term.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Search for users by email or name
      const { data: users } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .neq('id', user.id)
        .or(`email.ilike.%${term}%,full_name.ilike.%${term}%`)
        .limit(5)

      if (users) {
        setSuggestions(users)
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error('Error searching users:', error)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    searchUsers(value)
  }

  const selectSuggestion = (suggestion: UserSuggestion) => {
    setSearchTerm(suggestion.email)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const loadAllUsers = async () => {
    setLoadingUsers(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get current friends to filter them out
      const { data: existingFriends } = await supabase
        .from('friends')
        .select('user_id, friend_id')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)

      const friendIds = new Set<string>()
      existingFriends?.forEach(f => {
        friendIds.add(f.user_id === user.id ? f.friend_id : f.user_id)
      })

      // Get all users from groups you've been in
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

      if (pastMembers) {
        // Deduplicate and filter out existing friends
        const uniqueUsers = new Map<string, UserSuggestion>()
        pastMembers.forEach((member: any) => {
          if (member.profiles && !friendIds.has(member.profiles.id)) {
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
    setSearchTerm(user.email)
    setActiveTab('search')
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      await addFriend(user.id, user.full_name || user.email)
    } catch (err: any) {
      setError(err.message || 'Failed to send friend request')
    } finally {
      setLoading(false)
    }
  }

  const addFriend = async (friendId: string, friendName: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if friendship already exists (in either direction)
    const { data: existingFriendship } = await supabase
      .from('friends')
      .select('id, status')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
      .single()

    if (existingFriendship) {
      if (existingFriendship.status === 'pending') {
        throw new Error('Friend request already pending')
      } else if (existingFriendship.status === 'accepted') {
        throw new Error('You are already friends with this user')
      } else if (existingFriendship.status === 'declined') {
        throw new Error('Friend request was previously declined')
      }
    }

    // Create friend request
    const { error: friendError } = await supabase
      .from('friends')
      .insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending',
      })

    if (friendError) throw friendError

    // TODO: Create notification for the friend request
    // This would integrate with the notifications system

    setSuccessMessage(`Friend request sent to ${friendName}!`)
    setSearchTerm('')
    setTimeout(() => {
      setIsOpen(false)
      setSuccessMessage(null)
      router.refresh()
    }, 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      // Find user by email or name
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .or(`email.eq.${searchTerm.toLowerCase()},full_name.ilike.${searchTerm}`)
        .limit(1)

      if (!profiles || profiles.length === 0) {
        throw new Error('User not found. They may need to create an account first.')
      }

      await addFriend(profiles[0].id, profiles[0].full_name || profiles[0].email)
    } catch (err: any) {
      setError(err.message || 'Failed to send friend request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
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
                Search
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
                Browse
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

            {/* Search Tab */}
            {activeTab === 'search' && (
              <form onSubmit={handleSubmit}>
                <div className="mb-6 relative">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address or Name
                  </label>
                  <input
                    type="text"
                    id="search"
                    required
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                    placeholder="Search for a user"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => searchTerm.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
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
                    Start typing to search for users by email or name.
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
                    {loading ? 'Sending...' : successMessage ? 'Sent!' : 'Send Request'}
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
                      Select a user you've worked with to send them a friend request:
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
