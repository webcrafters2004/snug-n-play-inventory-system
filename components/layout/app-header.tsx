'use client'

import React from 'react'
import { useInventory } from '@/context/inventory-context'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sun,
  Moon,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Package,
  Layers,
  Calculator,
  DownloadCloud,
  LogOut,
  User,
  Settings,
  Bell,
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

  const roleColors: Record<UserRole, { badge: string; text: string; bg: string }> = {
    system_admin: { badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30', text: 'System Admin', bg: 'bg-indigo-600' },
    manager: { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30', text: 'Manager', bg: 'bg-blue-600' },
    operations: { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30', text: 'Operations', bg: 'bg-amber-600' },
    accounts: { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', text: 'Accounts', bg: 'bg-emerald-600' },
  }

  const currentRole = currentUser?.role || 'system_admin'
  const activeRoleBadge = roleColors[currentRole]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white shadow-md shadow-indigo-500/20 font-black text-lg tracking-wider">
            SP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-300 bg-clip-text text-transparent">
                Snug N Play
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden sm:inline-block">
                Inventory OS
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground hidden sm:block">Enterprise Warehouse & Catalog Portal</p>
          </div>
        </div>

        {/* Right: Actions, Role Switcher, Theme & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Role Switcher Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`h-8 text-xs font-semibold gap-1.5 border shadow-none ${activeRoleBadge.badge}`}
              >
                <span className={`w-2 h-2 rounded-full ${activeRoleBadge.bg} animate-pulse`} />
                <span className="capitalize">{activeRoleBadge.text}</span>
                <span className="text-[10px] opacity-70 hidden md:inline">(Switch)</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 text-xs">
              <DropdownMenuLabel className="text-[11px] text-muted-foreground">Switch Testing Role:</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => switchRole('system_admin')} className="gap-2 cursor-pointer">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <div className="flex flex-col">
                  <span className="font-bold">System Admin</span>
                  <span className="text-[10px] text-muted-foreground">All rights & user settings</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole('manager')} className="gap-2 cursor-pointer">
                <Layers className="w-4 h-4 text-blue-500" />
                <div className="flex flex-col">
                  <span className="font-bold">Manager</span>
                  <span className="text-[10px] text-muted-foreground">Analytics, reports, audit</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole('operations')} className="gap-2 cursor-pointer">
                <Package className="w-4 h-4 text-amber-500" />
                <div className="flex flex-col">
                  <span className="font-bold">Operations</span>
                  <span className="text-[10px] text-muted-foreground">Stock in/out & Excel files</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole('accounts')} className="gap-2 cursor-pointer">
                <Calculator className="w-4 h-4 text-emerald-500" />
                <div className="flex flex-col">
                  <span className="font-bold">Accounts</span>
                  <span className="text-[10px] text-muted-foreground">Valuation & exports</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Manual Backup Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => createBackup('manual')}
            className="h-8 text-xs font-medium gap-1.5 hidden md:flex hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Instant full JSON snapshot download"
          >
            <DownloadCloud className="w-3.5 h-3.5 text-indigo-500" />
            Backup Now
          </Button>

          {/* Notifications / Alerts Pill */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                <Bell className="w-4 h-4 text-muted-foreground" />
                {(pendingResets > 0 || lowStockCount > 0) && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 text-xs">
              <DropdownMenuLabel className="font-bold">System Alerts & Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {lowStockCount > 0 && (
                <DropdownMenuItem onClick={() => onNavigateTab('inventory')} className="cursor-pointer">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-600 dark:text-amber-400">{lowStockCount} Products Low / Out of Stock</p>
                      <p className="text-[10px] text-muted-foreground">Click to review in Inventory</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              )}
              {pendingResets > 0 && currentUser?.role === 'system_admin' && (
                <DropdownMenuItem onClick={() => onNavigateTab('users')} className="cursor-pointer">
                  <div className="flex items-start gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-indigo-600 dark:text-indigo-400">{pendingResets} Password Reset Request(s)</p>
                      <p className="text-[10px] text-muted-foreground">Review & approve in Users tab</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              )}
              {lowStockCount === 0 && pendingResets === 0 && (
                <div className="p-3 text-center text-muted-foreground text-[11px]">
                  All inventory stock levels & security requests are in order.
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Switcher Toggle (Light / Dark) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title="Toggle Light / Dark theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-2 pl-1 pr-2 rounded-full border border-border">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-[11px]">
                  {currentUser?.name?.charAt(0) || 'A'}
                </div>
                <span className="text-xs font-medium hidden sm:inline-block max-w-[120px] truncate">
                  {currentUser?.name || 'Admin'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 text-xs">
              <div className="p-2 border-b">
                <p className="font-bold text-sm text-foreground">{currentUser?.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{currentUser?.email}</p>
                <Badge variant="outline" className={`mt-1 text-[10px] ${activeRoleBadge.badge}`}>
                  {activeRoleBadge.text}
                </Badge>
              </div>
              <DropdownMenuItem onClick={() => onNavigateTab('profile')} className="cursor-pointer gap-2 mt-1">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                Profile & Security
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigateTab('profile')} className="cursor-pointer gap-2">
                <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                System Settings
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
