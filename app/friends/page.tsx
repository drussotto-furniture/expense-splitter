import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import AppHeader from '@/components/navigation/AppHeader'
import AddFriendButton from '@/components/friends/AddFriendButton'
import FriendCard from '@/components/friends/FriendCard'
import Link from 'next/link'

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

  // Fetch pending group invitations
  const { data: pendingGroupInvitations, error: invitationsError } = await supabase
    .from('invitations')
    .select(`
      *,
      group:groups (
        id,
        name,
        base_currency
      ),
      inviter:profiles!invitations_invited_by_fkey (
        id,
        email,
        full_name
      )
    `)
    .eq('invited_email', profile?.email)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const pendingInvitations = pendingGroupInvitations?.length || 0

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

  // Fetch pending friend requests sent (to existing users)
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

  // Fetch friend invitations sent (to non-users)
  const { data: sentInvitations } = await supabase
    .from('friend_invitations')
    .select('*')
    .eq('inviter_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false})

  // Fetch group invitations sent by this user
  const { data: sentGroupInvitations } = await supabase
    .from('invitations')
    .select(`
      *,
      group:groups (
        id,
        name,
        base_currency
      )
    `)
    .eq('invited_by', user.id)
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
      <AppHeader
        userName={profile?.full_name}
        userEmail={profile?.email}
        pendingInvitations={pendingInvitations}
      />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pending Group Invitations */}
        {pendingInvitations > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pending Group Invitations ({pendingInvitations})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingGroupInvitations?.map((invitation) => (
                <div key={invitation.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {invitation.group?.name || 'Unknown Group'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Invited by {invitation.inviter?.full_name || invitation.inviter?.email || 'Someone'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Currency: {invitation.group?.base_currency || 'USD'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/invitations"
                      className="flex-1 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-900 transition-colors text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

        {/* Pending Friend Invitations (sent to non-users) */}
        {sentInvitations && sentInvitations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pending Friend Invitations ({sentInvitations.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sentInvitations.map((invitation) => (
                <div key={invitation.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {invitation.invited_email}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Invitation sent
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(invitation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span>Waiting for them to sign up</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Group Invitations Sent */}
        {sentGroupInvitations && sentGroupInvitations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Group Invitations Sent ({sentGroupInvitations.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sentGroupInvitations.map((invitation) => (
                <div key={invitation.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {invitation.invited_email}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Invited to join "{invitation.group?.name || 'Group'}"
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Sent {new Date(invitation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span>Pending acceptance</span>
                  </div>
                </div>
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
