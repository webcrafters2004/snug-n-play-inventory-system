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
  LogOut,
  Lock,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface AppSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onCloseMobile?: () => void
}

export function AppSidebar({ activeTab, onTabChange, onCloseMobile }: AppSidebarProps) {
  const { currentUser, logout, resetRequests, products } = useInventory()
  const isAdmin = currentUser?.role === 'system_admin'

  const pendingResets = resetRequests.filter((r) => r.status === 'pending').length
  const lowStockCount = products.filter((p) => p.status === 'low_stock' || p.status === 'out_of_stock').length

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: 'text-indigo-500',
    },
    {
      id: 'inventory',
      label: 'Products & Excel',
      icon: Package,
      color: 'text-emerald-500',
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'stock',
      label: 'Stock In / Out',
      icon: ArrowLeftRight,
      color: 'text-purple-500',
    },
    {
      id: 'backup',
      label: 'Backups',
      icon: HardDriveDownload,
      color: 'text-blue-500',
    },
    {
      id: 'users',
      label: 'Users & Roles',
      icon: Users2,
      color: 'text-pink-500',
      adminOnly: true,
      badge: pendingResets > 0 ? `${pendingResets}` : undefined,
      badgeColor: 'bg-indigo-600 text-white',
    },
    {
      id: 'profile',
      label: 'Settings',
      icon: Settings,
      color: 'text-slate-400',
    },
  ]

  const handleNavClick = (id: string) => {
    onTabChange(id)
    if (onCloseMobile) onCloseMobile()
  }

  return (
    <aside className="w-64 h-screen flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 select-none shadow-sm">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700 shadow-xs flex items-center justify-center">
          <img
            src="/logo.webp"
            alt="Snug N Play"
            className="h-8 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
        <div>
          <span className="font-extrabold text-sm text-slate-900 dark:text-white block tracking-tight">
            Snug N Play
          </span>
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block">
            Inventory System
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Menu
        </div>

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          const isRestricted = item.adminOnly && !isAdmin

          return (
            <button
              key={item.id}
              onClick={() => !isRestricted && handleNavClick(item.id)}
              disabled={isRestricted}
              className={`
                w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left
                ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : isRestricted
                    ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (!item.adminOnly || isAdmin) && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
                {isRestricted && <Lock className="w-3 h-3 text-slate-400" />}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shadow-xs mb-2">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black flex items-center justify-center text-xs flex-shrink-0">
              {currentUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="truncate text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                {currentUser?.name}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block capitalize">
                {currentUser?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
