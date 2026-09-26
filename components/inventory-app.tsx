'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { LoginView } from '@/components/auth/login-view'
import { AppHeader } from '@/components/layout/app-header'
import { AppNavigation } from '@/components/layout/app-navigation'
import { DashboardView } from '@/components/dashboard/dashboard-view'
import { InventoryTableView } from '@/components/inventory/inventory-table-view'
import { StockOperationsView } from '@/components/stock/stock-operations-view'
import { InsightsView } from '@/components/analytics/insights-view'
import { BackupView } from '@/components/backup/backup-view'
import { BackupReportsView } from '@/components/reports/backup-reports-view'
import { UsersManagementView } from '@/components/users/users-management-view'
import { ProfileSettingsView } from '@/components/profile/profile-settings-view'

export function InventoryApp() {
  const { currentUser } = useInventory()
  const [activeTab, setActiveTab] = useState('dashboard')

  // If not logged in, render the login portal
  if (!currentUser) {
    return <LoginView />
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Top Application Header */}
      <AppHeader onNavigateTab={setActiveTab} />

      {/* Navigation Bar */}
      <AppNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
        {activeTab === 'inventory' && <InventoryTableView />}
        {activeTab === 'stock' && <StockOperationsView />}
        {activeTab === 'analytics' && <InsightsView onNavigate={setActiveTab} />}
        {activeTab === 'backup' && <BackupView />}
        {activeTab === 'reports' && <BackupReportsView />}
        {activeTab === 'users' && <UsersManagementView />}
        {activeTab === 'profile' && <ProfileSettingsView />}
      </main>

      {/* Footer */}
      <footer className="border-t py-4 bg-muted/20 text-center text-xs text-muted-foreground mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>Snug N Play</strong> Inventory System Enterprise Edition • Production Build
          </span>
          <span className="text-[11px]">
            Super Admin: <span className="font-mono text-foreground">amankamran2004@outlook.com</span>
          </span>
        </div>
      </footer>
    </div>
  )
}
