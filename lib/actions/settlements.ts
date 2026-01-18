'use server'

import { createClient } from '@/lib/supabase/server'
import { logActivity } from './activity'
import { revalidatePath } from 'next/cache'

interface MarkSettlementPaidParams {
  groupId: string
  fromUserId: string
  toUserId: string
  amount: number
  currency: string
}

export async function markSettlementPaid({
  groupId,
  fromUserId,
  toUserId,
  amount,
  currency,
}: MarkSettlementPaidParams) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Authentication required' }
  }

  // Verify user is a member of the group
  const { data: membership, error: memberError } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  if (memberError || !membership) {
    return { success: false, error: 'You are not a member of this group' }
  }

  // Get user profiles for names
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', [fromUserId, toUserId])

  const fromProfile = profiles?.find(p => p.id === fromUserId)
  const toProfile = profiles?.find(p => p.id === toUserId)

  const fromName = fromProfile?.full_name || fromProfile?.email || 'Unknown'
  const toName = toProfile?.full_name || toProfile?.email || 'Unknown'

  // Create a settlement expense to zero out the balance
  // This expense represents the payment from debtor to creditor
  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .insert({
      group_id: groupId,
      description: `Settlement: ${fromName} paid ${toName}`,
      amount,
      currency,
      paid_by: fromUserId, // The person who owes money is "paying"
      category: 'Settlement',
      expense_date: new Date().toISOString().split('T')[0],
      split_type: 'personal',
      created_by: user.id,
    })
    .select()
    .single()

  if (expenseError) {
    console.error('Error creating settlement expense:', expenseError)
    return { success: false, error: 'Failed to record settlement' }
  }

  // Create a split that assigns the full amount to the person who was owed money
  // This effectively zeros out the balance between the two people
  const { error: splitError } = await supabase
    .from('expense_splits')
    .insert({
      expense_id: expense.id,
      user_id: toUserId, // The person who was owed money
      amount,
      percentage: null,
    })

  if (splitError) {
    console.error('Error creating settlement split:', splitError)
    // Clean up the expense we just created
    await supabase.from('expenses').delete().eq('id', expense.id)
    return { success: false, error: 'Failed to record settlement' }
  }

  // Create a settlement record for tracking
  const { data: settlement, error: settlementError } = await supabase
    .from('settlements')
    .insert({
      group_id: groupId,
      from_user: fromUserId,
      to_user: toUserId,
      amount,
      currency,
      paid: true,
      paid_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (settlementError) {
    console.error('Error creating settlement record:', settlementError)
    // Continue anyway - the expense and split are more important
  }

  // Log activity
  await logActivity({
    groupId,
    activityType: 'settlement_created',
    details: {
      from_user: fromName,
      to_user: toName,
      amount,
      currency,
      settlement_id: settlement?.id,
      expense_id: expense.id,
    },
  })

  // Revalidate the group page to refresh balances
  revalidatePath(`/groups/${groupId}`)

  return { success: true, settlement, expense }
}
