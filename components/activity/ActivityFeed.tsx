'use client'

import { Clock, DollarSign, UserPlus, UserMinus, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import type { ActivityType } from '@/lib/actions/activity'

interface Activity {
  id: string
  group_id: string
  user_id: string | null
  activity_type: ActivityType
  details: Record<string, any>
  created_at: string
  user: {
    id: string
    full_name: string | null
    email: string
  } | null
}

interface ActivityFeedProps {
  activities: Activity[]
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'expense_created':
      case 'expense_updated':
      case 'expense_deleted':
        return <DollarSign className="h-5 w-5" />
      case 'member_invited':
        return <UserPlus className="h-5 w-5" />
      case 'member_removed':
        return <UserMinus className="h-5 w-5" />
      case 'member_accepted':
        return <CheckCircle className="h-5 w-5" />
      case 'member_left':
        return <XCircle className="h-5 w-5" />
      case 'settlement_created':
        return <TrendingUp className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'expense_created':
        return 'bg-green-100 text-green-800'
      case 'expense_updated':
        return 'bg-blue-100 text-blue-800'
      case 'expense_deleted':
        return 'bg-red-100 text-red-800'
      case 'member_invited':
      case 'member_accepted':
        return 'bg-purple-100 text-purple-800'
      case 'member_removed':
      case 'member_left':
        return 'bg-gray-100 text-gray-800'
      case 'settlement_created':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatActivityMessage = (activity: Activity) => {
    const userName = activity.user?.full_name || activity.user?.email || 'Someone'
    const details = activity.details

    switch (activity.activity_type) {
      case 'expense_created':
        return (
          <div>
            <div>
              <span className="font-semibold">{userName}</span> added expense{' '}
              <span className="font-medium">{details.description}</span> for{' '}
              <span className="font-medium">
                {details.currency} {details.amount}
              </span>
            </div>
            {details.paid_by_name && (
              <div className="mt-1 text-xs text-gray-600">
                • Paid by {details.paid_by_name}
              </div>
            )}
            {details.split_type && (
              <div className="mt-0.5 text-xs text-gray-600">
                • {details.split_type.charAt(0).toUpperCase() + details.split_type.slice(1)} split
                {details.split_count && ` among ${details.split_count} member${details.split_count > 1 ? 's' : ''}`}
              </div>
            )}
            {details.category && (
              <div className="mt-0.5 text-xs text-gray-600">
                • Category: {details.category}
              </div>
            )}
          </div>
        )
      case 'expense_updated':
        return (
          <div>
            <div>
              <span className="font-semibold">{userName}</span> updated expense{' '}
              <span className="font-medium">{details.description || details.old_description}</span>
            </div>
            {details.changes && details.changes.length > 0 && (
              <div className="mt-1 text-xs text-gray-600 space-y-0.5">
                {details.changes.map((change: string, idx: number) => (
                  <div key={idx}>• {change}</div>
                ))}
              </div>
            )}
          </div>
        )
      case 'expense_deleted':
        return (
          <div>
            <span className="font-semibold">{userName}</span> deleted expense{' '}
            <span className="font-medium">{details.description}</span>
            {details.amount && (
              <span className="text-gray-600">
                {' '}({details.currency} {details.amount})
              </span>
            )}
          </div>
        )
      case 'member_invited':
        return (
          <div>
            <span className="font-semibold">{userName}</span> invited{' '}
            <span className="font-medium">{details.member_name || details.member_email}</span>
            {details.added_directly ? ' and added them to the group' : ' to join the group'}
          </div>
        )
      case 'member_removed':
        return (
          <div>
            <span className="font-semibold">{userName}</span> removed{' '}
            <span className="font-medium">{details.member_name}</span> from the group
          </div>
        )
      case 'member_accepted':
        return (
          <div>
            <span className="font-semibold">{userName}</span> accepted the invitation and joined the group
          </div>
        )
      case 'member_left':
        return (
          <div>
            <span className="font-semibold">{userName}</span> left the group
          </div>
        )
      case 'settlement_created':
        return (
          <div>
            <div>
              <span className="font-semibold">{userName}</span> recorded a settlement
            </div>
            {details.from_user && details.to_user && (
              <div className="mt-1 text-xs text-gray-600">
                • {details.from_user} paid {details.to_user}
              </div>
            )}
            {details.amount && details.currency && (
              <div className="mt-0.5 text-xs text-gray-600">
                • Amount: {details.currency} {details.amount}
              </div>
            )}
          </div>
        )
      default:
        return (
          <div>
            <span className="font-semibold">{userName}</span> performed an action
          </div>
        )
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
        <p className="text-gray-600">Activity will appear here as members add expenses and interact with the group</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Group Activity</h3>
        <p className="text-sm text-gray-600 mt-1">Recent changes and updates</p>
      </div>
      <div className="divide-y divide-gray-100">
        {activities.map((activity, index) => {
          const activityId = activity.id || `activity-${index}-${activity.created_at}-${activity.activity_type}`
          return (
            <div key={activityId} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 rounded-full p-2 ${getActivityColor(activity.activity_type)}`}>
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900">
                    {formatActivityMessage(activity)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(activity.created_at)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
