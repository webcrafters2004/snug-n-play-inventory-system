'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Package,
  Boxes,
  DollarSign,
  AlertTriangle,
  XCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  FileSpreadsheet,
  Download,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { exportProductsToExcel } from '@/lib/excel-helper'

const CHART_COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4']

export function DashboardView({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { products, transactions, settings, adjustStock, hasPermission } = useInventory()
  const [restockSku, setRestockSku] = useState<string | null>(null)
  const [restockQty, setRestockQty] = useState<number>(20)

  // KPI calculations
  const totalSkus = products.length
  const totalUnits = products.reduce((acc, p) => acc + p.quantity, 0)
  const totalCostValuation = products.reduce((acc, p) => acc + p.quantity * p.unitCost, 0)
  const totalRetailValuation = products.reduce((acc, p) => acc + p.quantity * p.sellingPrice, 0)
  const lowStockItems = products.filter((p) => p.status === 'low_stock')
  const outOfStockItems = products.filter((p) => p.status === 'out_of_stock')

  // Stock Flow Trend Mock Data based on transactions
  const stockFlowData = [
    { month: 'Apr', stockIn: 45, stockOut: 32 },
    { month: 'May', stockIn: 68, stockOut: 54 },
    { month: 'Jun', stockIn: 90, stockOut: 72 },
    { month: 'Jul', stockIn: 110, stockOut: 85 },
    { month: 'Aug', stockIn: 95, stockOut: 89 },
    { month: 'Sep', stockIn: 130, stockOut: 104 },
  ]

  // Category Distribution Data
  const categoryMap: Record<string, { count: number; value: number }> = {}
  products.forEach((p) => {
    if (!categoryMap[p.category]) categoryMap[p.category] = { count: 0, value: 0 }
    categoryMap[p.category].count += p.quantity
    categoryMap[p.category].value += p.quantity * p.unitCost
  })

  const categoryChartData = Object.entries(categoryMap).map(([name, data]) => ({
    name,
    value: data.value,
    count: data.count,
  }))

  // Top Stocked Items Bar Data
  const topStockedData = [...products]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map((p) => ({
      name: p.sku,
      title: p.name.substring(0, 20) + '...',
      Stock: p.quantity,
      MinThreshold: p.minStock,
    }))

  const handleQuickRestock = (productId: string) => {
    adjustStock(productId, 'stock_in', restockQty, 'Quick Dashboard Restock PO', `PO-${Date.now().toString().slice(-4)}`)
    setRestockSku(null)
  }

  const formatCurrency = (val: number) => {
    return `${settings.currencySymbol} ${val.toLocaleString()}`
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-background border border-indigo-500/20 shadow-sm backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Snug N Play Executive Inventory Dashboard
            </h1>
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/30 text-[10px]">
              Live Metrics
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time stock valuation, SKU health metrics, category performance, and pending alerts.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => onNavigate('inventory')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 gap-1.5 shadow-sm shadow-indigo-600/20"
          >
            <Package className="w-3.5 h-3.5" />
            Manage Inventory
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => exportProductsToExcel(products)}
            className="text-xs h-8 gap-1.5 border-border hover:bg-muted"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            Export Excel (.xlsx)
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total SKUs */}
        <Card className="border-border/60 shadow-xs hover:border-indigo-500/40 transition-colors">
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total SKUs</span>
            <Package className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-xl font-bold text-foreground">{totalSkus}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Active catalog items</p>
          </CardContent>
        </Card>

        {/* Total Units */}
        <Card className="border-border/60 shadow-xs hover:border-purple-500/40 transition-colors">
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Units</span>
            <Boxes className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-xl font-bold text-foreground">{totalUnits.toLocaleString()}</div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">Across 3 Hubs</p>
          </CardContent>
        </Card>

        {/* Total Cost Valuation */}
        <Card className="border-border/60 shadow-xs hover:border-emerald-500/40 transition-colors">
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Stock Valuation</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalCostValuation)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">At warehouse cost</p>
          </CardContent>
        </Card>

        {/* Retail Expected Value */}
        <Card className="border-border/60 shadow-xs hover:border-blue-500/40 transition-colors">
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Retail Value</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(totalRetailValuation)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Potential revenue</p>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card
          onClick={() => onNavigate('inventory')}
          className="border-amber-500/30 bg-amber-500/5 shadow-xs hover:border-amber-500/60 transition-colors cursor-pointer"
        >
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Low Stock
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-xl font-bold text-amber-700 dark:text-amber-400">{lowStockItems.length}</div>
            <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 mt-0.5 font-medium">Reorder required</p>
          </CardContent>
        </Card>

        {/* Out of Stock */}
        <Card
          onClick={() => onNavigate('inventory')}
          className="border-red-500/30 bg-red-500/5 shadow-xs hover:border-red-500/60 transition-colors cursor-pointer"
        >
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between">
            <span className="text-[11px] font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider">
              Out of Stock
            </span>
            <XCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-xl font-bold text-red-700 dark:text-red-400">{outOfStockItems.length}</div>
            <p className="text-[10px] text-red-700/80 dark:text-red-400/80 mt-0.5 font-medium">0 inventory units</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Stock Flow Trend (Area Chart) */}
        <Card className="lg:col-span-8 border-border/70 shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Monthly Stock Velocity (Inflow vs. Dispatches)
              </CardTitle>
              <CardDescription className="text-xs">Comparison of incoming purchase shipments vs customer dispatches.</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" /> Stock In
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" /> Stock Out
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
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
                  <Area type="monotone" dataKey="stockIn" name="Stock Inflow" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorIn)" />
                  <Area type="monotone" dataKey="stockOut" name="Stock Outflow" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorOut)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown (Donut Chart) */}
        <Card className="lg:col-span-4 border-border/70 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-500" />
              Category Valuation Share
            </CardTitle>
            <CardDescription className="text-xs">Inventory investment by category.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Legend list */}
            <div className="mt-2 space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {categoryChartData.map((cat, idx) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                    <span className="truncate text-muted-foreground">{cat.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{cat.count} units</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lower Section: Urgent Restock Alerts & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Critical Low & Out of Stock Action Table */}
        <Card className="lg:col-span-7 border-border/70 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                Attention Required: Low & Depleted SKUs
              </CardTitle>
              <CardDescription className="text-xs">Items requiring replenishment or supplier purchase order.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('inventory')} className="text-xs h-7 text-indigo-600 dark:text-indigo-400">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {[...outOfStockItems, ...lowStockItems].length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  All items are well above safety stock levels.
                </div>
              ) : (
                [...outOfStockItems, ...lowStockItems].map((prod) => (
                  <div key={prod.id} className="p-3.5 flex items-center justify-between hover:bg-muted/40 transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-foreground">{prod.sku}</span>
                        <Badge
                          variant="outline"
                          className={
                            prod.status === 'out_of_stock'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 text-[9px]'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[9px]'
                          }
                        >
                          {prod.status === 'out_of_stock' ? 'OUT OF STOCK' : 'LOW STOCK'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{prod.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Warehouse: <strong>{prod.warehouse}</strong> | Min: {prod.minStock} units
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-bold text-foreground">{prod.quantity} Units</div>
                        <span className="text-[10px] text-muted-foreground">In Hand</span>
                      </div>

                      {restockSku === prod.id ? (
                        <div className="flex items-center gap-1.5 bg-background border rounded-lg p-1">
                          <input
                            type="number"
                            min="1"
                            value={restockQty}
                            onChange={(e) => setRestockQty(parseInt(e.target.value) || 1)}
                            className="w-14 h-7 text-xs px-2 border rounded bg-muted text-center"
                          />
                          <Button size="sm" className="h-7 text-[10px] bg-indigo-600" onClick={() => handleQuickRestock(prod.id)}>
                            Confirm
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => setRestockSku(null)}>
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRestockSku(prod.id)
                            setRestockQty(prod.minStock * 2)
                          }}
                          className="h-7 text-xs border-amber-500/40 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        >
                          + Restock
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Stock Movement Feed */}
        <Card className="lg:col-span-5 border-border/70 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                Live Stock Movement Feed
              </CardTitle>
              <CardDescription className="text-xs">Recent dispatches, receipts & adjustments.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('stock')} className="text-xs h-7 text-indigo-600 dark:text-indigo-400">
              View Log
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60 max-h-[340px] overflow-y-auto">
              {transactions.slice(0, 6).map((tx) => (
                <div key={tx.id} className="p-3 text-xs flex items-start gap-3 hover:bg-muted/30">
                  <div
                    className={`mt-0.5 p-1.5 rounded-md flex-shrink-0 ${
                      tx.type === 'stock_in'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : tx.type === 'stock_out'
                        ? 'bg-purple-500/10 text-purple-500'
                        : tx.type === 'damage'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-indigo-500/10 text-indigo-500'
                    }`}
                  >
                    {tx.type === 'stock_in' ? (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{tx.sku}</span>
                      <span className="text-[10px] text-muted-foreground">{tx.date}</span>
                    </div>
                    <p className="text-muted-foreground line-clamp-1">{tx.reason}</p>
                    <div className="flex items-center justify-between pt-0.5 text-[10px] text-muted-foreground">
                      <span>By {tx.userName}</span>
                      <span className="font-mono font-bold text-foreground">
                        {tx.type === 'stock_in' ? `+${tx.quantity}` : `-${tx.quantity}`} Units
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
