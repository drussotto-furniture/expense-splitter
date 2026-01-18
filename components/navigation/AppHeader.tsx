'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Users, UserPlus, Mail, Bell, Home } from 'lucide-react'
import LogoutButton from '@/components/auth/LogoutButton'
import NotificationBell from '@/components/notifications/NotificationBell'

interface AppHeaderProps {
  userName?: string | null
  userEmail?: string | null
  pendingInvitations?: number
}

export default function AppHeader({ userName, userEmail, pendingInvitations = 0 }: AppHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/')
  }

  const navLinks = [
    { href: '/groups', label: 'Groups', icon: Users },
    { href: '/friends', label: 'Friends', icon: UserPlus },
    { href: '/invitations', label: 'Invitations', icon: Mail, badge: pendingInvitations },
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/groups" className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Expense Splitter</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                  {link.badge && link.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {link.badge}
                    </span>
                  )}
                </Link>
              )
            })}
            <div className="ml-2">
              <NotificationBell />
            </div>
            <div className="ml-2 pl-2 border-l border-gray-200">
              <LogoutButton />
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-3 space-y-1">
            {/* User info */}
            {(userName || userEmail) && (
              <div className="px-3 py-2 border-b border-gray-200 mb-2">
                <p className="text-sm font-medium text-gray-900">{userName || userEmail}</p>
                {userName && userEmail && (
                  <p className="text-xs text-gray-600">{userEmail}</p>
                )}
              </div>
            )}

            {/* Navigation links */}
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                  {link.badge && link.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                      {link.badge}
                    </span>
                  )}
                </Link>
              )
            })}

            {/* Logout button */}
            <div className="pt-2 border-t border-gray-200 mt-2">
              <LogoutButton />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
