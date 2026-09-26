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
  ChevronRight,
} from 'lucide-react'

interface AppSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onCloseMobile?: () => void
}

export function AppSidebar({ activeTab, onTabChange, onCloseMobile }: AppSidebarProps) {
  const { currentUser, logout, products, isAdmin } = useInventory()

  const lowStockCount = products.filter((p) => p.status === 'low_stock' || p.status === 'out_of_stock').length

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'inventory',
      label: 'Products & Stock',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount}` : undefined,
    },
    {
      id: 'stock',
      label: 'Stock Movements',
      icon: ArrowLeftRight,
    },
    {
      id: 'backup',
      label: 'Backups',
      icon: HardDriveDownload,
    },
    {
      id: 'users',
      label: 'Users & Access',
      icon: Users2,
      adminOnly: true,
    },
    {
      id: 'profile',
      label: 'Settings',
      icon: Settings,
    },
  ]

  const handleNavClick = (id: string) => {
    onTabChange(id)
    if (onCloseMobile) onCloseMobile()
  }

  const roleDisplay = (r?: string) => {
    if (!r) return 'User'
    return r.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  return (
    <aside className="w-64 h-screen flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 select-none shadow-xs">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700 shadow-xs flex items-center justify-center">
          <img
            src="/logo.webp"
            alt="Snug N Play"
            className="h-7 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
        <div>
          <span className="font-bold text-sm text-slate-900 dark:text-white block tracking-tight">
            Snug N Play
          </span>
          <span className="text-[11px] font-medium text-slate-400 block">
            Inventory System
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          const isRestricted = item.adminOnly && !isAdmin

          if (isRestricted) return null

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`
                w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left duration-150
                ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }
              `}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shadow-xs mb-2">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
              {currentUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="truncate text-left">
              <span className="text-xs font-semibold text-slate-900 dark:text-white block truncate">
                {currentUser?.name}
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">
                {roleDisplay(currentUser?.role)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
