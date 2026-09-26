export type UserRole = 'system_admin' | 'accounts' | 'operations' | 'manager'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: 'active' | 'disabled'
  avatar?: string
  lastLogin?: string
  createdAt: string
}

export type ProductStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock'

export interface Product {
  id: string
  sku: string
  name: string
  category: string
  brand: string
  supplier: string
  warehouse: string
  quantity: number
  minStock: number
  maxStock: number
  unitCost: number
  sellingPrice: number
  status: ProductStatus
  isActive: boolean
  notes?: string
  updatedAt: string
}

export type TransactionType = 'stock_in' | 'stock_out' | 'adjustment' | 'damage' | 'return' | 'import'

export interface Transaction {
  id: string
  productId: string
  productName: string
  sku: string
  type: TransactionType
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason: string
  reference?: string
  date: string
  userName: string
}

export interface BackupItem {
  id: string
  name: string
  type: 'automated' | 'manual'
  status: 'completed' | 'in_progress' | 'failed'
  sizeKb: number
  recordsCount: number
  createdBy: string
  createdAt: string
  checksum: string
  downloadPayload?: string // JSON string dump
}

export interface PasswordResetRequest {
  id: string
  referenceCode: string
  userId?: string
  userEmail: string
  userName: string
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: string
  handledAt?: string
  handledBy?: string
  temporaryPassword?: string
  notes?: string
}

export interface AuditLogItem {
  id: string
  timestamp: string
  action: string
  module: 'Auth' | 'Inventory' | 'Stock' | 'Users' | 'Backup' | 'Settings'
  description: string
  userName: string
  userEmail: string
  role: UserRole
}

export interface SystemSettings {
  companyName: string
  adminEmail: string
  currency: string
  currencySymbol: string
  autoBackupEnabled: boolean
  backupFrequencyDays: number
  lastBackupDate: string
  nextBackupDate: string
  lowStockThresholdDefault: number
  theme: 'light' | 'dark' | 'system'
}
