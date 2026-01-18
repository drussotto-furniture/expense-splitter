'use server'

import { createClient } from '@/lib/supabase/server'

export type ActivityType =
  | 'expense_created'
  | 'expense_updated'
  | 'expense_deleted'
  | 'member_invited'
  | 'member_removed'
  | 'member_accepted'
  | 'member_left'
  | 'group_updated'
  | 'settlement_created'

interface LogActivityParams {
  groupId: string
  activityType: ActivityType
  details: Record<string, any>
  userId?: string // Optional - if not provided, will use current user
}

export async function logActivity({ groupId, activityType, details, userId }: LogActivityParams) {
  const supabase = await createClient()

  // Get current user if userId not provided
  let finalUserId: string | undefined = userId
  if (!finalUserId) {
    const { data: { user } } = await supabase.auth.getUser()
    finalUserId = user?.id
  }

  const { error } = await supabase
    .from('group_activities')
    .insert({
      group_id: groupId,
      user_id: finalUserId,
      activity_type: activityType,
      details,
    })

  if (error) {
    console.error('Error logging activity:', error)
  }
}

export async function getGroupActivities(groupId: string) {
  const supabase = await createClient()

  // Fetch activities
  const { data: activities, error } = await supabase
    .from('group_activities')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching activities:', error)
    return []
  }

  if (!activities || activities.length === 0) {
    return []
  }

  // Get unique user IDs
  const userIds = [...new Set(activities.map(a => a.user_id).filter(Boolean))] as string[]

  if (userIds.length === 0) {
    return activities.map(a => ({ ...a, user: null }))
  }

  // Fetch user profiles separately
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', userIds)

  // Map profiles to activities
  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

  return activities.map(activity => ({
    ...activity,
    user: activity.user_id ? (profileMap.get(activity.user_id) || null) : null,
  }))
}
