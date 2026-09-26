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
  Filter,
} from 'lucide-react'
import { exportProductsToExcel, downloadSampleTemplate } from '@/lib/excel-helper'
import { ExcelImportModal } from './excel-import-modal'
import { ProductModal } from './product-modal'
import { StockAdjustModal } from './stock-adjust-modal'

export function InventoryTableView() {
  const { products, deleteProduct, settings, currentUser } = useInventory()

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
      p.brand.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const statusPill = (status: ProductStatus) => {
    switch (status) {
      case 'in_stock':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">IN STOCK</span>
      case 'low_stock':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">LOW STOCK</span>
      case 'out_of_stock':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">0 STOCK</span>
      case 'overstock':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">OVERSTOCK</span>
    }
  }

  const canEdit = currentUser?.role === 'system_admin' || currentUser?.role === 'operations' || currentUser?.role === 'manager'
  const canDelete = currentUser?.role === 'system_admin'
  const canViewCost = currentUser?.role === 'system_admin' || currentUser?.role === 'accounts' || currentUser?.role === 'manager'

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            Product Catalog & Excel Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your items, import from Excel files, and update stock quantities.
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

          {(currentUser?.role === 'system_admin' || currentUser?.role === 'operations') && (
            <Button
              size="sm"
              onClick={() => setIsImportOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 px-3.5 rounded-xl font-bold shadow-md shadow-emerald-600/20"
            >
              <Upload className="w-4 h-4 mr-1" />
              Import Excel (.xlsx)
            </Button>
          )}

          {canEdit && (
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
            placeholder="Search by SKU, Product Name, Brand..."
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
            <option value="ALL">Status: All Items</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">0 Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Spacious Clean Product Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">SKU</th>
                <th className="p-4">Product Name & Category</th>
                <th className="p-4">Warehouse</th>
                <th className="p-4 text-center">Stock Quantity</th>
                <th className="p-4 text-center">Status</th>
                {canViewCost && <th className="p-4 text-right">Cost Price</th>}
                <th className="p-4 text-right">Selling Price</th>
                {canViewCost && <th className="p-4 text-right">Total Value</th>}
                <th className="p-4 text-center">Adjust Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-400 text-xs font-semibold">
                    No products found matching your search. Click <strong>"Add Product"</strong> or <strong>"Import Excel"</strong> to get started.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* SKU */}
                    <td className="p-4 font-mono font-black text-indigo-600 dark:text-indigo-400 whitespace-nowrap text-xs">
                      {p.sku}
                    </td>

                    {/* Product Name */}
                    <td className="p-4 max-w-[240px]">
                      <span className="font-bold text-slate-900 dark:text-white block truncate" title={p.name}>
                        {p.name}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {p.category} • {p.brand}
                      </span>
                    </td>

                    {/* Warehouse */}
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                      {p.warehouse}
                    </td>

                    {/* Quantity */}
                    <td className="p-4 text-center">
                      <span className="font-black text-base text-slate-900 dark:text-white block">
                        {p.quantity}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Min: {p.minStock}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4 text-center whitespace-nowrap">{statusPill(p.status)}</td>

                    {/* Cost */}
                    {canViewCost && (
                      <td className="p-4 text-right font-mono text-slate-500 whitespace-nowrap font-semibold">
                        Rs. {p.unitCost.toLocaleString()}
                      </td>
                    )}

                    {/* Price */}
                    <td className="p-4 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      Rs. {p.sellingPrice.toLocaleString()}
                    </td>

                    {/* Total Value */}
                    {canViewCost && (
                      <td className="p-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        Rs. {(p.quantity * p.unitCost).toLocaleString()}
                      </td>
                    )}

                    {/* Quick Adjust */}
                    <td className="p-4 text-center whitespace-nowrap">
                      {canEdit ? (
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
                          Adjust
                        </Button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Read Only</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {canEdit && (
                          <button
                            onClick={() => {
                              setEditingProduct(p)
                              setIsProductModalOpen(true)
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete SKU ${p.sku}?`)) deleteProduct(p.id)
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-semibold gap-2">
          <span>
            Total: <strong>{filteredProducts.length}</strong> Products Shown
          </span>
          <span>
            Filtered Stock Valuation:{' '}
            <strong className="text-slate-900 dark:text-white font-mono">
              Rs. {filteredProducts.reduce((sum, p) => sum + p.quantity * p.unitCost, 0).toLocaleString()}
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
