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

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const { addProduct, updateProduct, canAddEditProducts } = useInventory()

  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [brand, setBrand] = useState('Snug N Play Original')
  const [supplier, setSupplier] = useState('PlaySafe Foam Ltd')
  const [quantity, setQuantity] = useState(10)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (product) {
      setSku(product.sku)
      setName(product.name)
      setCategory(product.category)
      setBrand(product.brand)
      setSupplier(product.supplier)
      setQuantity(product.quantity)
      setNotes(product.notes || '')
    } else {
      setSku(`SNP-${Math.floor(1000 + Math.random() * 9000)}`)
      setName('')
      setCategory(CATEGORIES[0])
      setBrand('Snug N Play Original')
      setSupplier('PlaySafe Foam Ltd')
      setQuantity(20)
      setNotes('')
    }
  }, [product, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sku || !name || !canAddEditProducts) return

    if (product) {
      updateProduct(product.id, {
        sku,
        name,
        category,
        brand,
        supplier,
        warehouse: 'Main Hub',
        quantity,
        minStock: 5,
        maxStock: 100,
        notes,
      })
    } else {
      addProduct({
        sku,
        name,
        category,
        brand,
        supplier,
        warehouse: 'Main Hub',
        quantity,
        minStock: 5,
        maxStock: 100,
        isActive: true,
        notes,
      })
    }

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-card text-card-foreground border-border max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {product ? 'Edit Product Item' : 'Add New Inventory SKU'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Enter basic product information and current quantity on hand.
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Brand</Label>
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} className="h-9 text-xs rounded-xl" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Supplier</Label>
              <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} className="h-9 text-xs rounded-xl" />
            </div>
          </div>

          <div className="space-y-1 p-3 bg-muted/40 rounded-xl border">
            <Label className="text-xs font-bold text-slate-900 dark:text-white">Quantity on Hand (Units) *</Label>
            <Input
              type="number"
              min="0"
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="h-10 text-sm font-bold rounded-xl bg-background"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Notes & Description</Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Item specifications, material, packaging details..."
              className="text-xs rounded-xl"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs h-9 rounded-xl">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 font-semibold rounded-xl">
              {product ? 'Save Changes' : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
