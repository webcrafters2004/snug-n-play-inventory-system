'use client'

import React from 'react'
import { useInventory } from '@/context/inventory-context'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sun,
  Moon,
  ShieldCheck,
  Package,
  Layers,
  Calculator,
  DownloadCloud,
  LogOut,
  User,
  Settings,
  Bell,
  HardDrive,
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

interface AppHeaderProps {
  onNavigateTab: (tab: string) => void
}

export function AppHeader({ onNavigateTab }: AppHeaderProps) {
  const { currentUser, logout, switchRole, createBackup, resetRequests, products } = useInventory()
  const { theme, setTheme } = useTheme()

  const pendingResets = resetRequests.filter((r) => r.status === 'pending').length
  const lowStockCount = products.filter((p) => p.status === 'low_stock' || p.status === 'out_of_stock').length

  const roleLabels: Record<UserRole, { label: string; badgeClass: string }> = {
    system_admin: { label: 'System Admin', badgeClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' },
    manager: { label: 'Manager', badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' },
    operations: { label: 'Operations', badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
    accounts: { label: 'Accounts', badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  }

  const currentRole = currentUser?.role || 'system_admin'
  const activeBadge = roleLabels[currentRole]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/95 backdrop-blur shadow-xs">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Real Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <img
              src="/logo.webp"
              alt="Snug N Play"
              className="h-9 w-auto object-contain"
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = 'none'
                target.parentElement!.innerHTML = '<span class="text-xl font-black text-indigo-600">Snug N Play</span>'
              }}
            />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:inline-block border-l pl-3">
            Inventory System
          </span>
        </div>

        {/* Right: Role Switcher, Quick Backup, Theme & User Profile */}
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
            className="h-8 text-xs font-semibold gap-1.5 hidden sm:flex border-border hover:border-indigo-500"
            title="Download full JSON snapshot backup"
          >
            <DownloadCloud className="w-3.5 h-3.5 text-indigo-500" />
            Quick Backup
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

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-2 pl-1 pr-2 rounded-full border border-border">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px]">
                  {currentUser?.name?.charAt(0) || 'A'}
                </div>
                <span className="text-xs font-semibold hidden sm:inline-block max-w-[120px] truncate">
                  {currentUser?.name || 'Admin'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 text-xs">
              <div className="p-2 border-b">
                <p className="font-bold text-sm text-foreground">{currentUser?.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{currentUser?.email}</p>
              </div>
              <DropdownMenuItem onClick={() => onNavigateTab('profile')} className="cursor-pointer gap-2 mt-1">
                <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                Profile & Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
