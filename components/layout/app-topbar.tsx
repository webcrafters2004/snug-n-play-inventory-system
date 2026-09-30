'use client'

import React, { useState, useEffect } from 'react'
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
  UploadCloud,
  Menu,
  Edit3,
  Eye,
  ChevronDown,
  Clock,
  Store,
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
  const { currentUser, switchRole, createBackup, setIsRestoreModalOpen } = useInventory()
  const { theme, setTheme } = useTheme()
  const [liveTime, setLiveTime] = useState<string>('')

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const formatted = now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
      setLiveTime(formatted)
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  const tabTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    inventory: 'Products & Stock',
    stock: 'Stock In & Out Operations',
    reports: 'Reports & 3-Way Audit',
    backup: 'Database Backups',
    users: 'Users & Access Control',
    profile: 'System Settings',
  }

  const roleLabels: Record<UserRole, { label: string; badgeClass: string }> = {
    system_admin: { label: 'System Admin', badgeClass: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
    store: { label: 'Store Keeper', badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
    inventory_editor: { label: 'Inventory Editor', badgeClass: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800' },
    operations: { label: 'Operations', badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
    accounts: { label: 'Accounts', badgeClass: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
    manager: { label: 'Manager', badgeClass: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
    viewer: { label: 'Viewer', badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
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
            {tabTitles[activeTab] || 'Inventory Portal'}
          </h1>
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            Snug N Play Inventory System • Karachi Site
          </p>
        </div>
      </div>

      {/* Center: Live Day, Date, Time, Year Clock */}
      <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-mono">{liveTime || 'Loading date & time...'}</span>
      </div>

      {/* Right: Role Switcher, Quick Backup & Theme */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Role Switcher Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 text-xs font-semibold gap-1.5 border shadow-none rounded-lg ${activeBadge.badgeClass}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              <span>{activeBadge.label}</span>
              <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 text-xs rounded-xl p-1">
            <DropdownMenuLabel className="text-[10px] text-muted-foreground font-semibold px-2 py-1 uppercase tracking-wider">
              Switch Testing Role
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => switchRole('system_admin')} className="gap-2 cursor-pointer font-medium rounded-lg py-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              System Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('inventory_editor')} className="gap-2 cursor-pointer font-medium rounded-lg py-1.5">
              <Edit3 className="w-4 h-4 text-emerald-500" />
              Inventory Editor
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('operations')} className="gap-2 cursor-pointer font-medium rounded-lg py-1.5">
              <Package className="w-4 h-4 text-amber-500" />
              Operations
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('accounts')} className="gap-2 cursor-pointer font-medium rounded-lg py-1.5">
              <Calculator className="w-4 h-4 text-blue-500" />
              Accounts
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('manager')} className="gap-2 cursor-pointer font-medium rounded-lg py-1.5">
              <Layers className="w-4 h-4 text-purple-500" />
              Manager
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('viewer')} className="gap-2 cursor-pointer font-medium rounded-lg py-1.5">
              <Eye className="w-4 h-4 text-slate-500" />
              Viewer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Manual Backup */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => createBackup('manual')}
          className="h-8 text-xs font-semibold gap-1.5 hidden sm:flex border-border hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg shadow-2xs"
          title="Download full JSON portal backup"
        >
          <DownloadCloud className="w-3.5 h-3.5 text-indigo-500" />
          Backup Now
        </Button>

        {/* Restore Backup JSON Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsRestoreModalOpen(true)}
          className="h-8 text-xs font-semibold gap-1.5 hidden sm:flex border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg shadow-2xs"
          title="Upload JSON backup to restore entire portal data"
        >
          <UploadCloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Restore JSON
        </Button>

        {/* Theme Switcher Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-lg"
          title="Toggle Light / Dark theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </Button>
      </div>
    </header>
  )
}
