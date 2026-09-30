import * as XLSX from 'xlsx'
import { Product, Transaction } from './types'

export function exportProductsToExcel(products: Product[], filename = 'SnugNPlay_Inventory_Export.xlsx') {
  const rows = products.map((p) => ({
    SKU: p.sku,
    'Product Name': p.name,
    'Physical Stock': p.quantity,
    Location: p.location || p.warehouse || 'Store',
    'Product Photo URL': p.imageUrl || '',
    'Total Damaged': p.totalDamaged || 0,
    Status: p.status.toUpperCase().replace('_', ' '),
    'Min Alert Stock': p.minStock,
    'Max Stock': p.maxStock,
    'Item State': p.itemStatus || 'Active',
    Notes: p.notes || '',
    'Last Updated': p.updatedAt,
  }))

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const colWidths = Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.max(key.length + 3, 14),
  }))
  worksheet['!cols'] = colWidths

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory_Master')
  XLSX.writeFile(workbook, filename)
}

// 1. Damage Stock Backup & Report (XLS)
export function exportDamageReport(products: Product[], transactions: Transaction[], filename?: string) {
  const dateStr = new Date().toISOString().split('T')[0]
  const targetFilename = filename || `SnugNPlay_Damage_Report_${dateStr}.xlsx`

  // Damaged items aggregated by SKU
  const damageRows = products
    .filter((p) => (p.totalDamaged && p.totalDamaged > 0) || p.quantity <= 0)
    .map((p) => {
      const damageTx = transactions.filter((t) => t.sku === p.sku && t.type === 'damage')
      const latestReason = damageTx[0]?.reason || 'Reported damaged in warehouse'
      const latestDate = damageTx[0]?.date || p.updatedAt

      return {
        SKU: p.sku,
        'Product Name': p.name,
        Location: p.location || p.warehouse,
        'Damaged Units': p.totalDamaged || 0,
        'Current Good Stock': p.quantity,
        Status: p.status.toUpperCase().replace('_', ' '),
        'Latest Damage Reason': latestReason,
        'Last Damage Date': latestDate,
      }
    })

  const worksheet = XLSX.utils.json_to_sheet(damageRows.length ? damageRows : [{ Note: 'No damaged products recorded.' }])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Damage_Stock_Backup')
  XLSX.writeFile(workbook, targetFilename)
}

// 2. Dispatched Parcels / Stock Out Backup & Report (XLS)
export function exportParcelsDispatchedReport(transactions: Transaction[], filename?: string) {
  const dateStr = new Date().toISOString().split('T')[0]
  const targetFilename = filename || `SnugNPlay_Parcels_Dispatched_${dateStr}.xlsx`

  const parcelRows = transactions
    .filter((t) => t.type === 'stock_out' || t.type === 'order_cancel')
    .map((t) => ({
      'Order # / Reference': t.orderReference || t.reference || 'N/A',
      Date: t.date,
      SKU: t.sku,
      'Product Name': t.productName,
      'Movement Type': t.type === 'stock_out' ? 'Dispatched Parcel' : 'Order Cancelled',
      'Dispatched Quantity': t.quantity,
      'Previous Stock': t.previousQuantity,
      'New Stock': t.newQuantity,
      Location: t.fromLocation || 'Store',
      'Operator / Dispatcher': t.userName,
      'Proof / Attachment': t.attachmentUrl || 'None',
      Notes: t.reason || '',
    }))

  const worksheet = XLSX.utils.json_to_sheet(parcelRows.length ? parcelRows : [{ Note: 'No dispatched parcels recorded yet.' }])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dispatched_Parcels_Backup')
  XLSX.writeFile(workbook, targetFilename)
}

// 3. 3-Way Audit Reconciliation Report: Physical vs Shopify vs QuickBooks (XLS)
export function exportShopify3WayAuditReport(products: Product[], filename?: string) {
  const dateStr = new Date().toISOString().split('T')[0]
  const targetFilename = filename || `SnugNPlay_3Way_Audit_Shopify_QB_${dateStr}.xlsx`

  const auditRows = products.map((p) => {
    const physical = p.physicalStock ?? p.quantity
    const shopify = p.shopifyStock ?? p.quantity
    const qb = p.qbStock ?? p.quantity
    const hasDiscrepancy = physical !== shopify || physical !== qb
    const variance = physical - shopify

    return {
      SKU: p.sku,
      'Product Name': p.name,
      Location: p.location || p.warehouse,
      'System Stock': p.quantity,
      'Physical Count': p.physicalStock !== undefined ? p.physicalStock : 'Pending Count',
      'Shopify Stock': p.shopifyStock !== undefined ? p.shopifyStock : 'Not Synced',
      'QuickBooks Stock': p.qbStock !== undefined ? p.qbStock : 'Not Synced',
      'Physical vs Shopify Variance': variance,
      'Audit Status': hasDiscrepancy ? 'DISCREPANCY' : 'MATCH',
      'Last Audit Date': dateStr,
    }
  })

  const worksheet = XLSX.utils.json_to_sheet(auditRows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '3Way_Reconciliation')
  XLSX.writeFile(workbook, targetFilename)
}

