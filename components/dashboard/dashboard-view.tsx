'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { Button } from '@/components/ui/button'
import {
  Package,
  Boxes,
  AlertTriangle,
  TrendingUp,
  Download,
  Upload,
  Plus,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { exportProductsToExcel } from '@/lib/excel-helper'
import { ExcelImportModal } from '@/components/inventory/excel-import-modal'
import { ProductModal } from '@/components/inventory/product-modal'

export function DashboardView({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const {
    products,
    adjustStock,
    canAddEditProducts,
    canImportExcel,
    canExportExcel,
    canAdjustStock,
  } = useInventory()

  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const totalSkus = products.length
  const totalUnits = products.reduce((acc, p) => acc + p.quantity, 0)
  const lowStockItems = products.filter((p) => p.status === 'low_stock')
  const outOfStockItems = products.filter((p) => p.status === 'out_of_stock')

  const stockFlowData = [
    { month: 'Apr', stockIn: 45, stockOut: 32 },
    { month: 'May', stockIn: 68, stockOut: 54 },
    { month: 'Jun', stockIn: 90, stockOut: 72 },
    { month: 'Jul', stockIn: 110, stockOut: 85 },
    { month: 'Aug', stockIn: 95, stockOut: 89 },
    { month: 'Sep', stockIn: 130, stockOut: 104 },
  ]

  return (
    <div className="space-y-6 pb-12">
      {/* Clean Top Action Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wider block">
            Snug N Play Warehouse
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Stock & Inventory Overview</h1>
          <p className="text-xs text-indigo-100 max-w-lg">
            Track physical warehouse quantities, log incoming shipments, and manage stock thresholds.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {canAddEditProducts && (
            <Button
              size="sm"
              onClick={() => setIsAddOpen(true)}
              className="bg-white text-indigo-700 hover:bg-slate-50 font-semibold text-xs h-9 px-3.5 rounded-xl shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Product
            </Button>
          )}

          {canImportExcel && (
            <Button
              size="sm"
              onClick={() => setIsImportOpen(true)}
              className="bg-indigo-900/60 hover:bg-indigo-900 border border-white/20 text-white font-medium text-xs h-9 px-3.5 rounded-xl shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Import Excel
            </Button>
          )}

          {canExportExcel && (
            <Button
              size="sm"
              onClick={() => exportProductsToExcel(products)}
              className="bg-indigo-900/60 hover:bg-indigo-900 border border-white/20 text-white font-medium text-xs h-9 px-3.5 rounded-xl shadow-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* 4 Focused KPI Cards (Clear, prominent numbers, non-technical readable wording) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Products
            </span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
              {totalSkus}
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 block">
              Registered in Catalog
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Total Units */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Units on Hand
            </span>
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 tracking-tight">
              {totalUnits.toLocaleString()}
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 block">
              Physical Stock Count
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Warning */}
        <div
          onClick={() => onNavigate('inventory')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all hover:shadow-sm"
        >
          <div>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
              Low Stock Warning
            </span>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 tracking-tight">
              {lowStockItems.length}
            </div>
            <span className="text-xs font-medium text-amber-700 dark:text-amber-300 mt-1 inline-flex items-center gap-1">
              {lowStockItems.length === 1 ? '1 Product needs restock' : `${lowStockItems.length} Products need restock`}{' '}
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => onNavigate('inventory')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 shadow-xs flex items-center justify-between cursor-pointer hover:border-rose-400 transition-all hover:shadow-sm"
        >
          <div>
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
              Out of Stock
            </span>
            <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 tracking-tight">
              {outOfStockItems.length}
            </div>
            <span className="text-xs font-medium text-rose-700 dark:text-rose-300 mt-1 block">
              {outOfStockItems.length === 1 ? '1 Product has 0 stock' : `${outOfStockItems.length} Products have 0 stock`}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Urgent Restock & Movement Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Urgent Low Stock Panel */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Urgent Replenishment List
              </h2>
              <p className="text-[11px] text-slate-400">Items below recommended minimum threshold</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('inventory')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              View All
            </Button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {[...outOfStockItems, ...lowStockItems].length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                All inventory products have sufficient stock levels.
              </div>
            ) : (
              [...outOfStockItems, ...lowStockItems].map((prod) => (
                <div key={prod.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {prod.sku}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          prod.status === 'out_of_stock'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {prod.status === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{prod.name}</p>
                    <p className="text-[11px] text-slate-400">Stock: <strong>{prod.quantity}</strong> units</p>
                  </div>

                  {canAdjustStock && (
                    <Button
                      size="sm"
                      onClick={() => adjustStock(prod.id, 'stock_in', 20, 'Restock from Dashboard')}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium h-8 px-3 rounded-xl shadow-xs"
                    >
                      + Restock (20)
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stock Flow Chart */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Monthly Quantity Movement
              </h2>
              <p className="text-[11px] text-slate-400">Units Received (In) vs Units Dispatched (Out)</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                  }}
                />
                <Area type="monotone" dataKey="stockIn" name="Received Units" stroke="#4f46e5" strokeWidth={2.5} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="stockOut" name="Dispatched Units" stroke="#9333ea" strokeWidth={2.5} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ExcelImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      <ProductModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  )
}
