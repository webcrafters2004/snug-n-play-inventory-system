'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { TransactionType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ArrowLeftRight,
  PackagePlus,
  PackageMinus,
  AlertOctagon,
  RotateCcw,
  Search,
  History,
  Eye,
} from 'lucide-react'

export function StockOperationsView() {
  const { products, transactions, adjustStock, canAdjustStock } = useInventory()

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '')
  const [opType, setOpType] = useState<TransactionType>('stock_in')
  const [qty, setQty] = useState(10)
  const [reason, setReason] = useState('Supplier shipment received')
  const [refDoc, setRefDoc] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const selectedProduct = products.find((p) => p.id === selectedProductId)

  const handleExecuteOperation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProductId || qty <= 0 || !canAdjustStock) return
    adjustStock(selectedProductId, opType, qty, reason, refDoc || undefined)
    setQty(10)
    setRefDoc('')
  }

  const filteredTx = transactions.filter((tx) => {
    return (
      tx.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.reason.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Stock Movements & Ledger
            </h2>
            {!canAdjustStock && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                <Eye className="w-3 h-3" /> View Only
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Record physical stock received from suppliers or dispatched for customer deliveries.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Clean Operation Entry Form */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Record Stock Adjustment</h3>
            {!canAdjustStock && (
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                View-Only Access
              </span>
            )}
          </div>

          <form onSubmit={handleExecuteOperation} className="space-y-4">
            {/* 4 Professional Single-Icon Action Selectors (No emoji duplicates) */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={!canAdjustStock}
                onClick={() => {
                  setOpType('stock_in')
                  setReason('Supplier shipment received')
                }}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-150 ${
                  opType === 'stock_in'
                    ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                } ${!canAdjustStock ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <PackagePlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Receive Stock In</span>
              </button>

              <button
                type="button"
                disabled={!canAdjustStock}
                onClick={() => {
                  setOpType('stock_out')
                  setReason('Dispatched customer order')
                }}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-150 ${
                  opType === 'stock_out'
                    ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                } ${!canAdjustStock ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <PackageMinus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Dispatch Stock Out</span>
              </button>

              <button
                type="button"
                disabled={!canAdjustStock}
                onClick={() => {
                  setOpType('damage')
                  setReason('Damaged in storage')
                }}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-150 ${
                  opType === 'damage'
                    ? 'border-rose-600 bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                } ${!canAdjustStock ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Damaged / Write-Off</span>
              </button>

              <button
                type="button"
                disabled={!canAdjustStock}
                onClick={() => {
                  setOpType('return')
                  setReason('Customer return received')
                }}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-150 ${
                  opType === 'return'
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                } ${!canAdjustStock ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <RotateCcw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Customer Return</span>
              </button>
            </div>

            {/* Select Product */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Product SKU & Title
              </label>
              <select
                disabled={!canAdjustStock}
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full h-10 text-xs px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium text-slate-800 dark:text-slate-200"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.name} ({p.quantity} Units in stock)
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity & Reference */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quantity (Units)</label>
                <Input
                  disabled={!canAdjustStock}
                  type="number"
                  min="1"
                  required
                  value={qty}
                  onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                  className="h-10 text-xs font-bold rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Reference / PO #</label>
                <Input
                  disabled={!canAdjustStock}
                  value={refDoc}
                  onChange={(e) => setRefDoc(e.target.value)}
                  placeholder="e.g. PO-8921"
                  className="h-10 text-xs font-mono rounded-xl"
                />
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Reason / Note</label>
              <Input
                disabled={!canAdjustStock}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={!canAdjustStock}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-10 rounded-xl shadow-xs text-xs"
            >
              {canAdjustStock ? 'Save Movement Entry' : 'View Only Mode'}
            </Button>
          </form>
        </div>

        {/* Right: Live Projection Card */}
        <div className="lg:col-span-6 space-y-4">
          {selectedProduct && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Product Summary
                </span>
                <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 mt-1 block">
                  {selectedProduct.sku}
                </span>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white mt-0.5">
                  {selectedProduct.name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{selectedProduct.category} • {selectedProduct.brand}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Current Stock</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{selectedProduct.quantity.toLocaleString()} Units</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Movement Delta</span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {opType === 'stock_in' || opType === 'return' ? `+${qty}` : `-${qty}`} Units
                  </span>
                </div>
              </div>

              <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 rounded-xl text-center">
                <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 block uppercase tracking-wider">
                  Projected New Balance
                </span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1 block">
                  {opType === 'stock_in' || opType === 'return'
                    ? selectedProduct.quantity + qty
                    : Math.max(0, selectedProduct.quantity - qty)}{' '}
                  Units
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Movement Ledger Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            Stock Movement History
          </h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs..."
              className="pl-8 h-8 text-xs w-52 rounded-xl"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-center">Type</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Logged By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredTx.slice(0, 15).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">{tx.date}</td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{tx.sku}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{tx.productName}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      tx.type === 'stock_in' || tx.type === 'return'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    }`}>
                      {tx.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-xs">
                    {tx.type === 'stock_in' || tx.type === 'return' ? `+${tx.quantity}` : `-${tx.quantity}`}
                  </td>
                  <td className="py-3 px-4 text-slate-500 truncate max-w-[220px]">{tx.reason}</td>
                  <td className="py-3 px-4 text-slate-400">{tx.userName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
