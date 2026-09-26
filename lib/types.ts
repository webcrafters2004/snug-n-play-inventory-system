export type UserRole =
  | 'system_admin'
  | 'inventory_editor'
  | 'operations'
  | 'accounts'
  | 'manager'
  | 'viewer'

export interface UserPermissions {
  canAddEditProducts: boolean
  canDeleteProducts: boolean
  canAdjustStock: boolean
  canImportExcel: boolean
  canExportExcel: boolean
  canViewBackups: boolean
  canManageSettings: boolean
  canManageUsers: boolean
}

export interface User {
  id: string
  name: string
  username: string
  email: string
  password?: string
  role: UserRole
  permissions: UserPermissions
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
  downloadPayload?: string
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
  autoBackupEnabled: boolean
  backupFrequencyDays: number
  lastBackupDate: string
  nextBackupDate: string
  lowStockThresholdDefault: number
  theme: 'light' | 'dark' | 'system'
}
