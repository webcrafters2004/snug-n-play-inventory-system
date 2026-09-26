'use client'

import React, { useState, useRef } from 'react'
import { useInventory } from '@/context/inventory-context'
import { parseExcelFile, downloadSampleTemplate } from '@/lib/excel-helper'
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
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileCheck,
  RefreshCw,
} from 'lucide-react'

interface ExcelImportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExcelImportModal({ isOpen, onClose }: ExcelImportModalProps) {
  const { bulkImportProducts, canEditInventory } = useInventory()
  const [file, setFile] = useState<File | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parsedData, setParsedData] = useState<Partial<Product>[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    processFile(selectedFile)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (!droppedFile) return
    processFile(droppedFile)
  }

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile)
    setIsParsing(true)
    setErrors([])

    try {
      const res = await parseExcelFile(selectedFile)
      setIsParsing(false)
      setTotalRows(res.totalRows)

      if (res.success && res.data) {
        setParsedData(res.data)
        if (res.errors && res.errors.length > 0) {
          setErrors(res.errors)
        }
      } else {
        setParsedData([])
        setErrors(res.errors || ['Failed to read rows from Excel sheet.'])
      }
    } catch (err: any) {
      setIsParsing(false)
      setErrors([err.message || 'Error parsing Excel sheet.'])
    }
  }

  const handleConfirmImport = () => {
    if (parsedData.length === 0 || !canEditInventory) return
    bulkImportProducts(parsedData)
    handleReset()
    onClose()
  }

  const handleReset = () => {
    setFile(null)
    setParsedData([])
    setErrors([])
    setTotalRows(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && (handleReset(), onClose())}>
      <DialogContent className="max-w-2xl bg-card text-card-foreground border-border max-h-[90vh] flex flex-col rounded-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
              Import Inventory from Excel (.XLSX / .CSV)
            </DialogTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadSampleTemplate()}
              className="text-xs h-7 gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-xl"
            >
              <Download className="w-3.5 h-3.5" />
              Sample Excel Template
            </Button>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Upload an Excel sheet containing product SKUs and physical stock levels. Columns: SKU, Product Name, Category, Brand, Supplier, Warehouse, Quantity, Min Stock, Max Stock, Notes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
          {/* Upload Drop Zone */}
          {!file && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-indigo-500/60 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Click to browse or drag & drop Excel file here</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Supports standard .xlsx, .xls, and .csv</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isParsing && (
            <div className="p-8 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground">Analyzing sheet structure and validating SKU rows...</p>
            </div>
          )}

          {/* Parsed Summary & Preview */}
          {file && !isParsing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-border">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-xs font-bold text-foreground">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB • {parsedData.length} valid products detected (out of {totalRows} rows)
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={handleReset} className="text-xs h-7 text-destructive rounded-xl">
                  Change File
                </Button>
              </div>

              {/* Error Callout if any */}
              {errors.length > 0 && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Validation Notices ({errors.length}):
                  </div>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5 max-h-24 overflow-y-auto pl-1">
                    {errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Data Preview Table (Pure Quantities) */}
              {parsedData.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-foreground">Import Preview (First 5 Items):</span>
                  <div className="border rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-muted/80 sticky top-0 border-b">
                        <tr>
                          <th className="p-2 font-semibold">SKU</th>
                          <th className="p-2 font-semibold">Product Name</th>
                          <th className="p-2 font-semibold">Category</th>
                          <th className="p-2 font-semibold">Warehouse</th>
                          <th className="p-2 font-semibold text-right">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {parsedData.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="hover:bg-muted/30">
                            <td className="p-2 font-mono font-medium text-indigo-600 dark:text-indigo-400">{row.sku}</td>
                            <td className="p-2 font-medium truncate max-w-[180px]">{row.name}</td>
                            <td className="p-2 text-muted-foreground">{row.category}</td>
                            <td className="p-2 text-muted-foreground">{row.warehouse || 'Main Hub'}</td>
                            <td className="p-2 text-right font-bold text-foreground">{row.quantity} Units</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="pt-2 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={() => (handleReset(), onClose())} className="text-xs h-9 rounded-xl">
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={parsedData.length === 0 || isParsing || !canEditInventory}
            onClick={handleConfirmImport}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 font-bold gap-1.5 shadow-sm shadow-emerald-600/20 rounded-xl"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Import {parsedData.length} Products
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
