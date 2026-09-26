'use client'

import React, { useState, useEffect } from 'react'
import { useInventory } from '@/context/inventory-context'
import { Product } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Package } from 'lucide-react'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product?: Product | null
}

const CATEGORIES = [
  'Soft Play Equipment',
  'Ball Pits & Playsets',
  'Play Mats & Rugs',
  'Wooden & Montessori Toys',
  'Plush & Sensory Toys',
  'Ride-On & Active Play',
  'Educational & Puzzles',
  'Baby Care & Nursery',
]

const WAREHOUSES = ['Main Hub - Karachi', 'Lahore Depot', 'Islamabad Center']

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const { addProduct, updateProduct, canEditInventory } = useInventory()

  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [brand, setBrand] = useState('Snug N Play Original')
  const [supplier, setSupplier] = useState('PlaySafe Foam Ltd')
  const [warehouse, setWarehouse] = useState(WAREHOUSES[0])
  const [quantity, setQuantity] = useState(10)
  const [minStock, setMinStock] = useState(10)
  const [maxStock, setMaxStock] = useState(100)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (product) {
      setSku(product.sku)
      setName(product.name)
      setCategory(product.category)
      setBrand(product.brand)
      setSupplier(product.supplier)
      setWarehouse(product.warehouse)
      setQuantity(product.quantity)
      setMinStock(product.minStock)
      setMaxStock(product.maxStock)
      setNotes(product.notes || '')
    } else {
      setSku(`SNP-${Math.floor(1000 + Math.random() * 9000)}`)
      setName('')
      setCategory(CATEGORIES[0])
      setBrand('Snug N Play Original')
      setSupplier('PlaySafe Foam Ltd')
      setWarehouse(WAREHOUSES[0])
      setQuantity(20)
      setMinStock(10)
      setMaxStock(100)
      setNotes('')
    }
  }, [product, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sku || !name || !canEditInventory) return

    if (product) {
      updateProduct(product.id, {
        sku,
        name,
        category,
        brand,
        supplier,
        warehouse,
        quantity,
        minStock,
        maxStock,
        notes,
      })
    } else {
      addProduct({
        sku,
        name,
        category,
        brand,
        supplier,
        warehouse,
        quantity,
        minStock,
        maxStock,
        isActive: true,
        notes,
      })
    }

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-card text-card-foreground border-border max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Package className="w-5 h-5 text-indigo-600" />
            {product ? 'Edit Product Item' : 'Add New Inventory SKU'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Manage physical inventory SKU details, safety stock thresholds, and warehouse location.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">SKU / Item Code *</Label>
              <Input
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="SNP-SP-001"
                className="h-9 text-xs font-mono rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 text-xs px-2.5 rounded-xl border border-input bg-background text-foreground font-medium"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Product Title / Name *</Label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pastel Modular Soft Play Climb & Crawl Set"
              className="h-9 text-xs rounded-xl"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Brand</Label>
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} className="h-9 text-xs rounded-xl" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Supplier</Label>
              <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} className="h-9 text-xs rounded-xl" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Warehouse</Label>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full h-9 text-xs px-2 rounded-xl border border-input bg-background text-foreground font-medium"
              >
                {WAREHOUSES.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock Quantities Only (No Price) */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-muted/40 rounded-2xl border">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-900 dark:text-white">Quantity on Hand</Label>
              <Input
                type="number"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="h-9 text-xs font-bold rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Min Stock Alert</Label>
              <Input
                type="number"
                min="0"
                required
                value={minStock}
                onChange={(e) => setMinStock(parseInt(e.target.value) || 0)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Max Stock Cap</Label>
              <Input
                type="number"
                min="0"
                value={maxStock}
                onChange={(e) => setMaxStock(parseInt(e.target.value) || 0)}
                className="h-9 text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Notes & Storage Location Specs</Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Aisle/Rack number, packaging dimensions, or supplier lot details..."
              className="text-xs rounded-xl"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs h-9 rounded-xl">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 font-bold rounded-xl">
              {product ? 'Save Changes' : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
