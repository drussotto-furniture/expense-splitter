import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Users, Mail } from 'lucide-react'
import LogoutButton from '@/components/auth/LogoutButton'
import NotificationBell from '@/components/notifications/NotificationBell'
import AddFriendButton from '@/components/friends/AddFriendButton'
import FriendCard from '@/components/friends/FriendCard'

export default async function FriendsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  // Count pending invitations
  const { count: pendingInvitations } = await supabase
    .from('invitations')
    .select('*', { count: 'exact', head: true })
    .eq('invited_email', profile?.email)
    .eq('status', 'pending')

  // Fetch accepted friends (where user is the requester)
  const { data: sentFriends } = await supabase
    .from('friends')
    .select(`
      *,
      profile:profiles!friends_friend_id_fkey (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false })

  // Fetch accepted friends (where user is the receiver)
  const { data: receivedFriends } = await supabase
    .from('friends')
    .select(`
      *,
      profile:profiles!friends_user_id_fkey (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('friend_id', user.id)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false })

  // Fetch pending friend requests received
  const { data: pendingRequests } = await supabase
    .from('friends')
    .select(`
      *,
      profile:profiles!friends_user_id_fkey (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('friend_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Fetch pending friend requests sent
  const { data: sentRequests } = await supabase
    .from('friends')
    .select(`
      *,
      profile:profiles!friends_friend_id_fkey (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Combine all accepted friends (remove duplicates)
  const allFriends = [
    ...(sentFriends || []),
    ...(receivedFriends || [])
  ]

  // Count pending friend requests received
  const pendingRequestsCount = pendingRequests?.length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expense Splitter</h1>
            <p className="text-sm text-gray-600">Welcome, {profile?.full_name || profile?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/groups"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Users className="h-4 w-4" />
              Groups
            </Link>
            <NotificationBell />
            <Link
              href="/invitations"
              className="relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Invitations
              {pendingInvitations && pendingInvitations > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingInvitations}
                </span>
              )}
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pending Friend Requests */}
        {pendingRequestsCount > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pending Friend Requests ({pendingRequestsCount})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests?.map((request) => (
                <FriendCard
                  key={request.id}
                  friend={request}
                  isPending={true}
                  isReceived={true}
                  currentUserId={user.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Sent Friend Requests */}
        {sentRequests && sentRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sent Requests ({sentRequests.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sentRequests.map((request) => (
                <FriendCard
                  key={request.id}
                  friend={request}
                  isPending={true}
                  isReceived={false}
                  currentUserId={user.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Your Friends {allFriends.length > 0 && `(${allFriends.length})`}
          </h2>
          <AddFriendButton currentUserId={user.id} />
        </div>

        {allFriends.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No friends yet</h3>
            <p className="text-gray-600 mb-6">Add friends to easily split expenses with them later</p>
            <AddFriendButton currentUserId={user.id} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allFriends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                isPending={false}
                isReceived={friend.friend_id === user.id}
                currentUserId={user.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
