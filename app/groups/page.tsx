import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Users, LogOut, Mail, UserPlus } from 'lucide-react'
import CreateGroupButton from '@/components/groups/CreateGroupButton'
import LogoutButton from '@/components/auth/LogoutButton'
import NotificationBell from '@/components/notifications/NotificationBell'

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's groups - get all and filter in code to handle missing status field
  const { data: groupMembers } = await supabase
    .from('group_members')
    .select(`
      *,
      groups (
        id,
        name,
        created_at,
        base_currency,
        created_by
      )
    `)
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })

  // Filter out pending and inactive members in the application layer
  const activeGroupMembers = groupMembers?.filter(gm => {
    // Include if: status is 'active', status is null/undefined, or is_active is true
    return gm.status === 'active' || !gm.status || gm.is_active !== false
  }) || []

  const groups = activeGroupMembers?.map(gm => gm.groups).filter(Boolean) || []

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
              href="/friends"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Friends
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Groups</h2>
          <CreateGroupButton />
        </div>

        {groups.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
            <p className="text-gray-600 mb-6">Create your first group to start splitting expenses</p>
            <CreateGroupButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group: any) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-lg p-3 mr-3">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-600">{group.base_currency}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Created {new Date(group.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
