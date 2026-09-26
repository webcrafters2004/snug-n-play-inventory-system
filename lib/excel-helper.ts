import * as XLSX from 'xlsx'
import { Product } from './types'

export function exportProductsToExcel(products: Product[], filename = 'SnugNPlay_Inventory_Export.xlsx') {
  const rows = products.map((p) => ({
    SKU: p.sku,
    'Product Name': p.name,
    Category: p.category,
    Brand: p.brand,
    Supplier: p.supplier,
    Warehouse: p.warehouse,
    Quantity: p.quantity,
    'Min Stock': p.minStock,
    'Max Stock': p.maxStock,
    Status: p.status.toUpperCase().replace('_', ' '),
    Notes: p.notes || '',
    'Last Updated': p.updatedAt,
  }))

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const colWidths = Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.max(key.length + 3, 14),
  }))
  worksheet['!cols'] = colWidths

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory')
  XLSX.writeFile(workbook, filename)
}

export function downloadSampleTemplate(filename = 'SnugNPlay_Sample_Inventory_Template.xlsx') {
  const sampleData = [
    {
      SKU: 'SNP-SAMPLE-001',
      'Product Name': 'Sensory Foam Soft Block Castle Set (12-Piece)',
      Category: 'Soft Play Equipment',
      Brand: 'Snug N Play Original',
      Supplier: 'PlaySafe Foam Ltd',
      Warehouse: 'Main Hub - Karachi',
      Quantity: 30,
      'Min Stock': 10,
      'Max Stock': 100,
      Notes: 'Sample product row for reference. Edit or add rows below.',
    },
    {
      SKU: 'SNP-SAMPLE-002',
      'Product Name': 'Montessori Rainbow Wooden Stacker Ring Toy',
      Category: 'Wooden & Montessori Toys',
      Brand: 'Snug Woodcraft',
      Supplier: 'CraftWood Artisans',
      Warehouse: 'Lahore Depot',
      Quantity: 50,
      'Min Stock': 15,
      'Max Stock': 150,
      Notes: 'Non-toxic organic water-based paint.',
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(sampleData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
  XLSX.writeFile(workbook, filename)
}

export async function parseExcelFile(file: File): Promise<{
  success: boolean
  data?: Partial<Product>[]
  errors?: string[]
  totalRows: number
}> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result
        const workbook = XLSX.read(buffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        if (!sheetName) {
          return resolve({ success: false, errors: ['No sheet found in uploaded Excel file.'], totalRows: 0 })
        }

        const worksheet = workbook.Sheets[sheetName]
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

        if (!rawJson || rawJson.length === 0) {
          return resolve({ success: false, errors: ['The uploaded Excel sheet contains no rows.'], totalRows: 0 })
        }

        const errors: string[] = []
        const parsedProducts: Partial<Product>[] = []

        rawJson.forEach((row, idx) => {
          const rowNum = idx + 2
          const sku = String(row.SKU || row.sku || row['Product SKU'] || '').trim()
          const name = String(row['Product Name'] || row.Name || row.name || row.title || '').trim()
          const category = String(row.Category || row.category || 'General').trim()
          const brand = String(row.Brand || row.brand || 'Snug N Play').trim()
          const supplier = String(row.Supplier || row.supplier || 'Standard Supplier').trim()
          const warehouse = String(row.Warehouse || row.warehouse || 'Main Hub - Karachi').trim()
          const quantity = parseInt(String(row.Quantity || row.quantity || row.Qty || row.qty || '0'), 10) || 0
          const minStock = parseInt(String(row['Min Stock'] || row.minStock || row.Min || '10'), 10) || 10
          const maxStock = parseInt(String(row['Max Stock'] || row.maxStock || row.Max || '100'), 10) || 100
          const notes = String(row.Notes || row.notes || '').trim()

          if (!sku) {
            errors.push(`Row ${rowNum}: SKU is required but missing.`)
            return
          }
          if (!name) {
            errors.push(`Row ${rowNum}: Product Name is required for SKU "${sku}".`)
            return
          }

          let status: Product['status'] = 'in_stock'
          if (quantity <= 0) status = 'out_of_stock'
          else if (quantity <= minStock) status = 'low_stock'
          else if (maxStock > 0 && quantity > maxStock) status = 'overstock'

          parsedProducts.push({
            sku,
            name,
            category,
            brand,
            supplier,
            warehouse,
            quantity,
            minStock,
            maxStock,
            status,
            isActive: true,
            notes,
            updatedAt: new Date().toISOString().split('T')[0],
          })
        })

        resolve({
          success: parsedProducts.length > 0,
          data: parsedProducts,
          errors: errors.length > 0 ? errors : undefined,
          totalRows: rawJson.length,
        })
      } catch (err: any) {
        resolve({
          success: false,
          errors: [`Excel parsing error: ${err.message || 'Corrupted file'}`],
          totalRows: 0,
        })
      }
    }

    reader.onerror = () => {
      resolve({ success: false, errors: ['Failed to read file from disk.'], totalRows: 0 })
    }

    reader.readAsArrayBuffer(file)
  })
}
