'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { Product, ProductStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Package,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  Edit2,
  Trash2,
  ArrowUpDown,
  PlusCircle,
  MinusCircle,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
} from 'lucide-react'
import { exportProductsToExcel, downloadSampleTemplate } from '@/lib/excel-helper'
import { ExcelImportModal } from './excel-import-modal'
import { ProductModal } from './product-modal'
import { StockAdjustModal } from './stock-adjust-modal'

export function InventoryTableView() {
  const { products, deleteProduct, settings, currentUser, hasPermission } = useInventory()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedWarehouse, setSelectedWarehouse] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')

  // Modals state
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null)

  // Unique categories & warehouses
  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))]
  const warehouses = ['ALL', ...Array.from(new Set(products.map((p) => p.warehouse)))]

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplier.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory
    const matchesWarehouse = selectedWarehouse === 'ALL' || p.warehouse === selectedWarehouse
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus

    return matchesSearch && matchesCategory && matchesWarehouse && matchesStatus
  })

  const statusBadge = (status: ProductStatus) => {
    switch (status) {
      case 'in_stock':
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> In Stock
          </Badge>
        )
      case 'low_stock':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Low Stock
          </Badge>
        )
      case 'out_of_stock':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 text-[10px] gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Out of Stock
          </Badge>
        )
      case 'overstock':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px] gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Overstock
          </Badge>
        )
    }
  }

  const canEdit = currentUser?.role === 'system_admin' || currentUser?.role === 'operations' || currentUser?.role === 'manager'
  const canDelete = currentUser?.role === 'system_admin'
  const canViewCost = currentUser?.role === 'system_admin' || currentUser?.role === 'accounts' || currentUser?.role === 'manager'

  return (
    <div className="space-y-4 pb-12">
      {/* Header & Excel Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-500" />
            Inventory Master Catalog
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage product items, import/export Excel files, and track warehouse stock levels.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Download sample template */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => downloadSampleTemplate()}
            className="text-xs h-8 gap-1.5 text-muted-foreground hover:text-foreground"
            title="Download blank sample Excel template for bulk import"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Template
          </Button>

          {/* Export to Excel */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportProductsToExcel(filteredProducts)}
            className="text-xs h-8 gap-1.5 border-border hover:bg-muted"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            Export ({filteredProducts.length})
          </Button>

          {/* Import from Excel */}
          {(currentUser?.role === 'system_admin' || currentUser?.role === 'operations') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsImportOpen(true)}
              className="text-xs h-8 gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            >
              <Upload className="w-3.5 h-3.5" />
              Import Excel
            </Button>
          )}

          {/* Add Product */}
          {canEdit && (
            <Button
              size="sm"
              onClick={() => {
                setEditingProduct(null)
                setIsProductModalOpen(true)
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 gap-1.5 shadow-sm shadow-indigo-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Search */}
        <div className="lg:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by SKU, Product title, Brand, Supplier..."
            className="pl-9 h-9 text-xs bg-card"
          />
        </div>

        {/* Category Filter */}
        <div className="lg:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-9 text-xs px-3 rounded-md border border-input bg-card text-foreground"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Warehouse Filter */}
        <div className="lg:col-span-2">
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="w-full h-9 text-xs px-3 rounded-md border border-input bg-card text-foreground"
          >
            {warehouses.map((wh) => (
              <option key={wh} value={wh}>
                Hub: {wh}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="lg:col-span-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full h-9 text-xs px-3 rounded-md border border-input bg-card text-foreground"
          >
            <option value="ALL">Status: All</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="overstock">Overstock</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/70 border-b text-muted-foreground font-semibold">
              <tr>
                <th className="p-3">SKU</th>
                <th className="p-3">Product Name & Category</th>
                <th className="p-3">Warehouse Hub</th>
                <th className="p-3 text-center">Stock Level</th>
                <th className="p-3 text-center">Status</th>
                {canViewCost && <th className="p-3 text-right">Unit Cost</th>}
                <th className="p-3 text-right">Retail Price</th>
                {canViewCost && <th className="p-3 text-right">Total Valuation</th>}
                <th className="p-3 text-center">Quick Adjust</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-muted-foreground text-xs">
                    No matching inventory items found for current filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                    {/* SKU */}
                    <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      {p.sku}
                    </td>

                    {/* Product Name & Details */}
                    <td className="p-3 max-w-[240px]">
                      <div className="font-semibold text-foreground truncate" title={p.name}>
                        {p.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span>{p.category}</span>
                        <span>•</span>
                        <span>{p.brand}</span>
                      </div>
                    </td>

                    {/* Warehouse */}
                    <td className="p-3 text-muted-foreground whitespace-nowrap">{p.warehouse}</td>

                    {/* Quantity & Threshold */}
                    <td className="p-3 text-center">
                      <span className="font-bold text-sm text-foreground">{p.quantity}</span>
                      <span className="text-[10px] text-muted-foreground block">
                        Min: {p.minStock} | Max: {p.maxStock}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3 text-center whitespace-nowrap">{statusBadge(p.status)}</td>

                    {/* Unit Cost */}
                    {canViewCost && (
                      <td className="p-3 text-right font-mono text-muted-foreground whitespace-nowrap">
                        {settings.currencySymbol} {p.unitCost.toLocaleString()}
                      </td>
                    )}

                    {/* Selling Price */}
                    <td className="p-3 text-right font-mono font-medium text-foreground whitespace-nowrap">
                      {settings.currencySymbol} {p.sellingPrice.toLocaleString()}
                    </td>

                    {/* Total Value */}
                    {canViewCost && (
                      <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {settings.currencySymbol} {(p.quantity * p.unitCost).toLocaleString()}
                      </td>
                    )}

                    {/* Quick In-Table Adjust */}
                    <td className="p-3 text-center whitespace-nowrap">
                      {canEdit ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAdjustingProduct(p)
                            setIsAdjustModalOpen(true)
                          }}
                          className="h-7 text-[11px] px-2 gap-1 border-border hover:border-indigo-500"
                        >
                          <ArrowUpDown className="w-3 h-3 text-indigo-500" />
                          Adjust
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">Read-only</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingProduct(p)
                              setIsProductModalOpen(true)
                            }}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                        )}

                        {canDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete SKU "${p.sku}" (${p.name})?`)) {
                                deleteProduct(p.id)
                              }
                            }}
                            className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                            title="Delete SKU"
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
        <div className="p-3 border-t bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
          </span>
          <span>
            Valuation of Filtered Stock:{' '}
            <strong className="text-foreground">
              {settings.currencySymbol}{' '}
              {filteredProducts.reduce((sum, p) => sum + p.quantity * p.unitCost, 0).toLocaleString()}
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
