'use client'

import React, { useState, useEffect } from 'react'
import { useInventory } from '@/context/inventory-context'
import { Product, WAREHOUSE_LOCATIONS } from '@/lib/types'
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
import { Package, Building2, ImageIcon } from 'lucide-react'

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
  const [location, setLocation] = useState<string>('Store')
  const [quantity, setQuantity] = useState(10)
  const [minStock, setMinStock] = useState(5)
  const [totalDamaged, setTotalDamaged] = useState(0)
  const [imageUrl, setImageUrl] = useState('')
  const [itemStatus, setItemStatus] = useState<'Active' | 'Inactive' | 'Hold'>('Active')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (product) {
      setSku(product.sku)
      setName(product.name)
      setCategory(product.category)
      setBrand(product.brand)
      setSupplier(product.supplier)
      setLocation(product.location || product.warehouse || 'Store')
      setQuantity(product.quantity)
      setMinStock(product.minStock || 5)
      setTotalDamaged(product.totalDamaged || 0)
      setImageUrl(product.imageUrl || '')
      setItemStatus(product.itemStatus || 'Active')
      setNotes(product.notes || '')
    } else {
      setSku(`SNP-${Math.floor(1000 + Math.random() * 9000)}`)
      setName('')
      setCategory(CATEGORIES[0])
      setBrand('Snug N Play Original')
      setSupplier('PlaySafe Foam Ltd')
      setLocation('Store')
      setQuantity(20)
      setMinStock(5)
      setTotalDamaged(0)
      setImageUrl('')
      setItemStatus('Active')
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
        location,
        warehouse: location,
        quantity,
        minStock,
        maxStock: 100,
        totalDamaged,
        imageUrl: imageUrl.trim() || undefined,
        itemStatus,
        notes,
      })
    } else {
      addProduct({
        sku,
        name,
        category,
        brand,
        supplier,
        location,
        warehouse: location,
        quantity,
        minStock,
        maxStock: 100,
        totalDamaged,
        imageUrl: imageUrl.trim() || undefined,
        itemStatus,
        isActive: itemStatus === 'Active',
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
            <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {product ? 'Edit Product Item' : 'Add New Inventory SKU'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure product catalog details, warehouse location, image, and safety thresholds.
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
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                Warehouse Location
              </Label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-9 text-xs px-2.5 rounded-xl border border-input bg-background text-foreground font-semibold"
              >
                {WAREHOUSE_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Item Status</Label>
              <select
                value={itemStatus}
                onChange={(e) => setItemStatus(e.target.value as any)}
                className="w-full h-9 text-xs px-2.5 rounded-xl border border-input bg-background text-foreground font-medium"
              >
                <option value="Active">Active</option>
                <option value="Hold">Hold / Inspection</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
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

          {/* Photo URL */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              Product Image URL (Optional)
            </Label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://snugnplay.com/cdn/shop/files/toy.jpg"
              className="h-9 text-xs rounded-xl"
            />
          </div>

          {/* Quantities & Safety Points */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-muted/40 rounded-2xl border">
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-slate-900 dark:text-white">Physical Stock *</Label>
              <Input
                type="number"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="h-9 text-xs font-bold rounded-xl bg-background"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Min Alert Stock</Label>
              <Input
                type="number"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(parseInt(e.target.value) || 0)}
                className="h-9 text-xs font-semibold rounded-xl bg-background"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Damaged Units</Label>
              <Input
                type="number"
                min="0"
                value={totalDamaged}
                onChange={(e) => setTotalDamaged(parseInt(e.target.value) || 0)}
                className="h-9 text-xs font-bold rounded-xl bg-background text-rose-600 dark:text-rose-400"
              />
            </div>
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
