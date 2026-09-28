'use client'

import React, { useState, useEffect, useRef } from 'react'
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
import { Package, Building2, ImageIcon, Camera, Upload, Trash2, CheckCircle2 } from 'lucide-react'

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

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const processImageFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 800
        const MAX_HEIGHT = 800
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82)
        setImageUrl(compressedBase64)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

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

          {/* Photo Upload & Camera Capture (URL removed) */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Product Picture (Photo Upload ya Camera)
              </Label>
              {imageUrl && (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Photo Added
                </span>
              )}
            </div>

            {/* Hidden File and Camera Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) processImageFile(file)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
            />
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) processImageFile(file)
                if (cameraInputRef.current) cameraInputRef.current.value = ''
              }}
            />

            {imageUrl ? (
              <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800">
                  <img src={imageUrl} alt="Product Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                    Product Image Attached
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Optimized for inventory display
                  </span>
                  <div className="flex items-center gap-2.5 mt-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" /> Change Photo
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Camera className="w-3 h-3" /> Retake Camera
                    </button>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setImageUrl('')}
                  className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg shrink-0"
                  title="Delete Picture"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-11 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 text-slate-700 dark:text-slate-200"
                >
                  <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Upload Photo
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  className="h-11 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 text-slate-700 dark:text-slate-200"
                >
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Take Picture
                </Button>
              </div>
            )}
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
