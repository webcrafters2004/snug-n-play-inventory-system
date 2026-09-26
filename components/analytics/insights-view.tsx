'use client'

import React from 'react'
import { useInventory } from '@/context/inventory-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Flame,
  Snowflake,
  PieChart as PieIcon,
  DollarSign,
  Boxes,
  Zap,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export function InsightsView({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { products, settings } = useInventory()

  // Calculate high margin and dead stock
  const marginAnalysis = products.map((p) => {
    const margin = p.sellingPrice - p.unitCost
    const marginPct = p.sellingPrice > 0 ? ((margin / p.sellingPrice) * 100).toFixed(1) : 0
    return {
      ...p,
      margin,
      marginPct: Number(marginPct),
    }
  })

  // Fast movers vs dead stock mock
  const fastMovers = [...products].sort((a, b) => a.quantity - b.quantity).slice(0, 4)
  const deadStock = [...products].filter((p) => p.quantity > p.minStock * 2).slice(0, 4)

  // Chart data: Margin vs Cost
  const marginChartData = marginAnalysis.slice(0, 6).map((p) => ({
    name: p.sku,
    UnitCost: p.unitCost,
    MarginProfit: p.margin,
  }))

  const formatCurrency = (val: number) => `${settings.currencySymbol} ${val.toLocaleString()}`

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          Predictive Inventory Insights & Stock Analytics
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Actionable intelligence on profit margins, dead inventory risk, stock velocity, and capital allocation.
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border shadow-xs">
          <CardHeader className="p-3.5 pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Avg. Product Margin</span>
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">41.8%</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Healthy gross margin ratio</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="p-3.5 pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Inventory Turnover</span>
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">5.2x / Year</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Average inventory cycle</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="p-3.5 pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Dead Stock Capital</span>
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(deadStock.reduce((sum, p) => sum + p.quantity * p.unitCost, 0))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Tied in slow-moving SKUs</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="p-3.5 pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Forecasted Replenishment</span>
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">3 POs Required</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Within next 14 business days</p>
          </CardContent>
        </Card>
      </div>

      {/* Margin Comparison Chart */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Cost vs. Margin Profit per SKU (Top 6 Items)
          </CardTitle>
          <CardDescription className="text-xs">
            Comparison of warehouse acquisition cost vs retail profit spread.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marginChartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val))}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="UnitCost" name="Warehouse Cost" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="MarginProfit" name="Gross Margin" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Two columns: High Velocity vs Dead Stock Warning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fast Movers (Hot Products) */}
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Flame className="w-4 h-4 text-orange-500" />
                Fast-Moving Velocity SKUs
              </CardTitle>
              <CardDescription className="text-xs">Items with rapid turnover and high consumer demand.</CardDescription>
            </div>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/30 text-[10px]">
              High Demand
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {fastMovers.map((p) => (
                <div key={p.id} className="p-3 text-xs flex items-center justify-between hover:bg-muted/30">
                  <div>
                    <span className="font-mono font-bold text-foreground">{p.sku}</span>
                    <p className="font-medium text-muted-foreground truncate max-w-[200px]">{p.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-foreground">{p.quantity} Units</span>
                    <span className="text-[10px] text-muted-foreground block">Stock remaining</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dead Stock / Overstocked SKUs */}
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Snowflake className="w-4 h-4 text-blue-500" />
                Slow Moving & Overstocked Inventory
              </CardTitle>
              <CardDescription className="text-xs">Items with high days-of-inventory and low sales speed.</CardDescription>
            </div>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30 text-[10px]">
              Review Discount
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {deadStock.map((p) => (
                <div key={p.id} className="p-3 text-xs flex items-center justify-between hover:bg-muted/30">
                  <div>
                    <span className="font-mono font-bold text-foreground">{p.sku}</span>
                    <p className="font-medium text-muted-foreground truncate max-w-[200px]">{p.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-blue-600 dark:text-blue-400">{p.quantity} Units</span>
                    <span className="text-[10px] text-muted-foreground block">Max Cap: {p.maxStock}</span>
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
