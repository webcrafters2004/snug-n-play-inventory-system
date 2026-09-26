'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Package,
  Boxes,
  DollarSign,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Download,
  Upload,
  Plus,
  ArrowUpDown,
  Sparkles,
  ArrowRight,
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
import { exportProductsToExcel, downloadSampleTemplate } from '@/lib/excel-helper'
import { ExcelImportModal } from '@/components/inventory/excel-import-modal'
import { ProductModal } from '@/components/inventory/product-modal'

export function DashboardView({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { products, settings, adjustStock } = useInventory()
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const totalSkus = products.length
  const totalUnits = products.reduce((acc, p) => acc + p.quantity, 0)
  const totalCostValuation = products.reduce((acc, p) => acc + p.quantity * p.unitCost, 0)
  const totalRetailValuation = products.reduce((acc, p) => acc + p.quantity * p.sellingPrice, 0)
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

  const formatCurrency = (val: number) => `${settings.currencySymbol} ${val.toLocaleString()}`

  return (
    <div className="space-y-6 pb-12">
      {/* Big Action Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Snug N Play Live Hub
          </div>
          <h1 className="text-2xl font-black tracking-tight">Inventory Overview</h1>
          <p className="text-xs text-indigo-100 max-w-md">
            Quickly import Excel catalogs, monitor live stock levels, and dispatch orders.
          </p>
        </div>

        {/* Big Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="bg-white text-indigo-700 hover:bg-slate-100 font-extrabold text-xs h-10 px-4 rounded-2xl shadow-md"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Product
          </Button>

          <Button
            size="sm"
            onClick={() => setIsImportOpen(true)}
            className="bg-indigo-950/60 hover:bg-indigo-950 border border-white/20 text-white font-extrabold text-xs h-10 px-4 rounded-2xl shadow-md"
          >
            <Upload className="w-4 h-4 mr-1 text-emerald-400" />
            Import Excel
          </Button>

          <Button
            size="sm"
            onClick={() => exportProductsToExcel(products)}
            className="bg-indigo-950/60 hover:bg-indigo-950 border border-white/20 text-white font-extrabold text-xs h-10 px-4 rounded-2xl shadow-md"
          >
            <Download className="w-4 h-4 mr-1 text-amber-400" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* 4 Big, Clean KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total SKUs */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Products</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalSkus} SKUs</div>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-1 inline-block">
              In Master Catalog
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Total Units */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Units in Stock</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalUnits.toLocaleString()}</div>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold mt-1 inline-block">
              Across Warehouses
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* Stock Valuation */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Stock Cost Value</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(totalCostValuation)}
            </div>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 inline-block">
              Retail Value: {formatCurrency(totalRetailValuation)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => onNavigate('inventory')}
          className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 shadow-sm flex items-center justify-between cursor-pointer hover:bg-amber-500/15 transition-all"
        >
          <div>
            <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
              Low / Depleted Stock
            </span>
            <div className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-1">
              {lowStockItems.length + outOfStockItems.length} SKUs
            </div>
            <span className="text-[11px] text-amber-700 font-bold mt-1 inline-flex items-center gap-1">
              Click to view items <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Urgent Stock Action List & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Urgent Low Stock Panel */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Urgent Items to Restock
              </h2>
              <p className="text-[11px] text-slate-400">Products under safety minimum stock limit</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('inventory')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400"
            >
              All Products
            </Button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[...outOfStockItems, ...lowStockItems].length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                ✅ All inventory products are well stocked!
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
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                          prod.status === 'out_of_stock'
                            ? 'bg-rose-500 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {prod.status === 'out_of_stock' ? '0 STOCK' : 'LOW STOCK'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{prod.name}</p>
                    <p className="text-[10px] text-slate-400">{prod.warehouse} (Min: {prod.minStock})</p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => adjustStock(prod.id, 'stock_in', 20, 'Urgent Restock from Dashboard')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold h-8 px-3 rounded-xl shadow-xs"
                  >
                    + Restock (20)
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stock Flow Chart */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Monthly Stock Flow
              </h2>
              <p className="text-[11px] text-slate-400">Received Stock vs Dispatched Orders</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
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
                    fontWeight: 'bold',
                  }}
                />
                <Area type="monotone" dataKey="stockIn" name="Stock In" stroke="#6366f1" strokeWidth={3} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="stockOut" name="Stock Out" stroke="#a855f7" strokeWidth={3} fill="url(#colorOut)" />
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
