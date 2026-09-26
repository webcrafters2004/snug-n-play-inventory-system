'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { Product, ProductStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Package,
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  Edit2,
  Trash2,
  ArrowUpDown,
  AlertTriangle,
  Eye,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { exportProductsToExcel, downloadSampleTemplate } from '@/lib/excel-helper'
import { ExcelImportModal } from './excel-import-modal'
import { ProductModal } from './product-modal'
import { StockAdjustModal } from './stock-adjust-modal'

export function InventoryTableView() {
  const {
    products,
    deleteProduct,
    currentUser,
    canEditInventory,
    shopifyAlerts,
    syncWithShopify,
    dismissShopifyAlert,
  } = useInventory()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')

  // Modals
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null)

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))]

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.warehouse.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const totalUnits = filteredProducts.reduce((sum, p) => sum + p.quantity, 0)

  const statusPill = (status: ProductStatus) => {
    switch (status) {
      case 'in_stock':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            IN STOCK
          </span>
        )
      case 'low_stock':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
            LOW STOCK
          </span>
        )
      case 'out_of_stock':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
            0 OUT OF STOCK
          </span>
        )
      case 'overstock':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
            OVERSTOCK
          </span>
        )
    }
  }

  return (
    <div className="space-y-5 pb-12">
      {/* Shopify Live Mismatch Alert Banner (Focused Alert Only) */}
      {shopifyAlerts.length > 0 && (
        <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-2xl flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                ⚠️ Shopify Sync Alert — Item Missing in Local Inventory
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                SKU <strong>{shopifyAlerts[0].sku}</strong> ({shopifyAlerts[0].title}) has{' '}
                <strong>{shopifyAlerts[0].shopifyQuantity} units</strong> on Shopify store, but has not been added to your local catalog.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {canEditInventory && (
              <Button
                size="sm"
                onClick={syncWithShopify}
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold h-9 px-3.5 rounded-xl shadow-xs"
              >
                Sync & Add to Catalog
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => dismissShopifyAlert(shopifyAlerts[0].id)}
              className="text-xs h-9 rounded-xl border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-indigo-600" />
              Inventory Catalog & Quantities
            </h2>
            {!canEditInventory && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                <Eye className="w-3 h-3" /> View Only
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Physical stock tracking across Karachi, Lahore & Islamabad warehouses.
          </p>
        </div>

        {/* Big Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadSampleTemplate()}
            className="text-xs h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700 font-bold"
            title="Download Sample Excel File"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1 text-slate-500" />
            Sample Template
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => exportProductsToExcel(filteredProducts)}
            className="text-xs h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700 font-bold"
          >
            <Download className="w-4 h-4 mr-1 text-emerald-600" />
            Export Excel ({filteredProducts.length})
          </Button>

          {canEditInventory && (
            <Button
              size="sm"
              onClick={() => setIsImportOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 px-3.5 rounded-xl font-bold shadow-md shadow-emerald-600/20"
            >
              <Upload className="w-4 h-4 mr-1" />
              Import Excel (.xlsx)
            </Button>
          )}

          {canEditInventory && (
            <Button
              size="sm"
              onClick={() => {
                setEditingProduct(null)
                setIsProductModalOpen(true)
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 px-3.5 rounded-xl font-bold shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by SKU, Product Name, Brand, Warehouse..."
            className="pl-10 h-10 text-xs rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-10 text-xs px-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full h-10 text-xs px-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
          >
            <option value="ALL">Status: All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock Alert</option>
            <option value="out_of_stock">0 Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Clean Pure-Quantity Inventory Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">SKU</th>
                <th className="p-4">Product Name & Category</th>
                <th className="p-4">Brand / Supplier</th>
                <th className="p-4">Warehouse Location</th>
                <th className="p-4 text-center">Units on Hand</th>
                <th className="p-4 text-center">Safety Limits</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Adjust Stock</th>
                {canEditInventory && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400 text-xs font-semibold">
                    No products found matching your search. {canEditInventory ? 'Click "Add Product" or "Import Excel" to add items.' : 'No catalog items available.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* SKU */}
                    <td className="p-4 font-mono font-black text-indigo-600 dark:text-indigo-400 whitespace-nowrap text-xs">
                      {p.sku}
                    </td>

                    {/* Product Name & Category */}
                    <td className="p-4 max-w-[260px]">
                      <span className="font-bold text-slate-900 dark:text-white block truncate" title={p.name}>
                        {p.name}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {p.category}
                      </span>
                    </td>

                    {/* Brand & Supplier */}
                    <td className="p-4 text-slate-600 dark:text-slate-300 whitespace-nowrap font-medium">
                      <span>{p.brand}</span>
                      <span className="text-[10px] text-slate-400 block">{p.supplier}</span>
                    </td>

                    {/* Warehouse */}
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">
                      {p.warehouse}
                    </td>

                    {/* Quantity on Hand */}
                    <td className="p-4 text-center">
                      <span className="font-black text-lg text-slate-900 dark:text-white block">
                        {p.quantity}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Units
                      </span>
                    </td>

                    {/* Safety Limits */}
                    <td className="p-4 text-center whitespace-nowrap">
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        Min: <strong>{p.minStock}</strong>
                      </span>
                      {p.maxStock > 0 && (
                        <span className="text-[11px] text-slate-400 block">
                          Max: {p.maxStock}
                        </span>
                      )}
                    </td>

                    {/* Status Pill */}
                    <td className="p-4 text-center whitespace-nowrap">{statusPill(p.status)}</td>

                    {/* Quick Adjust Quantity */}
                    <td className="p-4 text-center whitespace-nowrap">
                      {canEditInventory ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAdjustingProduct(p)
                            setIsAdjustModalOpen(true)
                          }}
                          className="h-8 px-3 text-xs font-bold rounded-xl border-slate-200 dark:border-slate-700 hover:border-indigo-600 gap-1.5"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" />
                          Adjust Qty
                        </Button>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-semibold">View Only</span>
                      )}
                    </td>

                    {/* Actions (Only for Inventory Editor & Admin) */}
                    {canEditInventory && (
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingProduct(p)
                              setIsProductModalOpen(true)
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                            title="Edit Product Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete SKU ${p.sku}?`)) deleteProduct(p.id)
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer (Physical Units Only) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-semibold gap-2">
          <span>
            Total: <strong>{filteredProducts.length}</strong> SKUs Shown
          </span>
          <span>
            Total Stock in View:{' '}
            <strong className="text-indigo-600 dark:text-indigo-400 font-black text-sm">
              {totalUnits.toLocaleString()} Units
            </strong>
          </span>
        </div>
      </div>

      {/* Modals */}
      <ExcelImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false)
          setEditingProduct(null)
        }}
        product={editingProduct}
      />
      <StockAdjustModal
        isOpen={isAdjustModalOpen}
        onClose={() => {
          setIsAdjustModalOpen(false)
          setAdjustingProduct(null)
        }}
        product={adjustingProduct}
      />
    </div>
  )
}
