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
import { BackupReportsView } from '@/components/reports/backup-reports-view'
import { UsersManagementView } from '@/components/users/users-management-view'
import { ProfileSettingsView } from '@/components/profile/profile-settings-view'
import { X, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function InventoryApp() {
  const { currentUser, dailyCheckin, respondDailyCheckin, monthlyAudit, confirmMonthlyAudit } = useInventory()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [showCheckinBanner, setShowCheckinBanner] = useState(true)

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

        {/* Store Workflow Reminders & Check-in Banners */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-2">
          {showCheckinBanner && dailyCheckin.status === 'pending' && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 dark:border-amber-700/60 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Warehouse Daily Check-in: Aaj ka kaam hogaya?
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-semibold">
                      {dailyCheckin.dayLabel}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Have all stock out parcel dispatches, received stock in, and damaged units been logged in the system today?
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <Button
                  size="sm"
                  onClick={() => respondDailyCheckin('yes')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 px-3 rounded-xl shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Haan, Sab Done!
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => respondDailyCheckin('no')}
                  className="border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs h-8 px-3 rounded-xl"
                >
                  Nahi, Pending Hai
                </Button>
                <button
                  onClick={() => setShowCheckinBanner(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  title="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {!monthlyAudit.allDone && (
            <div className="bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-200 dark:border-indigo-800/60 p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Monthly Physical Audit Confirmation
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Store team confirmation required for end-of-month stock physical audit.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => confirmMonthlyAudit()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-7 px-3 rounded-xl self-end sm:self-auto shrink-0"
              >
                Confirm Audit Completed
              </Button>
            </div>
          )}
        </div>

        {/* Dynamic Tab Body */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
          {activeTab === 'inventory' && <InventoryTableView />}
          {activeTab === 'stock' && <StockOperationsView />}
          {activeTab === 'reports' && <BackupReportsView />}
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
