'use client'

import React from 'react'
import { useInventory } from '@/context/inventory-context'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  Sun,
  Moon,
  ShieldCheck,
  Package,
  Layers,
  Calculator,
  DownloadCloud,
  Menu,
  Edit3,
  Eye,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserRole } from '@/lib/types'

interface AppTopbarProps {
  activeTab: string
  onToggleMobileMenu: () => void
}

export function AppTopbar({ activeTab, onToggleMobileMenu }: AppTopbarProps) {
  const { currentUser, switchRole, createBackup } = useInventory()
  const { theme, setTheme } = useTheme()

  const tabTitles: Record<string, string> = {
    dashboard: 'Dashboard & Physical Stock Overview',
    inventory: 'Inventory Master (SKUs & Physical Quantities)',
    stock: 'Stock Operations (Receive In / Dispatch Out)',
    backup: '30-Day Backup Snapshots',
    users: 'User Accounts & Role Permissions',
    profile: 'System Preferences & Settings',
  }

  const roleLabels: Record<UserRole, { label: string; badgeClass: string }> = {
    system_admin: { label: '👑 System Admin', badgeClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' },
    inventory_editor: { label: '✏️ Inventory Editor', badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
    operations: { label: '📦 Operations', badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
    accounts: { label: '💰 Accounts', badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
    manager: { label: '📊 Manager', badgeClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' },
    viewer: { label: '👁️ Viewer', badgeClass: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30' },
  }

  const currentRole = currentUser?.role || 'system_admin'
  const activeBadge = roleLabels[currentRole] || roleLabels.system_admin

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b bg-card/95 backdrop-blur flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleMobileMenu}
          className="lg:hidden h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-foreground">
            {tabTitles[activeTab] || 'Snug N Play Portal'}
          </h1>
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            Snug N Play Pure Physical Inventory System
          </p>
        </div>
      </div>

      {/* Right: Role Switcher, Quick Backup & Theme */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Switcher Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 text-xs font-bold gap-1.5 border shadow-none rounded-xl ${activeBadge.badgeClass}`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <span>{activeBadge.label}</span>
              <span className="text-[10px] opacity-60 font-normal hidden sm:inline">(Switch)</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 text-xs rounded-2xl p-1.5">
            <DropdownMenuLabel className="text-[11px] text-muted-foreground font-bold px-2 py-1">
              Test Switch Role:
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => switchRole('system_admin')} className="gap-2 cursor-pointer font-bold rounded-xl py-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              👑 System Admin (Full Power)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('inventory_editor')} className="gap-2 cursor-pointer font-bold rounded-xl py-2">
              <Edit3 className="w-4 h-4 text-emerald-500" />
              ✏️ Inventory Editor (Edit Catalog)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('operations')} className="gap-2 cursor-pointer font-medium rounded-xl py-2">
              <Package className="w-4 h-4 text-amber-500" />
              📦 Operations (View Only)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('accounts')} className="gap-2 cursor-pointer font-medium rounded-xl py-2">
              <Calculator className="w-4 h-4 text-blue-500" />
              💰 Accounts (View Only)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('manager')} className="gap-2 cursor-pointer font-medium rounded-xl py-2">
              <Layers className="w-4 h-4 text-purple-500" />
              📊 Manager (View Only)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('viewer')} className="gap-2 cursor-pointer font-medium rounded-xl py-2">
              <Eye className="w-4 h-4 text-slate-500" />
              👁️ Viewer (View Only)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Manual Backup */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => createBackup('manual')}
          className="h-8 text-xs font-semibold gap-1.5 hidden sm:flex border-border hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl"
          title="Download full JSON snapshot backup"
        >
          <DownloadCloud className="w-3.5 h-3.5 text-indigo-500" />
          Backup Now
        </Button>

        {/* Theme Switcher Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-xl"
          title="Toggle Light / Dark theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </Button>
      </div>
    </header>
  )
}