// 4. Stock Movement Ledger & Audit Trail Report (XLS)
export function exportStockMovementsReport(transactions: Transaction[], filename?: string) {
  const dateStr = new Date().toISOString().split('T')[0]
  const targetFilename = filename || `SnugNPlay_Stock_Movements_${dateStr}.xlsx`

  const rows = transactions.map((t) => ({
    'Transaction ID': t.id,
    Date: t.date,
    SKU: t.sku,
    'Product Name': t.productName,
    'Movement Type': t.type.toUpperCase().replace('_', ' '),
    Quantity: t.quantity,
    'Previous Stock': t.previousQuantity,
    'New Stock': t.newQuantity,
    'Order # / Reference': t.orderReference || t.reference || 'N/A',
    Location: t.fromLocation || 'Store',
    'To Location': t.toLocation || '',
    'Logged By': t.userName,
    Reason: t.reason || '',
  }))

  const worksheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Note: 'No stock movements found for the selected period.' }])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock_Movements')
  XLSX.writeFile(workbook, targetFilename)
}


// 4. Download Sample Templates
export function downloadSampleTemplate(filename = 'SnugNPlay_Sample_Inventory_Template.xlsx') {
  const sampleData = [
    {
      'Product Photo': 'SNP-SP-001.jpg',
      SKU: 'SNP-SP-001',
      'Product Name': 'Pastel Modular Soft Play Climb & Crawl Set (5-Piece)',
      Location: 'Store',
      Quantity: 42,
      'Min Stock': 10,
      Status: 'Active',
      Notes: 'Wipe-clean vegan leather cover.',
    },
    {
      'Product Photo': 'SNP-BP-002.jpg',
      SKU: 'SNP-BP-002',
      'Product Name': 'Luxury Velvet Ball Pit with 200 Pearl Balls',
      Location: 'Shed',
      Quantity: 18,
      'Min Stock': 10,
      Status: 'Active',
      Notes: 'Washable velvet cover.',
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(sampleData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory_Template')
  XLSX.writeFile(workbook, filename)
}

export function downloadShopifyTemplate(filename = 'shopify-inventory-template.xlsx') {
  const sampleData = [
    {
      'Handle': 'pastel-modular-soft-play-climb-crawl-set',
      'Title': 'Pastel Modular Soft Play Climb & Crawl Set (5-Piece)',
      'Variant SKU': 'SNP-SP-001',
      'Variant Inventory Qty': 42,
      'Variant Price': '12500',
    },
    {
      'Handle': 'luxury-velvet-ball-pit',
      'Title': 'Luxury Velvet Ball Pit with 200 Pearl Balls',
      'Variant SKU': 'SNP-BP-002',
      'Variant Inventory Qty': 18,
      'Variant Price': '9500',
    },
  ]
  const worksheet = XLSX.utils.json_to_sheet(sampleData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Shopify_Inventory')
  XLSX.writeFile(workbook, filename)
}

export function downloadQuickBooksTemplate(filename = 'quickbooks-inventory-template.xlsx') {
  const sampleData = [
    {
      'Item Name': 'Pastel Modular Soft Play Climb & Crawl Set',
      'Item SKU': 'SNP-SP-001',
      'Type': 'Inventory',
      'Quantity On Hand': 42,
      'Cost': '8000',
    },
    {
      'Item Name': 'Luxury Velvet Ball Pit with 200 Pearl Balls',
      'Item SKU': 'SNP-BP-002',
      'Type': 'Inventory',
      'Quantity On Hand': 18,
      'Cost': '6000',
    },
  ]
  const worksheet = XLSX.utils.json_to_sheet(sampleData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'QuickBooks_Inventory')
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

        let lastSeenTitle = ''

        rawJson.forEach((row, idx) => {
          const rowNum = idx + 2

          // 1. SKU Detection (supports standard, internal, and Shopify Variant SKU)
          const sku = String(
            row['Variant SKU'] ||
            row.SKU ||
            row.sku ||
            row['Product SKU'] ||
            row['Item Code'] ||
            row['Item SKU'] ||
            ''
          ).trim()

          // 2. Product Name / Title Detection (supports standard and Shopify Title with variant fill-down)
          let rawTitle = String(
            row['Product Name'] ||
            row.Title ||
            row.title ||
            row.Name ||
            row.name ||
            row.Handle ||
            row.handle ||
            ''
          ).trim()

          if (rawTitle) {
            lastSeenTitle = rawTitle
          } else if (lastSeenTitle) {
            rawTitle = lastSeenTitle
          }

          // Check for Variant Options (e.g. Color, Size from Shopify)
          const option1Val = String(row['Option1 Value'] || '').trim()
          const option2Val = String(row['Option2 Value'] || '').trim()
          const option3Val = String(row['Option3 Value'] || '').trim()

          const optionsList = [option1Val, option2Val, option3Val].filter(
            (opt) => opt && opt.toLowerCase() !== 'default title'
          )

          let name = rawTitle
          if (optionsList.length > 0 && !name.toLowerCase().includes(option1Val.toLowerCase())) {
            name = `${rawTitle} (${optionsList.join(' / ')})`
          }

          // 3. Category, Brand, Supplier, Warehouse defaults
          const category = String(row['Product Category'] || row.Category || row.category || 'General').trim()
          const brand = String(row.Vendor || row.Brand || row.brand || 'Snug N Play').trim()
          const supplier = String(row.Supplier || row.supplier || 'Standard Supplier').trim()
          const warehouse = String(row.Warehouse || row.warehouse || 'Main Hub - Karachi').trim()

          // 4. Quantity Detection (supports standard and Shopify Variant Inventory Qty)
          const rawQty =
            row['Variant Inventory Qty'] ||
            row['Inventory Available: Karachi'] ||
            row['Inventory Available: Main Store'] ||
            row.Quantity ||
            row.quantity ||
            row['Physical Stock'] ||
            row.Qty ||
            row.qty ||
            row['Quantity On Hand'] ||
            '0'
          const quantity = parseInt(String(rawQty), 10) || 0

          const minStock = parseInt(String(row['Min Alert Stock'] || row['Min Stock'] || row.minStock || row.Min || '5'), 10) || 5
          const maxStock = parseInt(String(row['Max Stock'] || row.maxStock || row.Max || '100'), 10) || 100

          // 5. Notes / Details / Options (strip HTML if Body (HTML) from Shopify)
          let notes = String(row.Notes || row.notes || row['Body (HTML)'] || '').trim()
          if (notes.includes('<') && notes.includes('>')) {
            notes = notes.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()
          }
          if (optionsList.length > 0) {
            const optDetails: string[] = []
            if (row['Option1 Name'] && option1Val) optDetails.push(`${row['Option1 Name']}: ${option1Val}`)
            if (row['Option2 Name'] && option2Val) optDetails.push(`${row['Option2 Name']}: ${option2Val}`)
            if (optDetails.length > 0) {
              const optStr = optDetails.join(' | ')
              notes = notes ? `${optStr} — ${notes}` : optStr
            }
          }

          // 6. Location and Image Detection (supports Image Src and Variant Image from Shopify)
          const location = String(row.Location || row.location || row.Warehouse || row.warehouse || 'Store').trim()
          const imageUrl = String(
            row['Image Src'] ||
            row['Variant Image'] ||
            row['Product Photo URL'] ||
            row['Product Photo'] ||
            row.Image ||
            row.imageUrl ||
            row.photo ||
            ''
          ).trim() || undefined
          const totalDamaged = parseInt(String(row['Total Damaged'] || row.Damaged || row.damaged || '0'), 10) || 0

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
            location,
            imageUrl,
            totalDamaged,
            quantity,
            minStock,
            maxStock,
            status,
            itemStatus: 'Active',
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

// 5. Parse Shopify or QuickBooks Stock file for 3-Way Reconciliation
export async function parseExternalReconciliationFile(file: File): Promise<{
  success: boolean
  matchedRecords: { sku: string; stock: number }[]
  errors?: string[]
}> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result
        const workbook = XLSX.read(buffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        if (!sheetName) return resolve({ success: false, matchedRecords: [], errors: ['No sheet found.'] })

        const worksheet = workbook.Sheets[sheetName]
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

        const matched: { sku: string; stock: number }[] = []
        rawJson.forEach((row) => {
          // Detect Shopify columns or QuickBooks columns
          const sku = String(
            row['Variant SKU'] ||
            row['Item SKU'] ||
            row['SKU'] ||
            row['sku'] ||
            row['Item Number'] ||
            ''
          ).trim()

          const stockRaw =
            row['Variant Inventory Qty'] ??
            row['Quantity On Hand'] ??
            row['Qty On Hand'] ??
            row['Quantity'] ??
            row['stock'] ??
            row['Stock']

          if (sku && stockRaw !== undefined && stockRaw !== '') {
            const stock = parseInt(String(stockRaw), 10) || 0
            matched.push({ sku, stock })
          }
        })

        resolve({
          success: matched.length > 0,
          matchedRecords: matched,
        })
      } catch (err: any) {
        resolve({
          success: false,
          matchedRecords: [],
          errors: [err.message || 'Failed to read external reconciliation file.'],
        })
      }
    }

    reader.readAsArrayBuffer(file)
  })
}

