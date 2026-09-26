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
  Eye,
} from 'lucide-react'
import { exportProductsToExcel, downloadSampleTemplate } from '@/lib/excel-helper'
import { ExcelImportModal } from './excel-import-modal'
import { ProductModal } from './product-modal'

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

  // Modals
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus

    return matchesSearch && matchesStatus
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadSampleTemplate()}
            className="text-xs h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Download Sample Excel File"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Sample Template
          </Button>

          {canExportExcel && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportProductsToExcel(filteredProducts)}
              className="text-xs h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Export ({filteredProducts.length})
            </Button>
          )}

          {canImportExcel && (
            <Button
              size="sm"
              onClick={() => setIsImportOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 px-3.5 rounded-xl font-medium shadow-xs"
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
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 px-3.5 rounded-xl font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by SKU or Product Name..."
            className="pl-10 h-10 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full h-10 text-xs px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">Status: All Items</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="overstock">Overstock</option>
          </select>
        </div>
      </div>

      {/* Strictly 4 Columns Table: SKU | Product Name | Status | Action */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-5 w-48">SKU</th>
                <th className="py-3.5 px-5">Product Name</th>
                <th className="py-3.5 px-5 text-center w-36">Status</th>
                <th className="py-3.5 px-5 text-right w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 text-xs">
                    No products found matching your search filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* 1. SKU */}
                    <td className="py-3.5 px-5 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap text-xs">
                      {p.sku}
                    </td>

                    {/* 2. Product Name */}
                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-slate-900 dark:text-white block text-xs" title={p.name}>
                        {p.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                        {p.quantity.toLocaleString()} Units on hand
                      </span>
                    </td>

                    {/* 3. Status */}
                    <td className="py-3.5 px-5 text-center whitespace-nowrap">
                      {statusBadge(p.status)}
                    </td>

                    {/* 4. Action */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {canAddEditProducts && (
                          <button
                            onClick={() => {
                              setEditingProduct(p)
                              setIsProductModalOpen(true)
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {canDeleteProducts && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove SKU ${p.sku}?`)) {
                                deleteProduct(p.id)
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {!canAddEditProducts && !canDeleteProducts && (
                          <span className="text-[11px] text-slate-400 font-medium">View Only</span>
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
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium gap-2">
          <span>
            Showing <strong>{filteredProducts.length}</strong> Products
          </span>
          <span>
            Total Physical Units:{' '}
            <strong className="text-slate-900 dark:text-white font-bold text-xs">
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
    </div>
  )
}

