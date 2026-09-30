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
import {
  Package,
  Building2,
  Camera,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Hash,
  Boxes,
} from 'lucide-react'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product?: Product | null
}

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const { addProduct, updateProduct, canAddEditProducts } = useInventory()

  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
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
        category: 'General',
        brand: '',
        supplier: '',
        location,
        warehouse: location,
        quantity,
        minStock,
        maxStock: 100,
        totalDamaged,
        imageUrl: imageUrl.trim() || undefined,
        itemStatus,
        notes,
        updatedAt: new Date().toISOString().split('T')[0],
      })
    } else {
      addProduct({
        sku,
        name,
        category: 'General',
        brand: '',
        supplier: '',
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
      <DialogContent className="w-full max-w-2xl sm:max-w-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="flex items-center gap-2.5 text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            <span className="p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Package className="w-5 h-5" />
            </span>
            {product ? 'Edit Product Item' : 'Add New Inventory SKU'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Aasan tareeqay se SKU, product name, warehouse location aur stock add karein.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* STEP 1: SKU Code (Full Width, Clear & Prominent) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                1. SKU / Item Code * (Item Identifier)
              </Label>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Example: SNP-2242
              </span>
            </div>
            <Input
              required
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              placeholder="e.g. SNP-2242"
              className="h-11 text-sm font-mono font-bold tracking-wider rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 uppercase"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Har item ka unique code jo barcode ya packaging par hota hai.
            </p>
          </div>

          {/* STEP 2: Product Name (Full Width, Spacious) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              2. Product Name / Title *
            </Label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Double-Sided Foldable Waterproof Baby Play Mat"
              className="h-11 text-sm rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-medium"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Item ka saaf aur wazeh naam jo staff asani se pehchan sake.
            </p>
          </div>

          {/* STEP 3: Warehouse Location & Status (Spacious 2 Columns) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
              3. Location & Availability
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  Warehouse Location *
                </Label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-11 text-xs sm:text-sm px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                >
                  {WAREHOUSE_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Item Status
                </Label>
                <select
                  value={itemStatus}
                  onChange={(e) => setItemStatus(e.target.value as any)}
                  className="w-full h-11 text-xs sm:text-sm px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="Active">Active (In Rotation)</option>
                  <option value="Hold">Hold (Under Inspection)</option>
                  <option value="Inactive">Inactive (Discontinued)</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 4: Stock Quantities (Spacious, Khulla-Khulla 3 Clean Boxes) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                4. Stock Quantities & Limits
              </Label>
              <span className="text-[11px] text-slate-400">Total units on hand</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Physical Stock */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-2xs">
                <Label className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
                  Physical Stock *
                </Label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="h-10 text-base font-bold rounded-lg bg-slate-50/50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300"
                />
                <span className="text-[10px] text-slate-400 block">
                  Available good units
                </span>
              </div>

              {/* Min Alert Stock */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-2xs">
                <Label className="text-xs font-bold text-amber-700 dark:text-amber-400 block">
                  Min Alert Stock
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={minStock}
                  onChange={(e) => setMinStock(parseInt(e.target.value) || 0)}
                  className="h-10 text-base font-bold rounded-lg bg-slate-50/50 dark:bg-slate-800 text-amber-700 dark:text-amber-300"
                />
                <span className="text-[10px] text-slate-400 block">
                  Low stock warning limit
                </span>
              </div>

              {/* Damaged Units */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 space-y-1.5 shadow-2xs">
                <Label className="text-xs font-bold text-rose-700 dark:text-rose-400 block">
                  Damaged Units
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={totalDamaged}
                  onChange={(e) => setTotalDamaged(parseInt(e.target.value) || 0)}
                  className="h-10 text-base font-bold rounded-lg bg-rose-50/40 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200"
                />
                <span className="text-[10px] text-rose-500 dark:text-rose-400 block">
                  Kharab ya defective maal
                </span>
              </div>
            </div>
          </div>

          {/* STEP 5: Product Photo (Photo Upload ya Camera) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                5. Product Picture (Photo Upload ya Camera)
              </Label>
              {imageUrl && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Photo Attached
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
              <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800">
                  <img src={imageUrl} alt="Product Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block truncate">
                    Product Photo Attached
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Click below to change or retake photo with camera
                  </span>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" /> Change Photo
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" /> Retake Photo
                    </button>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setImageUrl('')}
                  className="h-9 w-9 p-0 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl shrink-0"
                  title="Delete Picture"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-12 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-slate-300 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-400 text-slate-700 dark:text-slate-200"
                >
                  <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Upload Photo from Device
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  className="h-12 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-slate-300 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-400 text-slate-700 dark:text-slate-200"
                >
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Take Live Picture (Camera)
                </Button>
              </div>
            )}
          </div>

          {/* STEP 6: Notes & Description */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              6. Notes & Details (Optional)
            </Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Packaging details, material specifications, box instructions..."
              className="text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
            />
          </div>

          <DialogFooter className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto h-11 px-6 text-xs sm:text-sm rounded-xl border-slate-300 dark:border-slate-700 font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto h-11 px-8 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20"
            >
              {product ? 'Save Changes' : 'Create Product SKU'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
