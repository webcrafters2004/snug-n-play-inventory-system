export type UserRole =
  | 'system_admin'
  | 'inventory_editor'
  | 'store'
  | 'operations'
  | 'accounts'
  | 'manager'
  | 'viewer'

export const WAREHOUSE_LOCATIONS = [
  'Store',
  'Shed',
  'Red Container',
  'Blue Container',
  'Grey Container',
  'Office',
] as const

export type WarehouseLocation = (typeof WAREHOUSE_LOCATIONS)[number]

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
  phone?: string
  sessionActive?: boolean
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
  location?: string
  quantity: number
  minStock: number
  maxStock: number
  status: ProductStatus
  itemStatus?: 'Active' | 'Inactive' | 'Hold'
  totalDamaged?: number
  physicalStock?: number
  shopifyStock?: number
  qbStock?: number
  imageUrl?: string
  isActive: boolean
  notes?: string
  updatedAt: string
}

export type TransactionType =
  | 'stock_in'
  | 'stock_out'
  | 'adjustment'
  | 'damage'
  | 'return'
  | 'import'
  | 'transfer'
  | 'order_cancel'
  | 'physical_count'

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
  orderReference?: string
  attachmentUrl?: string
  fromLocation?: string
  toLocation?: string
  variance?: number
  date: string
  userName: string
}

export interface BackupItem {
  id: string
  name: string
  type: 'automated' | 'manual'
  category?: 'all' | 'damage' | 'parcels' | 'inventory' | 'shopify'
  status: 'completed' | 'in_progress' | 'failed'
  sizeKb: number
  recordsCount: number
  createdBy: string
  createdAt: string
  checksum: string
  downloadPayload?: string
  format?: 'json' | 'xlsx'
}

export interface AuditLogItem {
  id: string
  timestamp: string
  action: string
  module: 'Auth' | 'Inventory' | 'Stock' | 'Users' | 'Backup' | 'Settings' | 'Audit' | 'Reports'
  description: string
  userName: string
  userEmail: string
  role: UserRole
}

export interface PasswordResetRequest {
  id: string
  userId: string
  username: string
  fullName: string
  createdAt: string
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
  dailyCheckinStatus?: 'pending' | 'completed'
  monthlyAuditStoreConfirmed?: boolean
  monthlyAuditAccountsConfirmed?: boolean
  monthlyAuditOpsConfirmed?: boolean
}

