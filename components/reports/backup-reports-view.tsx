'use client'

import React, { useState, useMemo } from 'react'
import { useInventory } from '@/context/inventory-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  FileSpreadsheet,
  Download,
  AlertOctagon,
  Truck,
  Package,
  Calendar,
  Search,
  CheckCircle2,
  HardDriveDownload,
  Clock,
  Building2,
  X,
} from 'lucide-react'
import {
  exportDamageReport,
  exportParcelsDispatchedReport,
  exportStockMovementsReport,
  exportProductsToExcel,
} from '@/lib/excel-helper'
import { isDateInRange } from '@/lib/date-filter'
import * as XLSX from 'xlsx'

export function BackupReportsView() {
  const {
    products,
    transactions,
    auditLogs,
    backups,
    createCategorizedBackup,
    currentUser,
  } = useInventory()

  // Date Range Filter State
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Quick SKU Lookup State
  const [skuSearchTerm, setSkuSearchTerm] = useState('')

  // 1. Filtered Transactions based on Date Range
  const dateFilteredTransactions = useMemo(() => {
    return transactions.filter((t) => isDateInRange(t.date, fromDate, toDate))
  }, [transactions, fromDate, toDate])

  // 2. Dispatches in selected date range
  const filteredDispatches = useMemo(() => {
    return dateFilteredTransactions.filter((t) => t.type === 'stock_out')
  }, [dateFilteredTransactions])

  const totalDispatchedUnits = useMemo(() => {
    return filteredDispatches.reduce((acc, t) => acc + t.quantity, 0)
  }, [filteredDispatches])

  // 3. Damaged goods in selected date range or current stock
  const filteredDamages = useMemo(() => {
    // If date range is active, check damage transactions in that range
    if (fromDate || toDate) {
      const damageTx = dateFilteredTransactions.filter((t) => t.type === 'damage')
      const damagedSkus = new Set(damageTx.map((t) => t.sku))
      return products.filter((p) => damagedSkus.has(p.sku) || (p.totalDamaged && p.totalDamaged > 0))
    }
    return products.filter((p) => (p.totalDamaged && p.totalDamaged > 0) || p.quantity <= 0)
  }, [products, dateFilteredTransactions, fromDate, toDate])

  const totalDamagedUnits = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.totalDamaged || 0), 0)
  }, [products])

  const totalPhysicalUnits = useMemo(() => {
    return products.reduce((acc, p) => acc + p.quantity, 0)
  }, [products])

  // 4. Quick SKU Lookup result
  const searchedProducts = useMemo(() => {
    if (!skuSearchTerm.trim()) return []
    const term = skuSearchTerm.toLowerCase().trim()
    return products
      .filter((p) => p.sku.toLowerCase().includes(term) || p.name.toLowerCase().includes(term))
      .slice(0, 5)
  }, [products, skuSearchTerm])

  // Handlers for Downloading Filtered Reports
  const handleDownloadDamageReport = () => {
    const rangeSuffix = fromDate || toDate ? `_${fromDate || 'Start'}_to_${toDate || 'Today'}` : ''
    exportDamageReport(products, dateFilteredTransactions, `SnugNPlay_Damage_Report${rangeSuffix}.xlsx`)
  }

  const handleDownloadParcelsReport = () => {
    const rangeSuffix = fromDate || toDate ? `_${fromDate || 'Start'}_to_${toDate || 'Today'}` : ''
    exportParcelsDispatchedReport(dateFilteredTransactions, `SnugNPlay_Dispatched_Parcels${rangeSuffix}.xlsx`)
  }

  const handleDownloadMasterCatalog = () => {
    exportProductsToExcel(products, `SnugNPlay_Master_Catalog_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleDownloadMovementsLedger = () => {
    const rangeSuffix = fromDate || toDate ? `_${fromDate || 'Start'}_to_${toDate || 'Today'}` : ''
    exportStockMovementsReport(dateFilteredTransactions, `SnugNPlay_Stock_Movements${rangeSuffix}.xlsx`)
  }

  // Handle batch download of all 4 categorized reports
  const handleDownloadAll4Reports = () => {
    handleDownloadDamageReport()
    setTimeout(handleDownloadParcelsReport, 300)
    setTimeout(handleDownloadMasterCatalog, 600)
    setTimeout(handleDownloadMovementsLedger, 900)
  }

  // Clear Date Filter
  const handleClearDateFilter = () => {
    setFromDate('')
    setToDate('')
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Clean Top Header Matching Reference Site */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Reports & Excel Exports
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Download reports for audit and reconciliation — Excel (.xlsx) format.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleDownloadAll4Reports}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-xs shrink-0"
        >
          <Download className="w-4 h-4 mr-1.5" />
          Download All 4 Excel Reports
        </Button>
      </div>

      {/* 2. Date Range Filter Toolbar (Simple, Direct, Easy to use for non-technical users) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Filter by Date:</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {(fromDate || toDate) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearDateFilter}
              className="h-9 text-xs border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear Filter
            </Button>
          )}
        </div>

        <div className="text-xs">
          {fromDate || toDate ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px]">
              Filtered Period: <strong>{fromDate || 'Start'}</strong> to <strong>{toDate || 'Today'}</strong> ({dateFilteredTransactions.length} movements found)
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">
              Showing all historical records • Select dates above to filter exports
            </span>
          )}
        </div>
      </div>

      {/* 3. 4 Clean Categorized Report Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Report 1: Damage Stock Report */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-rose-200/90 dark:border-rose-950/60 shadow-xs flex flex-col justify-between space-y-4 hover:border-rose-300 transition-colors">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertOctagon className="w-5 h-5" />
              </span>
              <Badge className="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 text-[11px] font-bold">
                {totalDamagedUnits} Damaged Units
              </Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              1. Damage Stock Report (.xlsx)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Dedicated report of all damaged goods across warehouses. Lists SKU codes, location, damaged quantities, damage reasons, and remaining good stock.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <span className="text-[11px] font-mono text-slate-400">
              {filteredDamages.length} Damaged SKU records
            </span>
            <Button
              size="sm"
              onClick={handleDownloadDamageReport}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Damage Report
            </Button>
          </div>
        </div>

        {/* Report 2: Dispatched Parcels / Stock Out Report */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-indigo-200/90 dark:border-indigo-950/60 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-colors">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </span>
              <Badge className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 text-[11px] font-bold">
                {filteredDispatches.length} Dispatches ({totalDispatchedUnits} Units)
              </Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              2. Dispatched Parcels Report (.xlsx)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Full log of outgoing customer parcels and dispatches with Order # / Parcel Reference, dispatched quantities, operator names, and timestamps.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <span className="text-[11px] font-mono text-slate-400">
              {fromDate || toDate ? 'Filtered by date range' : 'All outgoing parcels'}
            </span>
            <Button
              size="sm"
              onClick={handleDownloadParcelsReport}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Parcels Report
            </Button>
          </div>
        </div>

        {/* Report 3: Inventory Master Catalog Report */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-emerald-200/90 dark:border-emerald-950/60 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </span>
              <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                {products.length} Active SKUs
              </Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              3. Master Inventory Stock Report (.xlsx)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Complete physical warehouse stock on hand across all 6 Karachi locations (Store, Shed, Containers, Office), threshold levels, and status.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <span className="text-[11px] font-mono text-slate-400">
              {totalPhysicalUnits.toLocaleString()} Physical Units on Hand
            </span>
            <Button
              size="sm"
              onClick={handleDownloadMasterCatalog}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Master Catalog
            </Button>
          </div>
        </div>

        {/* Report 4: Stock Movement Ledger & Audit Trail */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-amber-200/90 dark:border-amber-950/60 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-300 transition-colors">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <Badge className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[11px] font-bold">
                {dateFilteredTransactions.length} Logged Transactions
              </Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              4. Stock Movement Ledger & Audit (.xlsx)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Complete chronological audit trail of all warehouse entries: Inward arrivals, Outward dispatches, Returns, and Location transfers with user timestamps.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <span className="text-[11px] font-mono text-slate-400">
              {fromDate || toDate ? 'Filtered by date range' : 'Complete movement history'}
            </span>
            <Button
              size="sm"
              onClick={handleDownloadMovementsLedger}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Movement Ledger
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Quick SKU Stock Lookup (Simple, Clean, Non-technical) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Fast SKU Stock Lookup
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Check physical stock and location for any SKU in seconds.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <Input
              value={skuSearchTerm}
              onChange={(e) => setSkuSearchTerm(e.target.value)}
              placeholder="Search by SKU (e.g. SNP-SP-001)..."
              className="pl-9 h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        {skuSearchTerm.trim() && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            {searchedProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No product found matching "{skuSearchTerm}"</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {searchedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {p.sku}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.quantity === 0
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : p.quantity <= (p.minStock || 5)
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {p.quantity === 0 ? 'Out of Stock' : `${p.quantity} in stock`}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={p.name}>
                      {p.name}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span>Location: <strong className="text-slate-700 dark:text-slate-300">{p.location || 'Store'}</strong></span>
                      {p.totalDamaged ? (
                        <span className="text-rose-500 font-medium">Damaged: {p.totalDamaged}</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Recent Backup Archive Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HardDriveDownload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Recent Backup Archive
            </h3>
            <p className="text-[11px] text-slate-400">History of generated backups & Excel snapshots</p>
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
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Records</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {backups.slice(0, 8).map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                    {b.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                      {b.format || 'XLSX'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {b.recordsCount} Items
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {b.createdAt}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownloadAll4Reports()}
                      className="h-8 px-2.5 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
