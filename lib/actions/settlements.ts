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

  // Create a settlement record
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
    console.error('Error creating settlement:', settlementError)
    return { success: false, error: 'Failed to record settlement' }
  }

  // Get user profiles for the activity log
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', [fromUserId, toUserId])

  const fromProfile = profiles?.find(p => p.id === fromUserId)
  const toProfile = profiles?.find(p => p.id === toUserId)

  // Log activity
  await logActivity({
    groupId,
    activityType: 'settlement_created',
    details: {
      from_user: fromProfile?.full_name || fromProfile?.email,
      to_user: toProfile?.full_name || toProfile?.email,
      amount,
      currency,
      settlement_id: settlement.id,
    },
  })

  // Revalidate the group page to refresh balances
  revalidatePath(`/groups/${groupId}`)

  return { success: true, settlement }
}
