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
    dashboard: 'Executive Dashboard & Overview',
    inventory: 'Inventory Master (Excel Import / Export & SKUs)',
    stock: 'Stock Movement (Receive In / Dispatch Out)',
    backup: '30-Day Backup Engine & Snapshots',
    users: 'User Accounts & Role Permissions',
    profile: 'System Settings & Profile Preferences',
  }

  const roleLabels: Record<UserRole, { label: string; badgeClass: string }> = {
    system_admin: { label: 'System Admin', badgeClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' },
    manager: { label: 'Manager', badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
    operations: { label: 'Operations', badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
    accounts: { label: 'Accounts', badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  }

  const currentRole = currentUser?.role || 'system_admin'
  const activeBadge = roleLabels[currentRole]

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
            Snug N Play Enterprise Warehouse OS
          </p>
        </div>
      </div>

      {/* Right: Quick Role Switcher, Quick Backup & Theme */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Switcher Pill */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 text-xs font-bold gap-1.5 border shadow-none ${activeBadge.badgeClass}`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <span>{activeBadge.label}</span>
              <span className="text-[10px] opacity-60 font-normal hidden sm:inline">(Switch)</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 text-xs">
            <DropdownMenuLabel className="text-[11px] text-muted-foreground">Switch Testing Role:</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => switchRole('system_admin')} className="gap-2 cursor-pointer font-medium">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              System Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('manager')} className="gap-2 cursor-pointer font-medium">
              <Layers className="w-4 h-4 text-blue-500" />
              Manager
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('operations')} className="gap-2 cursor-pointer font-medium">
              <Package className="w-4 h-4 text-amber-500" />
              Operations
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('accounts')} className="gap-2 cursor-pointer font-medium">
              <Calculator className="w-4 h-4 text-emerald-500" />
              Accounts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Manual Backup */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => createBackup('manual')}
          className="h-8 text-xs font-semibold gap-1.5 hidden sm:flex border-border hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
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
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          title="Toggle Light / Dark theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </Button>
      </div>
    </header>
  )
}
