'use client'

import React from 'react'
import { useInventory } from '@/context/inventory-context'
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  BarChart3,
  HardDriveDownload,
  FileSpreadsheet,
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
  const { currentUser, resetRequests } = useInventory()
  const isAdmin = currentUser?.role === 'system_admin'
  const pendingResets = resetRequests.filter((r) => r.status === 'pending').length

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, perm: 'dashboard.view' },
    { id: 'inventory', label: 'Inventory Catalog', icon: Package, perm: 'inventory.view' },
    { id: 'stock', label: 'Stock Movement', icon: ArrowLeftRight, perm: 'inventory.view' },
    { id: 'analytics', label: 'Insights & Analytics', icon: BarChart3, perm: 'analytics.view' },
    { id: 'backup', label: 'Backup System', icon: HardDriveDownload, perm: 'backup.view' },
    { id: 'reports', label: 'Backup Reports & Audit', icon: FileSpreadsheet, perm: 'reports.view' },
    { id: 'users', label: 'Users & Roles', icon: Users2, perm: 'admin_only', badge: pendingResets > 0 ? `${pendingResets} req` : undefined },
    { id: 'profile', label: 'Profile & Settings', icon: Settings, perm: 'always' },
  ]

  return (
    <div className="border-b bg-card/60 backdrop-blur-md sticky top-16 z-30 transition-colors">
      <div className="px-4 sm:px-6 flex items-center justify-between overflow-x-auto no-scrollbar py-2">
        <nav className="flex space-x-1.5 sm:space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            const isRestricted = item.perm === 'admin_only' && !isAdmin

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (!isRestricted) onTabChange(item.id)
                }}
                disabled={isRestricted}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
                  ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : isRestricted
                      ? 'text-muted-foreground/40 cursor-not-allowed hover:bg-transparent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && isAdmin && (
                  <Badge variant="destructive" className="h-4 px-1.5 text-[9px] font-bold">
                    {item.badge}
                  </Badge>
                )}
                {isRestricted && <Lock className="w-3 h-3 text-muted-foreground/40 ml-0.5" />}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
