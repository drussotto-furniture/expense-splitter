import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, DollarSign } from 'lucide-react'
import ExpenseList from '@/components/expenses/ExpenseList'
import AddExpenseButton from '@/components/expenses/AddExpenseButton'
import BalancesCard from '@/components/settlements/BalancesCard'
import LogoutButton from '@/components/auth/LogoutButton'
import InviteMemberButton from '@/components/groups/InviteMemberButton'
import DeleteGroupButton from '@/components/groups/DeleteGroupButton'
import RemoveMemberButton from '@/components/groups/RemoveMemberButton'
import NotificationBell from '@/components/notifications/NotificationBell'

// Disable caching for this page to ensure fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch group details
  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('id', id)
    .single()

  if (!group) {
    redirect('/groups')
  }

  // Check if user is a member
  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    redirect('/groups')
  }

  // Fetch group members
  const { data: members } = await supabase
    .from('group_members')
    .select(`
      *,
      profile:profiles (
        id,
        full_name,
        email
      )
    `)
    .eq('group_id', id)

  // Fetch expenses with payer info
  const { data: expenses } = await supabase
    .from('expenses')
    .select(`
      *,
      payer:profiles!expenses_paid_by_fkey (
        id,
        full_name,
        email
      )
    `)
    .eq('group_id', id)
    .order('expense_date', { ascending: false })

  // Fetch expense splits
  const { data: allSplits } = await supabase
    .from('expense_splits')
    .select(`
      *,
      profile:profiles (
        id,
        full_name,
        email
      ),
      pending_member:group_members!expense_splits_pending_member_id_fkey (
        id,
        pending_email
      )
    `)
    .in('expense_id', expenses?.map(e => e.id) || [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/groups"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
                <p className="text-sm text-gray-600">{group.base_currency}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              {group.created_by === user.id && (
                <DeleteGroupButton
                  groupId={id}
                  groupName={group.name}
                  memberCount={members?.length || 0}
                  expenseCount={expenses?.length || 0}
                />
              )}
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Expenses */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Expenses</h2>
              <AddExpenseButton
                groupId={id}
                members={members || []}
                currency={group.base_currency}
              />
            </div>

            <ExpenseList
              expenses={expenses || []}
              splits={allSplits || []}
              groupId={id}
              currentUserId={user.id}
              members={members || []}
              currency={group.base_currency}
            />
          </div>

          {/* Right column - Balances and Members */}
          <div className="space-y-6">
            <BalancesCard
              expenses={expenses || []}
              splits={allSplits || []}
              members={members || []}
              groupId={id}
              currency={group.base_currency}
            />

            {/* Members card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Members</h3>
                </div>
                {group.created_by === user.id && (
                  <InviteMemberButton groupId={id} groupName={group.name} />
                )}
              </div>
              <div className="space-y-3">
                {members?.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {member.status === 'pending'
                            ? member.pending_email
                            : (member.profile?.full_name || member.profile?.email)}
                        </p>
                        {member.status === 'pending' && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Pending
                          </span>
                        )}
                        {member.is_active === false && member.status !== 'pending' && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                    {group.created_by === user.id &&
                     member.user_id !== user.id &&
                     (member.status === 'pending' || member.is_active !== false) && (
                      <RemoveMemberButton
                        memberId={member.id}
                        memberName={
                          member.status === 'pending'
                            ? member.pending_email
                            : (member.profile?.full_name || member.profile?.email)
                        }
                        userId={member.user_id}
                        groupId={id}
                        isPending={member.status === 'pending'}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
