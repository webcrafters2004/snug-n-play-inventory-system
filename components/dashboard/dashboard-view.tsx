'use client'

import React from 'react'
import { useInventory } from '@/context/inventory-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

export function DashboardView({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { products, settings } = useInventory()

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
      {/* Top Welcome Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3">
          <img
            src="/logo.webp"
            alt="Snug N Play"
            className="h-10 w-auto object-contain hidden sm:inline-block"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <div>
            <h1 className="text-xl font-black text-foreground">Snug N Play Overview</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live warehouse stock summary, inventory valuation, and quick actions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => onNavigate('inventory')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 gap-1.5 font-bold"
          >
            <Package className="w-3.5 h-3.5" />
            Open Inventory
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => exportProductsToExcel(products)}
            className="text-xs h-8 gap-1.5 border-border hover:bg-muted font-medium"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total SKUs */}
        <Card className="border-border shadow-xs">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Total SKUs</span>
            <Package className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-black text-foreground">{totalSkus}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Active catalog items</p>
          </CardContent>
        </Card>

        {/* Total Stock Units */}
        <Card className="border-border shadow-xs">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Stock Units</span>
            <Boxes className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-black text-foreground">{totalUnits.toLocaleString()}</div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">In Warehouses</p>
          </CardContent>
        </Card>

        {/* Stock Valuation */}
        <Card className="border-border shadow-xs">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Stock Cost</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalCostValuation)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Total purchase cost</p>
          </CardContent>
        </Card>

        {/* Retail Expected Value */}
        <Card className="border-border shadow-xs">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Retail MSRP</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-black text-blue-600 dark:text-blue-400">
              {formatCurrency(totalRetailValuation)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Estimated revenue</p>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card
          onClick={() => onNavigate('inventory')}
          className="border-amber-500/30 bg-amber-500/5 shadow-xs hover:border-amber-500/60 transition-colors cursor-pointer"
        >
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase">Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-black text-amber-700 dark:text-amber-400">{lowStockItems.length}</div>
            <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 mt-0.5 font-medium">Under safety limit</p>
          </CardContent>
        </Card>

        {/* Out of Stock */}
        <Card
          onClick={() => onNavigate('inventory')}
          className="border-red-500/30 bg-red-500/5 shadow-xs hover:border-red-500/60 transition-colors cursor-pointer"
        >
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
            <span className="text-[11px] font-bold text-red-700 dark:text-red-400 uppercase">Out of Stock</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-black text-red-700 dark:text-red-400">{outOfStockItems.length}</div>
            <p className="text-[10px] text-red-700/80 dark:text-red-400/80 mt-0.5 font-medium">0 Units remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Velocity Flow Chart */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Stock Movement Trend (Inflow vs. Dispatches)
            </CardTitle>
            <CardDescription className="text-xs">
              Comparison of stock received from suppliers vs orders dispatched.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" /> Received
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" /> Dispatched
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-60 w-full">
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
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Area type="monotone" dataKey="stockIn" name="Stock Received" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="stockOut" name="Stock Dispatched" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
