'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { TransactionType } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeftRight,
  PackagePlus,
  PackageMinus,
  AlertOctagon,
  RotateCcw,
  Search,
  Filter,
  Download,
  History,
  CheckCircle2,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'

export function StockOperationsView() {
  const { products, transactions, adjustStock, currentUser } = useInventory()

  const [activeSubTab, setActiveSubTab] = useState<'create' | 'history'>('create')
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '')
  const [opType, setOpType] = useState<TransactionType>('stock_in')
  const [qty, setQty] = useState(10)
  const [reason, setReason] = useState('Supplier shipment received PO#552')
  const [refDoc, setRefDoc] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('ALL')

  const selectedProduct = products.find((p) => p.id === selectedProductId)

  const handleExecuteOperation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProductId || qty <= 0) return
    adjustStock(selectedProductId, opType, qty, reason, refDoc || undefined)
    setQty(10)
    setRefDoc('')
    setActiveSubTab('history')
  }

  const filteredTx = transactions.filter((tx) => {
    const matchesSearch =
      tx.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.reference && tx.reference.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = filterType === 'ALL' || tx.type === filterType
    return matchesSearch && matchesType
  })

  const typeBadge = (type: TransactionType) => {
    switch (type) {
      case 'stock_in':
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">STOCK IN (+)</Badge>
      case 'stock_out':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px]">STOCK OUT (-)</Badge>
      case 'damage':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 text-[10px]">DAMAGED (-)</Badge>
      case 'return':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px]">CUSTOMER RETURN (+)</Badge>
      case 'adjustment':
        return <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 text-[10px]">MANUAL AUDIT</Badge>
      case 'import':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px]">EXCEL IMPORT</Badge>
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-indigo-500" />
            Stock Movement & Transaction Logs
          </h2>
          <p className="text-xs text-muted-foreground">
            Record goods receipt, customer dispatches, warehouse damage, and audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={activeSubTab === 'create' ? 'default' : 'outline'}
            onClick={() => setActiveSubTab('create')}
            className={`text-xs h-8 ${activeSubTab === 'create' ? 'bg-indigo-600 text-white' : ''}`}
          >
            <PackagePlus className="w-3.5 h-3.5 mr-1" />
            New Stock Operation
          </Button>

          <Button
            size="sm"
            variant={activeSubTab === 'history' ? 'default' : 'outline'}
            onClick={() => setActiveSubTab('history')}
            className={`text-xs h-8 ${activeSubTab === 'history' ? 'bg-indigo-600 text-white' : ''}`}
          >
            <History className="w-3.5 h-3.5 mr-1" />
            Movement History ({transactions.length})
          </Button>
        </div>
      </div>

      {activeSubTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Action Form */}
          <Card className="lg:col-span-7 border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Record Warehouse Movement</CardTitle>
              <CardDescription className="text-xs">
                Select an SKU and specify whether units are coming in or going out.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExecuteOperation} className="space-y-4">
                {/* Movement Type Radio Cards */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Movement Classification</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOpType('stock_in')
                        setReason('Received supplier shipment')
                      }}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                        opType === 'stock_in'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <PackagePlus className="w-4 h-4 text-emerald-500" />
                      Stock In (+)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOpType('stock_out')
                        setReason('Dispatched customer order')
                      }}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                        opType === 'stock_out'
                          ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 font-bold'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <PackageMinus className="w-4 h-4 text-purple-500" />
                      Stock Out (-)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOpType('damage')
                        setReason('Damaged / Defective write-off')
                      }}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                        opType === 'damage'
                          ? 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400 font-bold'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <AlertOctagon className="w-4 h-4 text-red-500" />
                      Damaged (-)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOpType('return')
                        setReason('Restocked return from client')
                      }}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                        opType === 'return'
                          ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <RotateCcw className="w-4 h-4 text-blue-500" />
                      Return (+)
                    </button>
                  </div>
                </div>

                {/* SKU Selector */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Select Target Product / SKU *</Label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full h-9 text-xs px-3 rounded-md border border-input bg-card text-foreground"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} — {p.name} (Current: {p.quantity} Units in {p.warehouse})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity & Ref */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Quantity to Move *</Label>
                    <Input
                      type="number"
                      min="1"
                      required
                      value={qty}
                      onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                      className="h-8 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Reference (PO / Invoice #)</Label>
                    <Input
                      value={refDoc}
                      onChange={(e) => setRefDoc(e.target.value)}
                      placeholder="e.g. PO-7712 or DISP-992"
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Reason / Audit Remark *</Label>
                  <Input
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Weekly wholesale restock from Karachi Hub"
                    className="h-8 text-xs"
                  />
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9">
                  Post Movement to Ledger
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Product Snapshot Card */}
          <div className="lg:col-span-5 space-y-4">
            {selectedProduct && (
              <Card className="border-border shadow-xs bg-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Selected SKU Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div>
                    <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                      {selectedProduct.sku}
                    </span>
                    <h3 className="font-bold text-foreground mt-0.5">{selectedProduct.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{selectedProduct.category}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-card rounded-lg border">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Warehouse Hub</span>
                      <strong className="text-foreground">{selectedProduct.warehouse}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Current Stock</span>
                      <strong className="text-base text-foreground font-mono">{selectedProduct.quantity} Units</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-700 dark:text-indigo-300">
                    <span className="text-[10px] uppercase font-bold block">New Projected Stock:</span>
                    <span className="text-lg font-black font-mono">
                      {opType === 'stock_in' || opType === 'return'
                        ? selectedProduct.quantity + qty
                        : Math.max(0, selectedProduct.quantity - qty)}{' '}
                      Units
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* History SubTab */
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold">Transaction History Ledger</CardTitle>
              <CardDescription className="text-xs">Immutable chronological log of all stock changes.</CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search logs..."
                  className="pl-8 h-8 text-xs w-44"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-8 text-xs px-2.5 rounded-md border border-input bg-card text-foreground"
              >
                <option value="ALL">All Types</option>
                <option value="stock_in">Stock In</option>
                <option value="stock_out">Stock Out</option>
                <option value="damage">Damaged</option>
                <option value="return">Return</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/70 border-b text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">Date & Time</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3 text-center">Type</th>
                    <th className="p-3 text-center">Movement Qty</th>
                    <th className="p-3 text-center">Resulting Balance</th>
                    <th className="p-3">Reference #</th>
                    <th className="p-3">Reason / Remark</th>
                    <th className="p-3">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredTx.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-muted-foreground text-xs">
                        No transaction records found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTx.map((tx) => (
                      <tr key={tx.id} className="hover:bg-muted/30">
                        <td className="p-3 text-muted-foreground whitespace-nowrap">{tx.date}</td>
                        <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                          {tx.sku}
                        </td>
                        <td className="p-3 font-medium max-w-[200px] truncate">{tx.productName}</td>
                        <td className="p-3 text-center whitespace-nowrap">{typeBadge(tx.type)}</td>
                        <td className="p-3 text-center font-bold whitespace-nowrap">
                          {tx.type === 'stock_in' || tx.type === 'return' ? `+${tx.quantity}` : `-${tx.quantity}`}
                        </td>
                        <td className="p-3 text-center font-mono text-muted-foreground whitespace-nowrap">
                          {tx.previousQuantity} → <strong className="text-foreground">{tx.newQuantity}</strong>
                        </td>
                        <td className="p-3 font-mono text-muted-foreground whitespace-nowrap">{tx.reference || '—'}</td>
                        <td className="p-3 text-muted-foreground max-w-[220px] truncate" title={tx.reason}>
                          {tx.reason}
                        </td>
                        <td className="p-3 text-muted-foreground whitespace-nowrap">{tx.userName}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
