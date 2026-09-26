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
  CheckCircle2,
  History,
} from 'lucide-react'

export function StockOperationsView() {
  const { products, transactions, adjustStock } = useInventory()

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '')
  const [opType, setOpType] = useState<TransactionType>('stock_in')
  const [qty, setQty] = useState(10)
  const [reason, setReason] = useState('Supplier shipment received')
  const [refDoc, setRefDoc] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const selectedProduct = products.find((p) => p.id === selectedProductId)

  const handleExecuteOperation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProductId || qty <= 0) return
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
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <ArrowLeftRight className="w-6 h-6 text-purple-600" />
          Stock In & Out Operations
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Quickly record incoming shipments or customer order dispatches.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Simple Movement Entry Form */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Record Warehouse Movement</h3>

          <form onSubmit={handleExecuteOperation} className="space-y-4">
            {/* 4 Big Simple Operation Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpType('stock_in')
                  setReason('Received supplier shipment')
                }}
                className={`p-3 rounded-2xl border-2 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  opType === 'stock_in'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <PackagePlus className="w-4 h-4 text-emerald-600" />
                📥 Receive Stock (+)
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpType('stock_out')
                  setReason('Dispatched customer order')
                }}
                className={`p-3 rounded-2xl border-2 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  opType === 'stock_out'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <PackageMinus className="w-4 h-4 text-purple-600" />
                🚚 Dispatch Stock (-)
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpType('damage')
                  setReason('Damaged in storage')
                }}
                className={`p-3 rounded-2xl border-2 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  opType === 'damage'
                    ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                ⚠️ Damaged Item (-)
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpType('return')
                  setReason('Customer return received')
                }}
                className={`p-3 rounded-2xl border-2 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  opType === 'return'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <RotateCcw className="w-4 h-4 text-blue-600" />
                🔄 Return (+)
              </button>
            </div>

            {/* Select Product */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Choose Product / SKU</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full h-10 text-xs px-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.name} ({p.quantity} Units in {p.warehouse})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity & Reference */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={qty}
                  onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                  className="h-10 text-sm font-black rounded-2xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Invoice / Order #</label>
                <Input
                  value={refDoc}
                  onChange={(e) => setRefDoc(e.target.value)}
                  placeholder="e.g. PO-991"
                  className="h-10 text-xs font-mono rounded-2xl"
                />
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reason / Notes</label>
              <Input
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-10 text-xs rounded-2xl"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-10 rounded-2xl shadow-md text-xs"
            >
              Post Stock Entry
            </Button>
          </form>
        </div>

        {/* Right: Live Preview Box */}
        <div className="lg:col-span-6 space-y-4">
          {selectedProduct && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Selected Product Summary
              </span>

              <div>
                <span className="font-mono font-black text-sm text-indigo-600 dark:text-indigo-400">
                  {selectedProduct.sku}
                </span>
                <h4 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                  {selectedProduct.name}
                </h4>
                <p className="text-xs text-slate-400">{selectedProduct.category}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">Current Stock</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">{selectedProduct.quantity} Units</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">Warehouse</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedProduct.warehouse}</span>
                </div>
              </div>

              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl text-center">
                <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 block uppercase">
                  Projected New Stock Balance:
                </span>
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1 block">
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
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              Recent Stock Movement Logs
            </h3>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search log..."
              className="pl-8 h-8 text-xs w-48 rounded-xl"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Time</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Product</th>
                <th className="p-3.5 text-center">Type</th>
                <th className="p-3.5 text-center">Qty</th>
                <th className="p-3.5">Reason</th>
                <th className="p-3.5">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTx.slice(0, 10).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 text-slate-400 font-mono text-[11px] whitespace-nowrap">{tx.date}</td>
                  <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{tx.sku}</td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{tx.productName}</td>
                  <td className="p-3.5 text-center whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      tx.type === 'stock_in' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3.5 text-center font-black text-sm">
                    {tx.type === 'stock_in' || tx.type === 'return' ? `+${tx.quantity}` : `-${tx.quantity}`}
                  </td>
                  <td className="p-3.5 text-slate-500 truncate max-w-[220px]">{tx.reason}</td>
                  <td className="p-3.5 text-slate-400">{tx.userName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
