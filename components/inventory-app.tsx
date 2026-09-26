'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { LoginView } from '@/components/auth/login-view'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppTopbar } from '@/components/layout/app-topbar'
import { DashboardView } from '@/components/dashboard/dashboard-view'
import { InventoryTableView } from '@/components/inventory/inventory-table-view'
import { StockOperationsView } from '@/components/stock/stock-operations-view'
import { BackupView } from '@/components/backup/backup-view'
import { UsersManagementView } from '@/components/users/users-management-view'
import { ProfileSettingsView } from '@/components/profile/profile-settings-view'
import { X } from 'lucide-react'

export function InventoryApp() {
  const { currentUser } = useInventory()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  if (!currentUser) {
    return <LoginView />
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-foreground transition-colors">
      {/* Desktop Fixed Left Sidebar (Hostinger / WordPress Style) */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 z-10 shadow-2xl">
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute top-4 right-3 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <AppSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Right Content Section (WordPress Style) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <AppTopbar
          activeTab={activeTab}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
          {activeTab === 'inventory' && <InventoryTableView />}
          {activeTab === 'stock' && <StockOperationsView />}
          {activeTab === 'backup' && <BackupView />}
          {activeTab === 'users' && <UsersManagementView />}
          {activeTab === 'profile' && <ProfileSettingsView />}
        </main>

        {/* Footer */}
        <footer className="border-t py-4 px-6 bg-card/60 text-center text-xs text-muted-foreground mt-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>Snug N Play</strong> Inventory Management OS • Production
          </span>
          <span className="text-[11px]">
            Super Admin: <strong className="font-mono text-foreground">amankamran2004@outlook.com</strong>
          </span>
        </footer>
      </div>
    </div>
  )
}
