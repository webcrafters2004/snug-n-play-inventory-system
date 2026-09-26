'use client'

import React from 'react'
import { useInventory } from '@/context/inventory-context'
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  HardDriveDownload,
  Users2,
  Settings,
  Lock,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface AppNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AppNavigation({ activeTab, onTabChange }: AppNavigationProps) {
  const { currentUser } = useInventory()
  const isAdmin = currentUser?.role === 'system_admin'

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory & Products', icon: Package },
    { id: 'stock', label: 'Stock Movement', icon: ArrowLeftRight },
    { id: 'backup', label: 'Backup System', icon: HardDriveDownload },
    { id: 'users', label: 'Users & Permissions', icon: Users2, adminOnly: true },
    { id: 'profile', label: 'Settings & Profile', icon: Settings },
  ]

  return (
    <div className="border-b bg-card shadow-2xs sticky top-16 z-30 transition-colors">
      <div className="px-4 sm:px-6 flex items-center justify-between overflow-x-auto no-scrollbar py-2">
        <nav className="flex space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            const isRestricted = item.adminOnly && !isAdmin

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (!isRestricted) onTabChange(item.id)
                }}
                disabled={isRestricted}
                className={`
                  flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all
                  ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                      : isRestricted
                      ? 'text-muted-foreground/40 cursor-not-allowed hover:bg-transparent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge && isAdmin && (
                  <Badge variant="destructive" className="h-4 px-1.5 text-[9px] font-bold">
                    {item.badge}
                  </Badge>
                )}
                {isRestricted && <Lock className="w-3 h-3 text-muted-foreground/40" />}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
