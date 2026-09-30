'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { Product, ProductStatus, WAREHOUSE_LOCATIONS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Package,
  Search,
  Plus,
  Download,
  Upload,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  X,
} from 'lucide-react'
import { exportProductsToExcel } from '@/lib/excel-helper'
import { isDateInRange } from '@/lib/date-filter'
import { ExcelImportModal } from './excel-import-modal'
import { ProductModal } from './product-modal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function InventoryTableView() {
  const {
    products,
    deleteProduct,
    canAddEditProducts,
    canDeleteProducts,
    canImportExcel,
    canExportExcel,
  } = useInventory()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Modals
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string; sku: string } | null>(null)

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus
    const matchesLocation =
      selectedLocation === 'ALL' || (p.location || p.warehouse || 'Store') === selectedLocation

    const matchesDate = isDateInRange(p.updatedAt, fromDate, toDate)

    return matchesSearch && matchesStatus && matchesLocation && matchesDate
  })

  const totalUnits = filteredProducts.reduce((sum, p) => sum + p.quantity, 0)

  const statusBadge = (status: ProductStatus) => {
    switch (status) {
      case 'in_stock':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            In Stock
          </span>
        )
      case 'low_stock':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Low Stock
          </span>
        )
      case 'out_of_stock':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            Out of Stock
          </span>
        )
      case 'overstock':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Overstock
          </span>
        )
    }
  }

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header Bar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Products & Inventory
            </h2>
            {!canAddEditProducts && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                <Eye className="w-3 h-3" /> View Only
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Master list of physical products and stock quantities on hand.
          </p>
        </div>

        {/* Action Buttons: Only Import, Export, and Add Product */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {canExportExcel && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportProductsToExcel(filteredProducts)}
              className="text-xs h-9 px-3.5 rounded-xl border-slate-200 dark:border-slate-700 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
              Export ({filteredProducts.length})
            </Button>
          )}

          {canImportExcel && (
            <Button
              size="sm"
              onClick={() => setIsImportOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 px-4 rounded-xl font-semibold shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Import Excel
            </Button>
          )}

          {canAddEditProducts && (
            <Button
              size="sm"
              onClick={() => {
                setEditingProduct(null)
                setIsProductModalOpen(true)
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 px-4 rounded-xl font-bold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Compact Search & Comprehensive Date Filter Toolbar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Compact Search Bar */}
          <div className="relative w-full sm:w-60 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search SKU or name..."
              className="pl-9 h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* Location Select */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="h-9 text-xs px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Locations</option>
            {WAREHOUSE_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 text-xs px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="overstock">Overstock</option>
          </select>
        </div>

        {/* Date System Filter (From & To) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Date:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-8 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">To</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-8 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {(fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate('')
                setToDate('')
              }}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg font-medium transition-colors"
              title="Clear date filter"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Products & Stock Table: Photo | SKU | Product Name | Location | Units on Hand | Status | Action */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-4 text-center w-16">Photo</th>
                <th className="py-3.5 px-4 w-40">SKU</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4 w-36">Location</th>
                <th className="py-3.5 px-4 w-32 font-mono">Stock Units</th>
                <th className="py-3.5 px-4 text-center w-32">Status</th>
                <th className="py-3.5 px-4 text-right w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 text-xs">
                    No products found matching your search or date filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* 1. Photo */}
                    <td className="py-2.5 px-4 text-center">
                      {p.imageUrl ? (
                        <button
                          type="button"
                          onClick={() => setPreviewImage({ url: p.imageUrl!, name: p.name, sku: p.sku })}
                          className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:opacity-80 transition-opacity inline-flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                          title="Click to view full image"
                        >
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </button>
                      ) : (
                        <div className="w-10 h-10 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 inline-flex items-center justify-center text-slate-400 text-[10px] font-bold">
                          No Pic
                        </div>
                      )}
                    </td>

                    {/* 2. SKU */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white text-xs">
                      {p.sku}
                    </td>

                    {/* 3. Product Name */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      <div>
                        <span>{p.name}</span>
                        {p.notes && (
                          <span className="block text-[11px] text-slate-400 font-normal truncate max-w-xs mt-0.5">
                            {p.notes}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 4. Location */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                        {p.location || p.warehouse || 'Store'}
                      </span>
                    </td>

                    {/* 5. Units on Hand */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {p.quantity.toLocaleString()}
                      </span>
                      {p.totalDamaged ? (
                        <span className="text-[10px] text-rose-500 font-bold ml-1.5">
                          ({p.totalDamaged} dmg)
                        </span>
                      ) : null}
                    </td>

                    {/* 6. Status */}
                    <td className="py-3.5 px-4 text-center">
                      {statusBadge(p.status)}
                    </td>

                    {/* 7. Action */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canAddEditProducts && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingProduct(p)
                              setIsProductModalOpen(true)
                            }}
                            className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {canDeleteProducts && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${p.sku} (${p.name})?`)) {
                                deleteProduct(p.id)
                              }
                            }}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Showing {filteredProducts.length} of {products.length} Products</span>
          <span>Total Units on Hand: <strong className="text-slate-900 dark:text-white font-mono">{totalUnits.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* Excel Import Modal */}
      <ExcelImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false)
          setEditingProduct(null)
        }}
        product={editingProduct}
      />

      {/* Product Image Lightbox Modal */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900 dark:text-white">
              {previewImage?.name}
            </DialogTitle>
            <DialogDescription className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              SKU: {previewImage?.sku}
            </DialogDescription>
          </DialogHeader>

          {previewImage && (
            <div className="mt-2 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-square bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewImage(null)}
              className="w-full text-xs h-9 rounded-xl font-semibold"
            >
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
