'use client'

import React, { useState, useRef } from 'react'
import { useInventory } from '@/context/inventory-context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  UploadCloud,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Package,
  ArrowLeftRight,
  Database,
  Calendar,
} from 'lucide-react'

interface RestoreBackupModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RestoreBackupModal({ isOpen, onClose }: RestoreBackupModalProps) {
  const { restoreBackup } = useInventory()
  const [file, setFile] = useState<File | null>(null)
  const [jsonText, setJsonText] = useState('')
  const [stats, setStats] = useState<{
    productsCount: number
    txCount: number
    backupDate?: string
    version?: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRestored, setIsRestored] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleReset = () => {
    setFile(null)
    setJsonText('')
    setStats(null)
    setError(null)
    setIsRestored(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.json')) {
      setError('Sirf .json backup file upload karein.')
      return
    }

    setFile(selectedFile)
    setError(null)
    setIsRestored(false)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        setJsonText(text)
        const parsed = JSON.parse(text)

        const productsArr = Array.isArray(parsed) ? parsed : (parsed.products || [])
        const txArr = Array.isArray(parsed?.transactions) ? parsed.transactions : []

        if (!Array.isArray(productsArr) || productsArr.length === 0) {
          setError('Iss file mai koi valid products data nahi mila.')
          setStats(null)
          return
        }

        setStats({
          productsCount: productsArr.length,
          txCount: txArr.length,
          backupDate: parsed.exportedAt || parsed.timestamp || undefined,
          version: parsed.version || '1.0',
        })
      } catch (err: any) {
        setError('Invalid JSON backup file. Error: ' + err.message)
        setStats(null)
      }
    }
    reader.readAsText(selectedFile)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) processFile(dropped)
  }

  const handleConfirmRestore = () => {
    if (!jsonText) return
    const success = restoreBackup(jsonText)
    if (success) {
      setIsRestored(true)
      setTimeout(() => {
        handleReset()
        onClose()
      }, 1500)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && (handleReset(), onClose())}>
      <DialogContent className="max-w-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="flex items-center gap-2.5 text-base sm:text-lg font-black text-slate-900 dark:text-white">
            <span className="p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <UploadCloud className="w-5 h-5" />
            </span>
            Restore Portal from JSON Backup
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Agar portal data urh gaya ho ya dobara lana ho, to apni saved JSON backup file yahan upload karein.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* File Upload Dropzone */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) processFile(f)
            }}
          />

          {!stats ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/60 dark:bg-slate-800/40 transition-colors space-y-3"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                <FileJson className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Click to select JSON Backup File
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  ya file yahan drag-and-drop karein (.json format)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* File Info Card */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white block truncate max-w-xs">
                      {file?.name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Size: {((file?.size || 0) / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs h-8 rounded-lg"
                >
                  Change File
                </Button>
              </div>

              {/* Data Summary Stats */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Products</span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">
                      {stats.productsCount} SKUs
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Stock Movements</span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">
                      {stats.txCount} Logged
                    </span>
                  </div>
                </div>
              </div>

              {stats.backupDate && (
                <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Backup Created: <strong>{new Date(stats.backupDate).toLocaleString()}</strong></span>
                </div>
              )}

              {isRestored && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Portal ka sara data kamyabi se restore hogaya hai!</span>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2 flex flex-col sm:flex-row items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto text-xs h-10 px-5 rounded-xl"
          >
            Cancel
          </Button>

          {stats && !isRestored && (
            <Button
              type="button"
              onClick={handleConfirmRestore}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-10 px-6 rounded-xl shadow-md shadow-indigo-600/20 gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Restore All Data Now ({stats.productsCount} Products)
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
