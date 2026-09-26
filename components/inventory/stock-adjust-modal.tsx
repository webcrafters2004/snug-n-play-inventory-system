'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { Product, TransactionType } from '@/lib/types'
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
import { ArrowLeftRight, PackagePlus, PackageMinus, AlertOctagon, RotateCcw } from 'lucide-react'

interface StockAdjustModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

export function StockAdjustModal({ isOpen, onClose, product }: StockAdjustModalProps) {
  const { adjustStock } = useInventory()
  const [type, setType] = useState<TransactionType>('stock_in')
  const [qty, setQty] = useState(5)
  const [reason, setReason] = useState('Stock replenishment')
  const [reference, setReference] = useState('')

  if (!product) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (qty <= 0) return
    adjustStock(product.id, type, qty, reason, reference || undefined)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <ArrowLeftRight className="w-5 h-5 text-indigo-500" />
            Quick Stock Movement / Adjust
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Adjust stock for <strong className="text-foreground">{product.name}</strong> ({product.sku}). Current Qty:{' '}
            <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{product.quantity}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Operation Type Grid */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Adjustment Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('stock_in')
                  setReason('Received purchase shipment')
                }}
                className={`p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                  type === 'stock_in'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <PackagePlus className="w-4 h-4 text-emerald-500" />
                Stock In (+)
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('stock_out')
                  setReason('Dispatched sales order')
                }}
                className={`p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                  type === 'stock_out'
                    ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 font-bold'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <PackageMinus className="w-4 h-4 text-purple-500" />
                Stock Out (-)
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('damage')
                  setReason('Damaged in warehouse/transit')
                }}
                className={`p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                  type === 'damage'
                    ? 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400 font-bold'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <AlertOctagon className="w-4 h-4 text-red-500" />
                Damaged Item (-)
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('return')
                  setReason('Customer returned item in good condition')
                }}
                className={`p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                  type === 'return'
                    ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <RotateCcw className="w-4 h-4 text-blue-500" />
                Customer Return (+)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Quantity to Move</Label>
              <Input
                type="number"
                min="1"
                required
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                className="h-8 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">PO / Order Ref (Optional)</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. PO-8921"
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Reason / Audit Note</Label>
            <Input
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide reason for stock change"
              className="h-8 text-xs"
            />
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border text-xs flex justify-between items-center">
            <span className="text-muted-foreground">Resulting Stock:</span>
            <span className="font-bold text-base text-foreground font-mono">
              {type === 'stock_in' || type === 'return'
                ? product.quantity + qty
                : Math.max(0, product.quantity - qty)}{' '}
              Units
            </span>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs h-8">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8">
              Apply Stock Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
