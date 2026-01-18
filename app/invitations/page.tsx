import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import InvitationCard from '@/components/invitations/InvitationCard'
import AppHeader from '@/components/navigation/AppHeader'

export default async function InvitationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's email and full name
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', user.id)
    .single()

  // Fetch pending invitations for this user's email
  const { data: invitations } = await supabase
    .from('invitations')
    .select(`
      *,
      group:groups (
        id,
        name,
        base_currency
      ),
      inviter:profiles!invitations_invited_by_fkey (
        full_name,
        email
      )
    `)
    .eq('invited_email', profile?.email)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Normalize the data structure (Supabase can return arrays or objects for foreign keys)
  const normalizedInvitations = invitations?.map((inv: any) => ({
    ...inv,
    group: Array.isArray(inv.group) ? inv.group[0] : inv.group,
    inviter: Array.isArray(inv.inviter) ? inv.inviter[0] : inv.inviter,
  }))

  const invitationCount = normalizedInvitations?.length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        userName={profile?.full_name}
        userEmail={profile?.email}
        pendingInvitations={invitationCount}
      />

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {normalizedInvitations && normalizedInvitations.length > 0 ? (
          <div className="space-y-4">
            {normalizedInvitations.map((invitation: any) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending invitations</h3>
            <p className="text-gray-600 mb-6">
              When someone invites you to a group, you'll see it here
            </p>
            <Link
              href="/groups"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Groups
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
