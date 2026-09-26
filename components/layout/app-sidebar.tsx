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
  ShieldCheck,
  Calculator,
  Layers,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
      description: 'Overview & Charts',
    },
    {
      id: 'inventory',
      label: 'Inventory Master',
      icon: Package,
      description: 'Excel Import / Export & SKUs',
      badge: lowStockCount > 0 ? `${lowStockCount} alert` : undefined,
      badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    },
    {
      id: 'stock',
      label: 'Stock In / Out',
      icon: ArrowLeftRight,
      description: 'Receive & Dispatch Stock',
    },
    {
      id: 'backup',
      label: 'Backup System',
      icon: HardDriveDownload,
      description: 'Auto 30-Day & Manual Export',
    },
    {
      id: 'users',
      label: 'Users & Roles',
      icon: Users2,
      description: 'Access & Password Resets',
      adminOnly: true,
      badge: pendingResets > 0 ? `${pendingResets} New` : undefined,
      badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    },
    {
      id: 'profile',
      label: 'Settings & Profile',
      icon: Settings,
      description: 'Theme & Admin Email',
    },
  ]

  const handleNavClick = (id: string) => {
    onTabChange(id)
    if (onCloseMobile) onCloseMobile()
  }

  return (
    <aside className="w-64 h-screen flex flex-col bg-slate-900 text-slate-100 border-r border-slate-800 select-none">
      {/* Top Logo Section */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-white p-1.5 rounded-xl shadow-xs">
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
            <span className="font-extrabold text-sm tracking-tight text-white block">
              Snug N Play
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              Inventory Admin
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links (Hostinger / WordPress Style) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Main Navigation
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
                w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all group text-left
                ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : isRestricted
                    ? 'text-slate-600 cursor-not-allowed opacity-50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-lg ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-indigo-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold">{item.label}</span>
                  <span className={`text-[10px] block ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {item.description}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (!item.adminOnly || isAdmin) && (
                  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </Badge>
                )}
                {isRestricted && <Lock className="w-3 h-3 text-slate-600" />}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* User Profile & Sign Out Footer in Sidebar */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-2">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
              {currentUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="truncate text-left">
              <span className="text-xs font-bold text-white block truncate">{currentUser?.name}</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block capitalize">
                {currentUser?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full text-xs h-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 justify-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </Button>
      </div>
    </aside>
  )
}
