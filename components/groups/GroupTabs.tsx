'use client'

import { useState } from 'react'
import { List, Activity } from 'lucide-react'

interface GroupTabsProps {
  expensesContent: React.ReactNode
  activityContent: React.ReactNode
}

export default function GroupTabs({ expensesContent, activityContent }: GroupTabsProps) {
  const [activeTab, setActiveTab] = useState<'expenses' | 'activity'>('expenses')

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`
              flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === 'expenses'
                  ? 'border-slate-700 text-slate-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <List className="h-5 w-5" />
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`
              flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === 'activity'
                  ? 'border-slate-700 text-slate-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Activity className="h-5 w-5" />
            Activity
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'expenses' && expensesContent}
        {activeTab === 'activity' && activityContent}
      </div>
    </div>
  )
}
