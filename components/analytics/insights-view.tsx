'use client'

import React from 'react'
import { useInventory } from '@/context/inventory-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  Flame,
  Snowflake,
  Boxes,
  Warehouse,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function InsightsView({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { products } = useInventory()

  const fastMovers = [...products].sort((a, b) => a.quantity - b.quantity).slice(0, 4)
  const overstocked = [...products].filter((p) => p.quantity > p.minStock * 2).slice(0, 4)

  const categoryQtyData = Array.from(new Set(products.map((p) => p.category))).map((cat) => ({
    name: cat.split(' ')[0],
    Quantity: products.filter((p) => p.category === cat).reduce((sum, p) => sum + p.quantity, 0),
  }))

  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0)
  const lowStockCount = products.filter((p) => p.status === 'low_stock' || p.status === 'out_of_stock').length

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          Physical Stock Analytics & Velocity Insights
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Distribution across categories, warehouse stock velocity, and replenishment alerts.
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4 pb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Inventory</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-slate-900 dark:text-white">{totalUnits} Units</div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-bold">In Active Warehouses</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4 pb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">SKU Health</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {((products.filter((p) => p.status === 'in_stock').length / (products.length || 1)) * 100).toFixed(0)}% Optimal
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Stock status index</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4 pb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Attention Required</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{lowStockCount} SKUs</div>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 font-bold">Under safety threshold</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4 pb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Active Hubs</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">3 Locations</div>
            <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Karachi, Lahore, Islamabad</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Units Chart */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-5 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Boxes className="w-4 h-4 text-indigo-600" />
            Total Units by Category
          </CardTitle>
          <CardDescription className="text-xs">
            Physical stock allocation across main inventory product lines.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-2">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryQtyData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Units`, 'Quantity']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                />
                <Bar dataKey="Quantity" name="Physical Units" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Two columns: High Demand vs Overstocked SKUs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fast Movers */}
        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Flame className="w-4 h-4 text-orange-500" />
                Low Stock / High Velocity SKUs
              </CardTitle>
              <CardDescription className="text-xs">Items running low that need warehouse restock.</CardDescription>
            </div>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-[10px] rounded-xl font-bold">
              Restock Priority
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {fastMovers.map((p) => (
                <div key={p.id} className="p-4 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{p.sku}</span>
                    <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{p.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-slate-900 dark:text-white">{p.quantity} Units</span>
                    <span className="text-[10px] text-slate-400 block font-semibold">Min Limit: {p.minStock}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Overstocked SKUs */}
        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Snowflake className="w-4 h-4 text-blue-500" />
                Well-Stocked Inventory
              </CardTitle>
              <CardDescription className="text-xs">Items with healthy reserve stock across depots.</CardDescription>
            </div>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-[10px] rounded-xl font-bold">
              Sufficient Stock
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {overstocked.map((p) => (
                <div key={p.id} className="p-4 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{p.sku}</span>
                    <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{p.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-blue-600 dark:text-blue-400">{p.quantity} Units</span>
                    <span className="text-[10px] text-slate-400 block font-semibold">Cap: {p.maxStock}</span>
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
