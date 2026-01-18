export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Group {
  id: string
  name: string
  created_by: string
  created_at: string
  updated_at: string
  base_currency: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  joined_at: string
  role: 'admin' | 'member'
  is_active: boolean
  status?: 'active' | 'pending' | 'inactive'
  pending_email?: string | null
  profile?: Profile
}

export interface Invitation {
  id: string
  group_id: string
  invited_by: string
  invited_email: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  expires_at: string | null
}

export interface Expense {
  id: string
  group_id: string
  description: string
  amount: number
  currency: string
  paid_by: string
  category: string
  notes: string | null
  receipt_url: string | null
  expense_date: string
  split_type: 'equal' | 'personal' | 'custom' | 'percentage'
  created_at: string
  updated_at: string
  payer?: Profile
}

export interface ExpenseSplit {
  id: string
  expense_id: string
  user_id: string
  amount: number
  percentage: number | null
  profile?: Profile
}

export interface Settlement {
  id: string
  group_id: string
  from_user: string
  to_user: string
  amount: number
  currency: string
  paid: boolean
  paid_at: string | null
  created_at: string
  from_profile?: Profile
  to_profile?: Profile
}

export interface Category {
  id: string
  name: string
  group_id: string | null
  is_default: boolean
}

export interface Balance {
  userId: string
  userName: string
  balance: number
}

export interface SettlementSuggestion {
  from: string
  to: string
  amount: number
  fromName: string
  toName: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'group_added' | 'group_invitation' | 'expense_added' | 'settlement_requested' | 'friend_request'
  title: string
  message: string
  link: string | null
  read: boolean
  created_at: string
  metadata: any
}

export interface Friend {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  updated_at: string
  profile?: Profile
}
