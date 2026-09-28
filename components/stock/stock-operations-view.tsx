'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { TransactionType, WAREHOUSE_LOCATIONS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ArrowLeftRight,
  PackagePlus,
  Truck,
  AlertOctagon,
  RotateCcw,
  RefreshCw,
  Search,
  History,
  Eye,
  Trash2,
  FileSpreadsheet,
  Download,
  Building2,
  Link as LinkIcon,
} from 'lucide-react'
import * as XLSX from 'xlsx'

export function StockOperationsView() {
  const { products, transactions, recordMovement, deleteTransaction, canAdjustStock } = useInventory()

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '')
  const [opType, setOpType] = useState<TransactionType>('stock_in')
  const [qty, setQty] = useState(10)
  const [reason, setReason] = useState('Supplier shipment received')
  const [orderReference, setOrderReference] = useState('')
  const [attachmentUrl, setAttachmentUrl] = useState('')
  const [fromLocation, setFromLocation] = useState<string>('Store')
  const [toLocation, setToLocation] = useState<string>('Shed')
  const [adjustDirection, setAdjustDirection] = useState<'increase' | 'decrease'>('increase')
  const [searchTerm, setSearchTerm] = useState('')

  const selectedProduct = products.find((p) => p.id === selectedProductId)

  const handleExecuteOperation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProductId || qty <= 0 || !canAdjustStock) return

    if (opType === 'stock_out' && !orderReference.trim()) {
      alert('Order # / Parcel Reference is required for Dispatched Parcels!')
      return
    }

    const success = recordMovement({
      productId: selectedProductId,
      type: opType,
      quantity: qty,
      reason,
      orderReference: opType === 'stock_out' ? orderReference.trim() : undefined,
      attachmentUrl: attachmentUrl.trim() || undefined,
      fromLocation: opType === 'transfer' ? fromLocation : (selectedProduct?.location || 'Store'),
      toLocation: opType === 'transfer' ? toLocation : undefined,
      direction: opType === 'adjustment' ? adjustDirection : undefined,
    })

    if (success) {
      // Reset inputs to clean defaults
      setQty(1)
      if (opType === 'stock_out') setOrderReference('')
    }
  }

  const handleDeleteWithReversal = (id: string, sku: string, qty: number, type: string) => {
    if (
      confirm(
        `Are you sure you want to delete and REVERSE this movement for SKU ${sku}?\nThis will automatically recalculate and reverse the ${qty} units back into stock.`
      )
    ) {
      deleteTransaction(id)
    }
  }

  const filteredTx = transactions.filter((tx) => {
    return (
      tx.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.orderReference && tx.orderReference.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })

  const exportLedgerToExcel = () => {
    const rows = filteredTx.map((t) => ({
      'Transaction ID': t.id,
      Date: t.date,
      SKU: t.sku,
      'Product Name': t.productName,
      'Movement Type': t.type.toUpperCase().replace('_', ' '),
      Quantity: t.quantity,
      'Previous Quantity': t.previousQuantity,
      'New Quantity': t.newQuantity,
      'Order / Reference': t.orderReference || 'N/A',
      'From Location': t.fromLocation || 'Store',
      'To Location': t.toLocation || '',
      Reason: t.reason,
      'Logged By': t.userName,
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Stock_Movement_Ledger')
    XLSX.writeFile(wb, `SnugNPlay_Stock_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Calculate delta for live projection
  const calculateProjectedStock = () => {
    if (!selectedProduct) return 0
    const curr = selectedProduct.quantity
    if (opType === 'stock_in' || opType === 'return') return curr + qty
    if (opType === 'stock_out' || opType === 'damage') return Math.max(0, curr - qty)
    if (opType === 'adjustment') {
      return adjustDirection === 'increase' ? curr + qty : Math.max(0, curr - qty)
    }
    return curr // transfer within warehouses doesn't change total stock
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Stock Operations & Ledger History
            </h2>
            {!canAdjustStock && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                <Eye className="w-3 h-3" /> View Only
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Record supplier stock in, outgoing parcel dispatches (with Order #), damaged stock, returns, and warehouse transfers.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={exportLedgerToExcel}
          className="text-xs h-9 px-3.5 rounded-xl border-slate-200 dark:border-slate-700 font-semibold"
        >
          <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
          Export Ledger (.xlsx)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Operation Entry Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Record Stock Transaction</h3>
            {!canAdjustStock && (
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                View-Only Access
              </span>
            )}
          </div>

          <form onSubmit={handleExecuteOperation} className="space-y-4">
            {/* 6 Operation Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* 1. Stock In */}
              <button
                type="button"
                disabled={!canAdjustStock}
                onClick={() => {
                  setOpType('stock_in')
                  setReason('Supplier shipment received')
                }}
                className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                  opType === 'stock_in'
                    ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <PackagePlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Receive In (+)</span>
              </button>

              {/* 2. Stock Out / Dispatched Parcels */}
              <button
                type="button"
                disabled={!canAdjustStock}
                onClick={() => {
                  setOpType('stock_out')
                  setReason('Customer parcel dispatch')
                }}
                className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                  opType === 'stock_out'
                    ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Parcel Out (-)</span>
              </button>

              {/* 3. Damage */}
              <button
                type="button"
                disabled={!canAdjustStock}
                onClick={() => {
                  setOpType('damage')
                  setReason('Damaged in storage / transit')
                }}
                className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                  opType === 'damage'
                    ? 'border-rose-600 bg-rose-50/80 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <span>Damage (-)</span>
              </button>

              {/* 4. Return */}
              <button
                type="button"
                disabled={!canAdjustStock}
                onClick={() => {
                  setOpType('return')
                  setReason('Customer return received')
                }}
                className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                  opType === 'return'
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <RotateCcw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Return (+)</span>
              </button>

              {/* 5. Transfer */}
              <button
                type="button"
                disabled={!canAdjustStock}
                onClick={() => {
                  setOpType('transfer')
                  setReason('Warehouse location transfer')
                }}
                className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                  opType === 'transfer'
                    ? 'border-purple-600 bg-purple-50/80 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Transfer (Loc)</span>
              </button>

              {/* 6. Adjustment */}
              <button
                type="button"
                disabled={!canAdjustStock}
                onClick={() => {
                  setOpType('adjustment')
                  setReason('Audit count adjustment')
                }}
                className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                  opType === 'adjustment'
                    ? 'border-amber-600 bg-amber-50/80 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <RefreshCw className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>Adjust (+/-)</span>
              </button>
            </div>

            {/* Select Product */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Product & Location
              </label>
              <select
                disabled={!canAdjustStock}
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full h-10 text-xs px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium text-slate-800 dark:text-slate-200 shadow-xs"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.name} [{p.location || 'Store'}] ({p.quantity} Units)
                  </option>
                ))}
              </select>
            </div>

            {/* Conditional: Order # for Stock Out / Dispatches */}
            {opType === 'stock_out' && (
              <div className="space-y-1.5 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                <label className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-indigo-600" />
                  Order # / Parcel Reference *
                </label>
                <Input
                  required
                  value={orderReference}
                  onChange={(e) => setOrderReference(e.target.value)}
                  placeholder="e.g. SNP-ORD-98421 or Courier Waybill #"
                  className="h-10 text-xs font-mono font-bold rounded-xl bg-white dark:bg-slate-900"
                />
              </div>
            )}

            {/* Conditional: Transfer Locations */}
            {opType === 'transfer' && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-purple-900 dark:text-purple-200">From Location</label>
                  <select
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    className="w-full h-9 text-xs px-2.5 rounded-lg border border-purple-200 dark:border-purple-700 bg-white dark:bg-slate-900"
                  >
                    {WAREHOUSE_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-purple-900 dark:text-purple-200">To Location</label>
                  <select
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    className="w-full h-9 text-xs px-2.5 rounded-lg border border-purple-200 dark:border-purple-700 bg-white dark:bg-slate-900"
                  >
                    {WAREHOUSE_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Conditional: Adjustment Direction */}
            {opType === 'adjustment' && (
              <div className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Adjustment Direction:</span>
                <button
                  type="button"
                  onClick={() => setAdjustDirection('increase')}
                  className={`px-3 py-1 text-xs rounded-lg font-bold ${
                    adjustDirection === 'increase'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Increase Stock (+)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustDirection('decrease')}
                  className={`px-3 py-1 text-xs rounded-lg font-bold ${
                    adjustDirection === 'decrease'
                      ? 'bg-rose-600 text-white'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Decrease Stock (-)
                </button>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quantity (Units) *</label>
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

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Reason / Operation Note *</label>
              <Input
                disabled={!canAdjustStock}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Received from shipment / Dispatched"
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={!canAdjustStock}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-11 rounded-2xl shadow-xs text-xs"
            >
              {canAdjustStock ? 'Save & Record Movement' : 'View Only Mode'}
            </Button>
          </form>
        </div>

        {/* Right: Live Projection Card */}
        <div className="lg:col-span-5 space-y-4">
          {selectedProduct && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Product Ledger Preview
                  </span>
                  <span className="font-mono font-black text-xs text-indigo-600 dark:text-indigo-400 mt-1 block">
                    {selectedProduct.sku}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5 line-clamp-2">
                    {selectedProduct.name}
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                  {selectedProduct.location || 'Store'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Current Stock</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedProduct.quantity.toLocaleString()} Units
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Movement Delta</span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {opType === 'stock_in' || opType === 'return' || (opType === 'adjustment' && adjustDirection === 'increase')
                      ? `+${qty}`
                      : opType === 'transfer'
                      ? '±0'
                      : `-${qty}`}{' '}
                    Units
                  </span>
                </div>
              </div>

              <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 block uppercase tracking-wider">
                  Projected New Balance
                </span>
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1 block">
                  {calculateProjectedStock().toLocaleString()} Units
                </span>
              </div>

              {opType === 'damage' && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-700 dark:text-rose-300">
                  💡 <strong>Damage Note:</strong> This will also automatically increment the product's Damaged Goods counter and add to the Damage Report.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Movement Ledger Table with Reversal Action */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              Stock Movement History & Reversals
            </h3>
            <p className="text-[11px] text-slate-400">
              Complete transaction log with 1-click automatic stock reversal on deletion
            </p>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search SKU, Order #, note..."
              className="pl-8 h-8 text-xs w-60 rounded-xl"
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
                <th className="py-3 px-4">Order / Reference</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Logged By</th>
                <th className="py-3 px-4 text-right">Reversal Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 text-xs">
                    No transactions match your search.
                  </td>
                </tr>
              ) : (
                filteredTx.slice(0, 20).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">{tx.date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      {tx.sku}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">
                      {tx.productName}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.type === 'stock_in' || tx.type === 'return'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : tx.type === 'damage'
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : tx.type === 'stock_out'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            : tx.type === 'transfer'
                            ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {tx.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-xs whitespace-nowrap">
                      {tx.type === 'stock_in' || tx.type === 'return' ? `+${tx.quantity}` : `-${tx.quantity}`}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {tx.orderReference || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {tx.type === 'transfer' ? `${tx.fromLocation} → ${tx.toLocation}` : (tx.fromLocation || 'Store')}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 truncate max-w-[180px]">{tx.reason}</td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{tx.userName}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {canAdjustStock && (
                        <button
                          onClick={() => handleDeleteWithReversal(tx.id, tx.sku, tx.quantity, tx.type)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors inline-flex items-center gap-1"
                          title="Delete & Reverse Stock"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">Reverse</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
