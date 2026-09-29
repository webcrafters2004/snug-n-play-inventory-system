'use client'

import React, { useState, useRef } from 'react'
import { useInventory } from '@/context/inventory-context'
import { Product, Transaction, AuditLogItem, WAREHOUSE_LOCATIONS } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  FileSpreadsheet,
  Search,
  Filter,
  ShieldCheck,
  Download,
  Upload,
  Activity,
  UserCheck,
  Package,
  Layers,
  HardDriveDownload,
  AlertTriangle,
  CheckCircle2,
  Truck,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Eye,
  FileCheck,
  AlertOctagon,
  Building2,
  Calendar,
} from 'lucide-react'
import {
  exportDamageReport,
  exportParcelsDispatchedReport,
  exportShopify3WayAuditReport,
  exportProductsToExcel,
  downloadShopifyTemplate,
  downloadQuickBooksTemplate,
  parseExternalReconciliationFile,
} from '@/lib/excel-helper'
import * as XLSX from 'xlsx'

export function BackupReportsView() {
  const {
    products,
    transactions,
    auditLogs,
    backups,
    createCategorizedBackup,
    updatePhysicalCount,
    importShopifyStock,
    importQuickBooksStock,
    currentUser,
    dailyCheckin,
  } = useInventory()

  const [activeSection, setActiveSection] = useState<'backups' | 'sku360' | 'audit3way' | 'logs'>('backups')
  
  // SKU 360 Search State
  const [selectedSkuId, setSelectedSkuId] = useState<string>(products[0]?.id || '')
  const [skuSearchTerm, setSkuSearchTerm] = useState('')

  // 3-Way Audit Filter & Edit State
  const [auditFilter, setAuditFilter] = useState<'all' | 'discrepancy' | 'matched'>('all')
  const [editingPhysicalId, setEditingPhysicalId] = useState<string | null>(null)
  const [tempPhysicalVal, setTempPhysicalVal] = useState<number>(0)

  // Audit Logs Filter State
  const [logSearchTerm, setLogSearchTerm] = useState('')
  const [selectedModule, setSelectedModule] = useState<string>('ALL')

  // File upload refs
  const shopifyFileRef = useRef<HTMLInputElement>(null)
  const qbFileRef = useRef<HTMLInputElement>(null)

  // Computed metrics
  const damagedProducts = products.filter((p) => (p.totalDamaged && p.totalDamaged > 0) || p.quantity <= 0)
  const totalDamagedUnits = products.reduce((acc, p) => acc + (p.totalDamaged || 0), 0)
  const dispatchedTransactions = transactions.filter((t) => t.type === 'stock_out')
  const totalDispatchedUnits = dispatchedTransactions.reduce((acc, t) => acc + t.quantity, 0)
  const totalPhysicalUnits = products.reduce((acc, p) => acc + p.quantity, 0)

  const discrepancies = products.filter((p) => {
    const phys = p.physicalStock ?? p.quantity
    const shop = p.shopifyStock ?? p.quantity
    return phys !== shop
  })

  // SKU 360 Selected Product
  const selectedProduct = products.find((p) => p.id === selectedSkuId) || products[0]
  const selectedProductTx = transactions.filter((t) => t.sku === selectedProduct?.sku)

  // Filtered 3-Way Audit items
  const filteredAuditProducts = products.filter((p) => {
    const phys = p.physicalStock ?? p.quantity
    const shop = p.shopifyStock ?? p.quantity
    const hasDiff = phys !== shop

    if (auditFilter === 'discrepancy') return hasDiff
    if (auditFilter === 'matched') return !hasDiff
    return true
  })

  // Filtered Logs
  const modules = ['ALL', 'Auth', 'Inventory', 'Stock', 'Backup', 'Users', 'Settings', 'Audit', 'Reports']
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(logSearchTerm.toLowerCase())
    const matchesModule = selectedModule === 'ALL' || log.module === selectedModule
    return matchesSearch && matchesModule
  })

  // Handle batch download of all 4 categorized reports
  const handleDownloadAll4Reports = () => {
    createCategorizedBackup('damage')
    setTimeout(() => createCategorizedBackup('parcels'), 300)
    setTimeout(() => createCategorizedBackup('inventory'), 600)
    setTimeout(() => createCategorizedBackup('shopify'), 900)
  }

  // Handle Shopify Import
  const handleShopifyFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const records = await parseExternalReconciliationFile(file)
      const count = importShopifyStock(records)
      alert(`Successfully synchronized ${count} SKU balances from Shopify spreadsheet!`)
    } catch (err: any) {
      alert(`Error reading Shopify file: ${err.message || 'Invalid spreadsheet'}`)
    } finally {
      if (shopifyFileRef.current) shopifyFileRef.current.value = ''
    }
  }

  // Handle QuickBooks Import
  const handleQuickBooksFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const records = await parseExternalReconciliationFile(file)
      const count = importQuickBooksStock(records)
      alert(`Successfully synchronized ${count} SKU balances from QuickBooks spreadsheet!`)
    } catch (err: any) {
      alert(`Error reading QuickBooks file: ${err.message || 'Invalid spreadsheet'}`)
    } finally {
      if (qbFileRef.current) qbFileRef.current.value = ''
    }
  }

  // Export Audit log to Excel
  const exportAuditReportToExcel = () => {
    const rows = filteredLogs.map((l) => ({
      'Log ID': l.id,
      Timestamp: l.timestamp,
      Module: l.module,
      Action: l.action,
      Description: l.description,
      'User Name': l.userName,
      'User Email': l.userEmail,
      Role: l.role.toUpperCase(),
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Audit_Report')
    XLSX.writeFile(wb, `SnugNPlay_Audit_Report_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Reports, Automated Backups & 3-Way Audit
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Automated daily snapshots, categorized Excel backups for <strong>Damaged Goods</strong>,{' '}
            <strong>Dispatched Parcels</strong>, <strong>Master Inventory</strong>, and <strong>Shopify Reconciliation</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            onClick={handleDownloadAll4Reports}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-10 px-4 rounded-2xl shadow-md shadow-indigo-600/20"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Download All 4 Daily XLS Backups
          </Button>
        </div>
      </div>

      {/* Automated Daily Backup Status Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-300 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Automated Daily Backups: Active & Synced
              <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px]">
                Daily 10:00 PM Automation
              </Badge>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Today's automatic ledger snapshot is verified. Every stock mutation is backed up into categorized XLS files.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300 self-end sm:self-auto">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Check-in: <strong>{dailyCheckin.dayLabel}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-indigo-600" />
            Locations: <strong>6 Warehouses</strong>
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSection('backups')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSection === 'backups'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HardDriveDownload className="w-4 h-4" />
          Categorized XLS Backups (4 Types)
        </button>

        <button
          onClick={() => setActiveSection('sku360')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSection === 'sku360'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          SKU 360° Fast Lookup
        </button>

        <button
          onClick={() => setActiveSection('audit3way')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSection === 'audit3way'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <RefreshCw className="w-4 h-4 text-emerald-500" />
          Shopify & 3-Way Reconciliation
          {discrepancies.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold">
              {discrepancies.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSection === 'logs'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4 text-blue-500" />
          System Activity Audit Logs
        </button>
      </div>

      {/* SECTION 1: 4 CATEGORIZED XLS BACKUPS */}
      {activeSection === 'backups' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: Damage Stock Backup */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-200 dark:border-rose-950/60 shadow-sm flex flex-col justify-between space-y-4 hover:border-rose-300 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <AlertOctagon className="w-5 h-5" />
                  </span>
                  <Badge className="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 text-[10px] font-bold">
                    {totalDamagedUnits} Damaged Units
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  1. Damage Stock Backup (.xlsx)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Dedicated report of all damaged goods across warehouses. Lists SKU codes, location, damaged quantities, latest damage reasons, and remaining good stock.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-slate-400">
                  {damagedProducts.length} Damaged SKU records
                </span>
                <Button
                  size="sm"
                  onClick={() => createCategorizedBackup('damage')}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download Damage Report
                </Button>
              </div>
            </div>

            {/* Card 2: Dispatched Parcels / Stock Out Backup */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-indigo-200 dark:border-indigo-950/60 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </span>
                  <Badge className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 text-[10px] font-bold">
                    {dispatchedTransactions.length} Dispatches
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  2. Dispatched Parcels Backup (.xlsx)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Full log of outgoing customer parcels and dispatches. Contains mandatory Order # / Parcel Reference, dispatched quantities, operator names, and timestamps.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-slate-400">
                  {totalDispatchedUnits} Total Outgoing Units
                </span>
                <Button
                  size="sm"
                  onClick={() => createCategorizedBackup('parcels')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download Parcels Report
                </Button>
              </div>
            </div>

            {/* Card 3: Inventory Master Catalog Backup */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-emerald-200 dark:border-emerald-950/60 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </span>
                  <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                    {products.length} Active SKUs
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  3. Master Inventory Catalog Backup (.xlsx)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Comprehensive physical warehouse stock on hand. Covers all 6 warehouse locations (Store, Shed, Red/Blue/Grey Containers, Office), threshold levels, and status.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-slate-400">
                  {totalPhysicalUnits.toLocaleString()} Physical Units on Hand
                </span>
                <Button
                  size="sm"
                  onClick={() => createCategorizedBackup('inventory')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download Master Catalog
                </Button>
              </div>
            </div>

            {/* Card 4: Shopify 3-Way Reconciliation Backup */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-amber-200 dark:border-amber-950/60 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-300 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5" />
                  </span>
                  <Badge className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[10px] font-bold">
                    {discrepancies.length} Variances Detected
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  4. Shopify & 3-Way Audit Backup (.xlsx)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Direct audit sheet cross-matching Physical Warehouse Count against Shopify online stock and QuickBooks accounting inventory with calculated variances.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-slate-400">
                  Physical vs Shopify Comparison
                </span>
                <Button
                  size="sm"
                  onClick={() => createCategorizedBackup('shopify')}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download 3-Way Audit
                </Button>
              </div>
            </div>
          </div>

          {/* Backup History Table */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Backup Archive</h3>
                <p className="text-[11px] text-slate-400">Chronological history of automatic & on-demand snapshots</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                {backups.length} Saved Snapshots
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Backup Name</th>
                    <th className="py-3 px-4">Backup Scope</th>
                    <th className="py-3 px-4 text-center">Type</th>
                    <th className="py-3 px-4 text-center">Format</th>
                    <th className="py-3 px-4 text-center">Records</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Created By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {backups.slice(0, 10).map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-indigo-500" />
                        {b.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {b.category || 'all'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.type === 'automated'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                        }`}>
                          {b.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold uppercase text-[10px] text-slate-500">
                        {b.format || 'json'}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {b.recordsCount} items
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{b.createdAt}</td>
                      <td className="py-3 px-4 text-right text-slate-500">{b.createdBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: SKU 360 FAST LOOKUP CARD */}
      {activeSection === 'sku360' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  SKU 360° Fast Intelligence Card
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Instant real-time visibility into physical stock, Shopify count, warehouse location, and movement ledger.
                </p>
              </div>

              {/* SKU Selector / Search */}
              <div className="w-full sm:w-80">
                <select
                  value={selectedSkuId}
                  onChange={(e) => setSelectedSkuId(e.target.value)}
                  className="w-full h-10 text-xs px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white shadow-xs"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} — {p.name} ({p.quantity} Units)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedProduct && (
              <div className="space-y-6">
                {/* Product Profile & Live Counters */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Product Identity & Image */}
                  <div className="lg:col-span-5 flex items-start gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                      {selectedProduct.imageUrl ? (
                        <img
                          src={selectedProduct.imageUrl}
                          alt={selectedProduct.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/logo.webp'
                          }}
                        />
                      ) : (
                        <Package className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                      )}
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md inline-block">
                        {selectedProduct.sku}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate" title={selectedProduct.name}>
                        {selectedProduct.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">Total Stock: {selectedProduct.quantity} units</p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                          {selectedProduct.location || 'Store'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {selectedProduct.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Key Audit Counters */}
                  <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 text-center">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                        Physical Stock
                      </span>
                      <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-1 block">
                        {selectedProduct.quantity}
                      </span>
                      <span className="text-[10px] text-emerald-600/80 font-medium">Warehouse Count</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 text-center">
                      <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">
                        Shopify Stock
                      </span>
                      <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300 font-mono mt-1 block">
                        {selectedProduct.shopifyStock ?? selectedProduct.quantity}
                      </span>
                      <span className="text-[10px] text-indigo-600/80 font-medium">Online Channel</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/60 text-center">
                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider block">
                        Damaged Units
                      </span>
                      <span className="text-2xl font-black text-rose-700 dark:text-rose-300 font-mono mt-1 block">
                        {selectedProduct.totalDamaged || 0}
                      </span>
                      <span className="text-[10px] text-rose-600/80 font-medium">Non-sellable</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 text-center">
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
                        Variance (Delta)
                      </span>
                      <span className={`text-2xl font-black font-mono mt-1 block ${
                        (selectedProduct.quantity - (selectedProduct.shopifyStock ?? selectedProduct.quantity)) === 0
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }`}>
                        {selectedProduct.quantity - (selectedProduct.shopifyStock ?? selectedProduct.quantity)}
                      </span>
                      <span className="text-[10px] text-amber-600/80 font-medium">Physical - Shopify</span>
                    </div>
                  </div>
                </div>

                {/* SKU Transaction Ledger */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    Ledger History for SKU: {selectedProduct.sku}
                  </h4>

                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold text-[11px]">
                        <tr>
                          <th className="py-2.5 px-4">Date</th>
                          <th className="py-2.5 px-4">Type</th>
                          <th className="py-2.5 px-4 text-center">Quantity</th>
                          <th className="py-2.5 px-4">Order / Ref</th>
                          <th className="py-2.5 px-4">Reason / Notes</th>
                          <th className="py-2.5 px-4 text-right">Logged By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {selectedProductTx.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-400 text-xs">
                              No stock movement events recorded for this SKU yet.
                            </td>
                          </tr>
                        ) : (
                          selectedProductTx.slice(0, 8).map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                              <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">{tx.date}</td>
                              <td className="py-2.5 px-4">
                                <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {tx.type.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-center font-mono font-bold text-xs">
                                {tx.type === 'stock_in' || tx.type === 'return' ? `+${tx.quantity}` : `-${tx.quantity}`}
                              </td>
                              <td className="py-2.5 px-4 font-mono text-indigo-600 dark:text-indigo-400">
                                {tx.orderReference || 'N/A'}
                              </td>
                              <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300 truncate max-w-xs">{tx.reason}</td>
                              <td className="py-2.5 px-4 text-right text-slate-400">{tx.userName}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: 3-WAY RECONCILIATION SCREEN */}
      {activeSection === 'audit3way' && (
        <div className="space-y-6">
          {/* Controls & Import Bar */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-emerald-500" />
                Physical vs Shopify vs QuickBooks 3-Way Audit
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Upload your latest Shopify or QuickBooks export spreadsheet to reconcile physical warehouse stock.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Hidden file inputs */}
              <input
                type="file"
                ref={shopifyFileRef}
                onChange={handleShopifyFileUpload}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />
              <input
                type="file"
                ref={qbFileRef}
                onChange={handleQuickBooksFileUpload}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />

              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadShopifyTemplate()}
                className="text-xs h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700"
                title="Download Shopify sample layout"
              >
                <Download className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Shopify Template
              </Button>

              <Button
                size="sm"
                onClick={() => shopifyFileRef.current?.click()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-xs"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Import Shopify (.xlsx)
              </Button>

              <Button
                size="sm"
                onClick={() => qbFileRef.current?.click()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-xs"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Import QuickBooks (.xlsx)
              </Button>

              <Button
                size="sm"
                onClick={() => exportShopify3WayAuditReport(products)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export Audit (.xlsx)
              </Button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAuditFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                auditFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border'
              }`}
            >
              All Items ({products.length})
            </button>
            <button
              onClick={() => setAuditFilter('discrepancy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                auditFilter === 'discrepancy'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-rose-600 border border-rose-200 dark:border-rose-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Discrepancies Only ({discrepancies.length})
            </button>
            <button
              onClick={() => setAuditFilter('matched')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                auditFilter === 'matched'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-emerald-600 border border-emerald-200 dark:border-emerald-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Fully Matched ({products.length - discrepancies.length})
            </button>
          </div>

          {/* Reconciliation Table */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4 text-center">Physical Stock</th>
                    <th className="py-3 px-4 text-center">Shopify Stock</th>
                    <th className="py-3 px-4 text-center">QuickBooks Stock</th>
                    <th className="py-3 px-4 text-center">Variance</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Physical Audit Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredAuditProducts.map((p) => {
                    const physical = p.physicalStock ?? p.quantity
                    const shopify = p.shopifyStock ?? p.quantity
                    const variance = physical - shopify
                    const isEditing = editingPhysicalId === p.id

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                          {p.sku}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white max-w-[200px] truncate">
                          {p.name}
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800">
                            {p.location || 'Store'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-xs text-emerald-700 dark:text-emerald-400">
                          {isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              value={tempPhysicalVal}
                              onChange={(e) => setTempPhysicalVal(parseInt(e.target.value) || 0)}
                              className="h-7 w-20 text-xs text-center mx-auto"
                            />
                          ) : (
                            `${physical} Units`
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-xs text-indigo-600 dark:text-indigo-400">
                          {shopify} Units
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-xs text-slate-600 dark:text-slate-300">
                          {p.qbStock ?? p.quantity} Units
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-xs">
                          {variance === 0 ? (
                            <span className="text-emerald-600">0</span>
                          ) : (
                            <span className="text-rose-600 font-black">
                              {variance > 0 ? `+${variance}` : variance}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {variance === 0 ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                              MATCHED
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200">
                              VARIANCE ({variance})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                onClick={() => {
                                  updatePhysicalCount(p.id, tempPhysicalVal)
                                  setEditingPhysicalId(null)
                                }}
                                className="h-7 px-2.5 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingPhysicalId(null)}
                                className="h-7 px-2 text-[10px] rounded-lg"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingPhysicalId(p.id)
                                setTempPhysicalVal(physical)
                              }}
                              className="h-7 px-2.5 text-[10px] font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              Update Count
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: ACTIVITY AUDIT LOGS */}
      {activeSection === 'logs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={logSearchTerm}
                onChange={(e) => setLogSearchTerm(e.target.value)}
                placeholder="Search audit descriptions, user email, action code..."
                className="pl-9 h-9 text-xs bg-card"
              />
            </div>

            <div className="sm:col-span-4 flex items-center gap-2">
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full h-9 text-xs px-3 rounded-md border border-input bg-card text-foreground"
              >
                {modules.map((m) => (
                  <option key={m} value={m}>
                    Module: {m}
                  </option>
                ))}
              </select>

              <Button
                size="sm"
                variant="outline"
                onClick={exportAuditReportToExcel}
                className="text-xs h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700 shrink-0"
              >
                <Download className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Export (.xlsx)
              </Button>
            </div>
          </div>

          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Module</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4 text-right">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredLogs.slice(0, 20).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                        {log.module}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge variant="outline" className="font-mono text-[9px] bg-slate-100 dark:bg-slate-800">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white max-w-sm truncate" title={log.description}>
                        {log.description}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{log.userName}</td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="capitalize text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                          {log.role.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
