'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { Button } from '@/components/ui/button'
import {
  Package,
  Boxes,
  AlertTriangle,
  ArrowRight,
  AlertCircle,
  Download,
  Upload,
  Plus,
  ArrowLeftRight,
  Building2,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Calendar,
  X,
} from 'lucide-react'
import { exportProductsToExcel } from '@/lib/excel-helper'
import { ExcelImportModal } from '@/components/inventory/excel-import-modal'
import { ProductModal } from '@/components/inventory/product-modal'
import { WAREHOUSE_LOCATIONS } from '@/lib/types'
import { isDateInRange } from '@/lib/date-filter'

export function DashboardView({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const {
    products,
    transactions,
    currentUser,
    adjustStock,
    canAddEditProducts,
    canImportExcel,
    canExportExcel,
    canAdjustStock,
  } = useInventory()

  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)

  // Date range filter state
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const totalSkus = products.length
  const totalUnits = products.reduce((acc, p) => acc + p.quantity, 0)
  const lowStockItems = products.filter((p) => p.status === 'low_stock')
  const outOfStockItems = products.filter((p) => p.status === 'out_of_stock')
  const totalDamagedUnits = products.reduce((acc, p) => acc + (p.totalDamaged || 0), 0)

  // Date-filtered transactions
  const filteredTransactions = transactions.filter((t) => isDateInRange(t.date, fromDate, toDate))
  const recentTransactions = filteredTransactions.slice(0, 8)
  const periodDispatches = filteredTransactions
    .filter((t) => t.type === 'stock_out')
    .reduce((sum, t) => sum + t.quantity, 0)
  const periodInward = filteredTransactions
    .filter((t) => t.type === 'stock_in' || t.type === 'return')
    .reduce((sum, t) => sum + t.quantity, 0)

  // Location statistics
  const locationStats = WAREHOUSE_LOCATIONS.map((loc) => {
    const locProducts = products.filter((p) => (p.location || p.warehouse || 'Store') === loc)
    const units = locProducts.reduce((sum, p) => sum + p.quantity, 0)
    const skus = locProducts.length
    const percentage = totalUnits > 0 ? Math.round((units / totalUnits) * 100) : 0
    return {
      name: loc,
      units,
      skus,
      percentage,
    }
  })


  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'stock_in':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
            Stock In (+)
          </span>
        )
      case 'stock_out':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300">
            Parcel Out (-)
          </span>
        )
      case 'damage':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
            Damaged (-)
          </span>
        )
      case 'return':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
            Return (+)
          </span>
        )
      case 'transfer':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300">
            Transfer
          </span>
        )
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            {type.replace('_', ' ')}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Dashboard Greeting & Quick Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome, {currentUser?.name || 'Inventory Team'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Snug N' Play SMC-Pvt Limited — Inventory Management System (Site: Karachi)
          </div>
        </div>

        {/* Quick Actions (Simple, large hit targets for non-technical users) */}
        <div className="flex items-center gap-2 flex-wrap">
          {canAddEditProducts && (
            <Button
              size="sm"
              onClick={() => setIsAddOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Product
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate('stock')}
            className="border-slate-200 dark:border-slate-700 font-semibold text-xs h-9 px-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
            Stock In / Out
          </Button>

          {canImportExcel && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsImportOpen(true)}
              className="border-slate-200 dark:border-slate-700 font-medium text-xs h-9 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Upload className="w-3.5 h-3.5 mr-1 text-slate-600 dark:text-slate-400" />
              Import
            </Button>
          )}

          {canExportExcel && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportProductsToExcel(products)}
              className="border-slate-200 dark:border-slate-700 font-medium text-xs h-9 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* 2. Page Section Title & Date Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dashboard</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Live snapshot of stock health across all locations.
          </p>
        </div>

        {/* Date Filter Toolbar (Matching Reference Site) */}
        <div className="flex flex-wrap items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 pl-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Filter:</span>
          </div>
          <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-7 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>To</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-7 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </label>
          {(fromDate || toDate) && (
            <button
              onClick={() => { setFromDate(''); setToDate('') }}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg font-medium transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>


      {/* 3. Stat Grid: 5 3D-Elevated Cards Matching Reference Website */}
      <div className="stat-grid">
        {/* Total SKUs */}
        <div className="stat-card info">
          <span className="label">Total Products</span>
          <div className="value">{totalSkus}</div>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1 block">
            Registered SKUs
          </span>
        </div>

        {/* Units on Hand */}
        <div className="stat-card good">
          <span className="label">Units on Hand</span>
          <div className="value">{totalUnits.toLocaleString()}</div>
          <span className="text-[11px] font-medium text-emerald-600/80 dark:text-emerald-400/80 mt-1 block">
            Physical Warehouse Count
          </span>
        </div>

        {/* Low Stock Warning */}
        <div
          onClick={() => onNavigate('inventory')}
          className="stat-card alert cursor-pointer hover:border-amber-400 transition-colors"
          title="Click to view low stock products"
        >
          <span className="label">Low Stock Alert</span>
          <div className="value">{lowStockItems.length}</div>
          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-1 inline-flex items-center gap-1">
            Need Restocking <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => onNavigate('inventory')}
          className="stat-card bad cursor-pointer hover:border-rose-400 transition-colors"
          title="Click to view out of stock products"
        >
          <span className="label">Out of Stock</span>
          <div className="value">{outOfStockItems.length}</div>
          <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 mt-1 block">
            Zero Stock Remaining
          </span>
        </div>

        {/* Damaged Units */}
        <div className="stat-card purple">
          <span className="label">Damaged Units</span>
          <div className="value">{totalDamagedUnits}</div>
          <span className="text-[11px] font-medium text-purple-600/80 dark:text-purple-400/80 mt-1 block">
            Reported in Storage / Transit
          </span>
        </div>
      </div>

      {/* 4. Location-wise Stock (Clean Table matching reference website) */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3>Location-wise Stock Breakdown</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Karachi Site Warehouses
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-5">Location</th>
                <th className="py-3 px-4 text-center">Product SKUs</th>
                <th className="py-3 px-4 font-mono">Units on Hand</th>
                <th className="py-3 px-4">Proportion of Stock</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {locationStats.map((loc) => (
                <tr
                  key={loc.name}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                    {loc.name}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {loc.skus} Items
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {loc.units.toLocaleString()} Units
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-[140px] h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(loc.percentage, 2))}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                        {loc.percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-5 text-right">
                    <button
                      onClick={() => onNavigate('inventory')}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View Items &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Two-Column Layout: Urgent Replenishment & Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Urgent Low / Out of Stock List */}
        <div className="lg:col-span-6 panel">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3>Urgent Restock Needed</h3>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All ({lowStockItems.length + outOfStockItems.length})
            </button>
          </div>

          <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800/80">
            {[...outOfStockItems, ...lowStockItems].length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-80" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  All inventory healthy!
                </span>
                <span>No products are currently low or out of stock.</span>
              </div>
            ) : (
              [...outOfStockItems, ...lowStockItems].slice(0, 6).map((prod) => (
                <div key={prod.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {prod.sku}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                          prod.status === 'out_of_stock'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                        }`}
                      >
                        {prod.status === 'out_of_stock' ? 'Out of Stock (0)' : 'Low Stock'}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                        {prod.location || 'Store'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={prod.name}>
                      {prod.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Current: <strong className="text-slate-700 dark:text-slate-200">{prod.quantity}</strong> | Min Threshold: {prod.minStock || 5}
                    </p>
                  </div>

                  {canAdjustStock && (
                    <Button
                      size="sm"
                      onClick={() => adjustStock(prod.id, 'stock_in', 20, 'Restock from Dashboard')}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold h-8 px-3 rounded-xl shadow-xs shrink-0"
                    >
                      + Restock (20)
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Recent Stock Movements Activity */}
        <div className="lg:col-span-6 panel">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3>Recent Stock Movements</h3>
            </div>
            <button
              onClick={() => onNavigate('stock')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Full Ledger &rarr;
            </button>
          </div>

          <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentTransactions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No recent stock movements recorded yet.
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getMovementBadge(tx.type)}
                      <span className="font-mono font-bold text-[11px] text-indigo-600 dark:text-indigo-400">
                        {tx.sku}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {tx.date}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate" title={tx.productName}>
                      {tx.productName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Logged by: <strong className="text-slate-600 dark:text-slate-300">{tx.userName}</strong>
                      {tx.orderReference && ` • Order #${tx.orderReference}`}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                      {tx.type === 'stock_out' || tx.type === 'damage' ? `-${tx.quantity}` : `+${tx.quantity}`}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Units</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ExcelImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      <ProductModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  )
}
