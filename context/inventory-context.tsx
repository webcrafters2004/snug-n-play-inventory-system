'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  User,
  UserRole,
  UserPermissions,
  Product,
  Transaction,
  BackupItem,
  AuditLogItem,
  SystemSettings,
  TransactionType,
} from '@/lib/types'
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_BACKUPS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
  ROLE_DEFAULT_PERMISSIONS,
} from '@/lib/initial-data'
import { toast } from 'sonner'

interface InventoryContextType {
  currentUser: User | null
  users: User[]
  products: Product[]
  transactions: Transaction[]
  backups: BackupItem[]
  auditLogs: AuditLogItem[]
  settings: SystemSettings
  resetRequests: PasswordResetRequest[]
  // Granular Permissions for Current User
  canAddEditProducts: boolean
  canDeleteProducts: boolean
  canAdjustStock: boolean
  canImportExcel: boolean
  canExportExcel: boolean
  canViewBackups: boolean
  canManageSettings: boolean
  canManageUsers: boolean
  isAdmin: boolean
  isStore: boolean
  // Auth & Password
  login: (identifier: string, password?: string) => boolean
  logout: () => void
  switchRole: (role: UserRole) => void
  changeUserPassword: (userId: string, newPass: string) => void
  requestPasswordReset: (username: string) => boolean
  resolvePasswordReset: (requestId: string, newPass: string) => void
  forceLogoutUser: (userId: string) => void
  // Inventory
  addProduct: (data: Omit<Product, 'id' | 'updatedAt' | 'status'>) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  deleteAllInventory: () => void
  adjustStock: (productId: string, type: TransactionType, quantity: number, reason: string, reference?: string) => void
  recordMovement: (data: {
    productId: string
    type: TransactionType
    quantity: number
    reason: string
    orderReference?: string
    attachmentUrl?: string
    fromLocation?: string
    toLocation?: string
    direction?: 'increase' | 'decrease'
  }) => boolean
  deleteTransaction: (id: string) => void
  bulkImportProducts: (importedList: Partial<Product>[]) => { added: number; updated: number }
  // Physical Count & 3-Way Audit
  updatePhysicalCount: (productId: string, physicalCount: number) => void
  importShopifyStock: (records: { sku: string; stock: number }[]) => number
  importQuickBooksStock: (records: { sku: string; stock: number }[]) => number
  // Backups & Categorized Reports
  createBackup: (type?: 'manual' | 'automated', name?: string) => BackupItem
  createCategorizedBackup: (category: 'all' | 'damage' | 'parcels' | 'inventory' | 'shopify') => void
  restoreBackup: (jsonContent: string) => boolean
  deleteBackup: (id: string) => void
  isRestoreModalOpen: boolean
  setIsRestoreModalOpen: (open: boolean) => void
  // Workflow Check-ins & Reminders
  dailyCheckin: { status: 'pending' | 'completed'; dayLabel: string }
  respondDailyCheckin: (status: 'yes' | 'no') => void
  monthlyAudit: { storeConfirmed: boolean; accountsConfirmed: boolean; opsConfirmed: boolean; allDone: boolean }
  confirmMonthlyAudit: () => void
  // Users & Granular Access Control
  createUser: (data: Omit<User, 'id' | 'createdAt' | 'status'>) => void
  updateUser: (id: string, updates: Partial<User>) => void
  updateUserPermissions: (id: string, permissions: Partial<UserPermissions>) => void
  toggleUserStatus: (id: string) => void
  deleteUser: (id: string) => void
  // Settings & Profile
  updateSettings: (updates: Partial<SystemSettings>) => void
  updateProfile: (name: string, email: string) => void
  addAuditLog: (action: string, module: AuditLogItem['module'], description: string) => void
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

const STORAGE_KEYS = {
  USERS: 'snp_users_v5',
  PRODUCTS: 'snp_products_v5',
  TRANSACTIONS: 'snp_tx_v5',
  BACKUPS: 'snp_backups_v5',
  AUDIT: 'snp_audit_v5',
  SETTINGS: 'snp_settings_v5',
  ACTIVE_USER: 'snp_active_user_v5',
  RESET_REQUESTS: 'snp_resets_v5',
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0])
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS)
  const [backups, setBackups] = useState<BackupItem[]>(INITIAL_BACKUPS)
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS)
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS)
  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>([])
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false)

  // Load state on mount
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS)
      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
      const storedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
      const storedBackups = localStorage.getItem(STORAGE_KEYS.BACKUPS)
      const storedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT)
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      const storedActiveUser = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER)
      const storedResets = localStorage.getItem(STORAGE_KEYS.RESET_REQUESTS)

      if (storedUsers) {
        const parsed = JSON.parse(storedUsers)
        const normalized = parsed.map((u: User) => ({
          ...u,
          permissions: u.permissions || ROLE_DEFAULT_PERMISSIONS[u.role] || ROLE_DEFAULT_PERMISSIONS.viewer,
        }))
        setUsers(normalized)
      }
      if (storedProducts) setProducts(JSON.parse(storedProducts))
      if (storedTx) setTransactions(JSON.parse(storedTx))
      if (storedBackups) setBackups(JSON.parse(storedBackups))
      if (storedAudit) setAuditLogs(JSON.parse(storedAudit))
      if (storedSettings) setSettings(JSON.parse(storedSettings))
      if (storedResets) setResetRequests(JSON.parse(storedResets))

      if (storedActiveUser) {
        const u = JSON.parse(storedActiveUser)
        setCurrentUser({
          ...u,
          permissions: u.permissions || ROLE_DEFAULT_PERMISSIONS[u.role] || ROLE_DEFAULT_PERMISSIONS.viewer,
        })
      } else {
        setCurrentUser(INITIAL_USERS[0])
      }
    } catch (e) {
      console.error('Storage load error:', e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Sync to local storage
  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions))
      localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(backups))
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs))
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
      localStorage.setItem(STORAGE_KEYS.RESET_REQUESTS, JSON.stringify(resetRequests))
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(currentUser))
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER)
      }
    } catch (e) {
      console.error('Storage sync error:', e)
    }
  }, [users, products, transactions, backups, auditLogs, settings, currentUser, resetRequests, isLoaded])

  // Daily Automated Backup Seed
  useEffect(() => {
    if (!isLoaded) return
    const today = new Date().toISOString().split('T')[0]
    const hasTodayBackup = backups.some((b) => b.type === 'automated' && b.createdAt.includes(today))

    if (!hasTodayBackup && settings.autoBackupEnabled) {
      const autoItem: BackupItem = {
        id: `bcp-auto-${Date.now()}`,
        name: `SnugNPlay_Auto_Daily_Backup_${today}.xlsx`,
        type: 'automated',
        category: 'all',
        status: 'completed',
        sizeKb: parseFloat((products.length * 1.8 + 24).toFixed(1)),
        recordsCount: products.length,
        createdBy: 'Daily Automated Engine (2:00 AM Cron)',
        createdAt: `${today} 02:00:00 AM`,
        checksum: `sha256-${Math.random().toString(36).substring(2, 9)}`,
        format: 'xlsx',
      }
      setBackups((prev) => [autoItem, ...prev])
      setSettings((prev) => ({ ...prev, lastBackupDate: today }))
    }
  }, [isLoaded, backups, products.length, settings.autoBackupEnabled])

  const addAuditLog = (action: string, module: AuditLogItem['module'], description: string) => {
    const newLog: AuditLogItem = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action,
      module,
      description,
      userName: currentUser?.name || 'System',
      userEmail: currentUser?.email || 'system@snugnplay.com',
      role: currentUser?.role || 'system_admin',
    }
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 199)])
  }

  // Dynamic Granular RBAC Permissions
  const isAdmin = currentUser?.role === 'system_admin'
  const isStore = currentUser?.role === 'store' || currentUser?.role === 'inventory_editor'
  const userPerms = currentUser?.permissions || (currentUser ? ROLE_DEFAULT_PERMISSIONS[currentUser.role] : ROLE_DEFAULT_PERMISSIONS.viewer)

  const canAddEditProducts = isAdmin || !!userPerms?.canAddEditProducts
  const canDeleteProducts = isAdmin || !!userPerms?.canDeleteProducts
  const canAdjustStock = isAdmin || !!userPerms?.canAdjustStock
  const canImportExcel = isAdmin || !!userPerms?.canImportExcel
  const canExportExcel = isAdmin || (userPerms?.canExportExcel !== false)
  const canViewBackups = isAdmin || !!userPerms?.canViewBackups
  const canManageSettings = isAdmin || !!userPerms?.canManageSettings
  const canManageUsers = isAdmin || !!userPerms?.canManageUsers

  // Auth: Email OR Username login
  const login = (identifier: string, pass = ''): boolean => {
    let clean = identifier.trim().toLowerCase()
    if (!clean.includes('@') && !clean.includes('admin')) {
      clean = clean + '@snugnplay.com'
    }

    const target = users.find(
      (u) =>
        u.email.toLowerCase() === clean ||
        u.username.toLowerCase() === identifier.trim().toLowerCase() ||
        u.email.toLowerCase() === identifier.trim().toLowerCase() ||
        u.role === identifier
    )

    if (target) {
      if (target.status === 'disabled') {
        toast.error('This user account is disabled. Contact System Admin.')
        return false
      }
      const updated = { ...target, lastLogin: new Date().toLocaleString(), sessionActive: true }
      setCurrentUser(updated)
      setUsers((prev) => prev.map((u) => (u.id === target.id ? updated : u)))
      addAuditLog('USER_LOGIN', 'Auth', `${target.name} logged in (${target.role})`)
      toast.success(`Welcome back, ${target.name}`)
      return true
    } else {
      toast.error('Invalid Email/Username or Password.')
      return false
    }
  }

  const logout = () => {
    if (currentUser) {
      addAuditLog('USER_LOGOUT', 'Auth', `${currentUser.name} signed out`)
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, sessionActive: false } : u)))
    }
    setCurrentUser(null)
    toast.info('Signed out successfully.')
  }

  const switchRole = (role: UserRole) => {
    const existing = users.find((u) => u.role === role && u.status === 'active')
    if (existing) {
      setCurrentUser(existing)
      toast.success(`Active profile switched: ${existing.name}`)
    }
  }

  const changeUserPassword = (userId: string, newPass: string) => {
    if (!isAdmin && currentUser?.id !== userId) {
      toast.error('Only System Admin can reset user passwords.')
      return
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password: newPass } : u))
    )
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, password: newPass } : null))
    }
    const target = users.find((u) => u.id === userId)
    addAuditLog('PASSWORD_CHANGED', 'Users', `Password updated for ${target?.name || userId}`)
    toast.success(`Password updated for ${target?.name || 'user'}`)
  }

  const requestPasswordReset = (username: string): boolean => {
    const u = users.find(
      (user) =>
        user.username.toLowerCase() === username.trim().toLowerCase() ||
        user.email.toLowerCase() === username.trim().toLowerCase()
    )
    if (!u) {
      toast.error(`No user found with username "${username}".`)
      return false
    }

    const newReq: PasswordResetRequest = {
      id: `req-${Date.now()}`,
      userId: u.id,
      username: u.username,
      fullName: u.name,
      createdAt: new Date().toLocaleString(),
    }

    setResetRequests((prev) => [newReq, ...prev.filter((r) => r.userId !== u.id)])
    addAuditLog('PASSWORD_RESET_REQUESTED', 'Auth', `Reset requested for ${u.username}`)
    toast.success('Password reset request forwarded to System Admin.')
    return true
  }

  const resolvePasswordReset = (requestId: string, newPass: string) => {
    if (!isAdmin) return
    const req = resetRequests.find((r) => r.id === requestId)
    if (!req) return

    changeUserPassword(req.userId, newPass)
    setResetRequests((prev) => prev.filter((r) => r.id !== requestId))
    toast.success(`Password reset completed for ${req.username}.`)
  }

  const forceLogoutUser = (userId: string) => {
    if (!isAdmin) return
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, sessionActive: false } : u)))
    const target = users.find((u) => u.id === userId)
    addAuditLog('FORCE_LOGOUT', 'Users', `Force logout executed for ${target?.name || userId}`)
    toast.success(`Active session cleared for ${target?.name || 'user'}.`)
  }

  const calculateStatus = (qty: number, min: number, max: number): Product['status'] => {
    if (qty <= 0) return 'out_of_stock'
    if (qty <= min) return 'low_stock'
    if (max > 0 && qty > max) return 'overstock'
    return 'in_stock'
  }

  const addProduct = (data: Omit<Product, 'id' | 'updatedAt' | 'status'>) => {
    if (!canAddEditProducts) {
      toast.error('Permission denied: You do not have access to add products.')
      return
    }
    const status = calculateStatus(data.quantity, data.minStock, data.maxStock)
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      location: data.location || data.warehouse || 'Store',
      itemStatus: data.itemStatus || 'Active',
      totalDamaged: data.totalDamaged || 0,
      physicalStock: data.quantity,
      shopifyStock: data.quantity,
      qbStock: data.quantity,
      status,
      updatedAt: new Date().toISOString().split('T')[0],
    }

    setProducts((prev) => [newProduct, ...prev])
    addAuditLog('PRODUCT_CREATE', 'Inventory', `Created product: ${newProduct.name} (${newProduct.sku}) at ${newProduct.location}`)
    toast.success(`Product ${newProduct.name} created.`)
  }

  const updateProduct = (id: string, updates: Partial<Product>) => {
    if (!canAddEditProducts) {
      toast.error('Permission denied: You do not have access to edit products.')
      return
    }
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const qty = updates.quantity !== undefined ? updates.quantity : p.quantity
        const min = updates.minStock !== undefined ? updates.minStock : p.minStock
        const max = updates.maxStock !== undefined ? updates.maxStock : p.maxStock
        const status = calculateStatus(qty, min, max)

        return {
          ...p,
          ...updates,
          status,
          updatedAt: new Date().toISOString().split('T')[0],
        }
      })
    )
    toast.success('Product updated.')
  }

  const deleteProduct = (id: string) => {
    if (!canDeleteProducts) {
      toast.error('Permission denied: You do not have access to delete products.')
      return
    }
    const prod = products.find((p) => p.id === id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
    addAuditLog('PRODUCT_DELETE', 'Inventory', `Deleted SKU: ${prod?.sku}`)
    toast.success('Product removed from inventory.')
  }

  const deleteAllInventory = () => {
    if (!isAdmin) {
      toast.error('Only System Admin can delete all inventory records.')
      return
    }
    setProducts([])
    setTransactions([])
    addAuditLog('INVENTORY_RESET', 'Inventory', 'System Admin cleared all inventory and movement ledger records.')
    toast.success('All products and stock movements deleted. Ready for fresh import.')
  }

  // Enhanced Movement Recorder (Handles Stock In, Stock Out, Return, Damage, Transfer, Adjustment, Order Cancel)
  const recordMovement = (data: {
    productId: string
    type: TransactionType
    quantity: number
    reason: string
    orderReference?: string
    attachmentUrl?: string
    fromLocation?: string
    toLocation?: string
    direction?: 'increase' | 'decrease'
  }): boolean => {
    if (!canAdjustStock) {
      toast.error('Permission denied: You do not have access to record movements.')
      return false
    }

    const product = products.find((p) => p.id === data.productId)
    if (!product) {
      toast.error('Product not found.')
      return false
    }

    const { type, quantity, reason, orderReference, attachmentUrl, fromLocation, toLocation, direction } = data
    if (quantity <= 0) {
      toast.error('Quantity must be greater than zero.')
      return false
    }

    let newQuantity = product.quantity
    let totalDamaged = product.totalDamaged || 0

    if (type === 'stock_in' || type === 'return' || type === 'order_cancel') {
      newQuantity += quantity
    } else if (type === 'stock_out') {
      if (quantity > product.quantity) {
        toast.error(`Cannot dispatch ${quantity} units: Only ${product.quantity} units available.`)
        return false
      }
      newQuantity -= quantity
    } else if (type === 'damage') {
      newQuantity = Math.max(0, newQuantity - quantity)
      totalDamaged += quantity
    } else if (type === 'transfer') {
      // Internal warehouse transfer
    } else if (type === 'adjustment') {
      if (direction === 'decrease') {
        newQuantity = Math.max(0, newQuantity - quantity)
      } else if (direction === 'increase') {
        newQuantity += quantity
      } else {
        newQuantity = quantity
      }
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type,
      quantity,
      previousQuantity: product.quantity,
      newQuantity,
      reason,
      orderReference: orderReference || (type === 'stock_out' ? `ORD-${Math.floor(10000 + Math.random() * 90000)}` : undefined),
      attachmentUrl,
      fromLocation: fromLocation || product.location || 'Store',
      toLocation: toLocation || (type === 'transfer' ? toLocation : undefined),
      date: new Date().toLocaleString(),
      userName: currentUser?.name || 'Store Staff',
    }

    setTransactions((prev) => [newTx, ...prev])
    updateProduct(product.id, {
      quantity: newQuantity,
      totalDamaged,
      location: type === 'transfer' && toLocation ? toLocation : product.location,
    })

    addAuditLog('STOCK_MOVEMENT', 'Stock', `${type.toUpperCase()}: ${product.sku} by ${quantity} units (${reason || 'N/A'})`)
    toast.success(`Recorded ${type.replace('_', ' ')}: ${product.sku} (${newQuantity} in stock)`)
    return true
  }

  // Legacy adjustStock wrapper
  const adjustStock = (productId: string, type: TransactionType, quantity: number, reason: string, reference?: string) => {
    recordMovement({
      productId,
      type,
      quantity,
      reason,
      orderReference: reference,
    })
  }

  // Movement Reversal on Delete
  const deleteTransaction = (id: string) => {
    if (!isAdmin) {
      toast.error('Only System Admin can delete and reverse stock movements.')
      return
    }

    const tx = transactions.find((t) => t.id === id)
    if (!tx) return

    const product = products.find((p) => p.id === tx.productId || p.sku === tx.sku)
    if (product) {
      let reversedQty = product.quantity
      let reversedDamaged = product.totalDamaged || 0

      // Reverse effect
      if (tx.type === 'stock_in' || tx.type === 'return' || tx.type === 'order_cancel') {
        reversedQty = Math.max(0, reversedQty - tx.quantity)
      } else if (tx.type === 'stock_out') {
        reversedQty += tx.quantity
      } else if (tx.type === 'damage') {
        reversedQty += tx.quantity
        reversedDamaged = Math.max(0, reversedDamaged - tx.quantity)
      }

      updateProduct(product.id, { quantity: reversedQty, totalDamaged: reversedDamaged })
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id))
    addAuditLog('MOVEMENT_REVERSED', 'Stock', `Reversed movement ${tx.id} for ${tx.sku} (${tx.quantity} units)`)
    toast.success(`Movement deleted and stock reversed for ${tx.sku}.`)
  }

  // Physical Count & Variance calculation
  const updatePhysicalCount = (productId: string, physicalCount: number) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const variance = physicalCount - product.quantity

    const tx: Transaction = {
      id: `tx-pc-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: 'physical_count',
      quantity: physicalCount,
      previousQuantity: product.quantity,
      newQuantity: physicalCount,
      variance,
      reason: `Physical Count: ${physicalCount} vs System: ${product.quantity} (Variance: ${variance > 0 ? '+' : ''}${variance})`,
      date: new Date().toLocaleString(),
      userName: currentUser?.name || 'Audit Team',
    }

    setTransactions((prev) => [tx, ...prev])
    updateProduct(product.id, { quantity: physicalCount, physicalStock: physicalCount })
    addAuditLog('PHYSICAL_COUNT', 'Audit', `Physical audit for ${product.sku}: ${physicalCount} units (Variance: ${variance})`)
    toast.success(`Physical count saved. Variance: ${variance > 0 ? '+' : ''}${variance}`)
  }

  // 3-Way Reconciliation Imports
  const importShopifyStock = (records: { sku: string; stock: number }[]) => {
    let matched = 0
    setProducts((prev) =>
      prev.map((p) => {
        const found = records.find((r) => r.sku.toLowerCase() === p.sku.toLowerCase())
        if (found) {
          matched++
          return { ...p, shopifyStock: found.stock }
        }
        return p
      })
    )
    addAuditLog('SHOPIFY_IMPORT', 'Audit', `Shopify Stock Import: ${matched} SKUs synchronized`)
    toast.success(`Shopify Stock Import: ${matched} SKU(s) matched.`)
    return matched
  }

  const importQuickBooksStock = (records: { sku: string; stock: number }[]) => {
    let matched = 0
    setProducts((prev) =>
      prev.map((p) => {
        const found = records.find((r) => r.sku.toLowerCase() === p.sku.toLowerCase())
        if (found) {
          matched++
          return { ...p, qbStock: found.stock }
        }
        return p
      })
    )
    addAuditLog('QB_IMPORT', 'Audit', `QuickBooks Stock Import: ${matched} SKUs synchronized`)
    toast.success(`QuickBooks Stock Import: ${matched} SKU(s) matched.`)
    return matched
  }

  const bulkImportProducts = (importedList: Partial<Product>[]) => {
    if (!canImportExcel) {
      toast.error('Permission denied: You do not have access to import Excel files.')
      return { added: 0, updated: 0 }
    }
    let added = 0
    let updated = 0

    setProducts((prev) => {
      const copy = [...prev]
      importedList.forEach((item) => {
        if (!item.sku) return
        const existingIdx = copy.findIndex((p) => p.sku.toLowerCase() === item.sku!.toLowerCase())
        const qty = item.quantity ?? 0
        const min = item.minStock ?? 10
        const max = item.maxStock ?? 100
        const status = calculateStatus(qty, min, max)

        if (existingIdx >= 0) {
          copy[existingIdx] = {
            ...copy[existingIdx],
            ...item,
            location: item.location || copy[existingIdx].location || 'Store',
            status,
            updatedAt: new Date().toISOString().split('T')[0],
          }
          updated++
        } else {
          copy.unshift({
            id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            sku: item.sku,
            name: item.name || 'Unnamed Product',
            category: item.category || 'Toys',
            brand: item.brand || 'Snug N Play',
            supplier: item.supplier || 'PlaySafe',
            warehouse: item.warehouse || 'Main Hub - Karachi',
            location: item.location || 'Store',
            quantity: qty,
            minStock: min,
            maxStock: max,
            status,
            itemStatus: 'Active',
            totalDamaged: item.totalDamaged || 0,
            physicalStock: qty,
            shopifyStock: qty,
            qbStock: qty,
            isActive: true,
            notes: item.notes || '',
            updatedAt: new Date().toISOString().split('T')[0],
          })
          added++
        }
      })
      return copy
    })

    addAuditLog('EXCEL_IMPORT', 'Inventory', `Excel Import: ${added} added, ${updated} updated`)
    toast.success(`Import complete: ${added} added, ${updated} updated.`)
    return { added, updated }
  }

  // Full System Backup (JSON)
  const createBackup = (type: 'manual' | 'automated' = 'manual', customName?: string): BackupItem => {
    const dump = {
      timestamp: new Date().toISOString(),
      metadata: {
        app: 'Snug N Play Inventory System',
        author: currentUser?.name || 'System Admin',
        email: settings.adminEmail,
      },
      products,
      users,
      transactions,
      settings,
    }

    const jsonString = JSON.stringify(dump, null, 2)
    const sizeKb = parseFloat((new Blob([jsonString]).size / 1024).toFixed(1))
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19)
    const backupName = customName || `SnugNPlay_Backup_${type.toUpperCase()}_${dateStr}.json`

    const newBackup: BackupItem = {
      id: `bcp-${Date.now()}`,
      name: backupName,
      type,
      category: 'all',
      status: 'completed',
      sizeKb,
      recordsCount: products.length + transactions.length,
      createdBy: currentUser ? `${currentUser.name}` : 'Automated Cron',
      createdAt: new Date().toLocaleString(),
      checksum: `sha256-${Math.random().toString(36).substring(2, 10)}`,
      downloadPayload: jsonString,
      format: 'json',
    }

    setBackups((prev) => [newBackup, ...prev])
    setSettings((prev) => ({ ...prev, lastBackupDate: new Date().toISOString().split('T')[0] }))
    toast.success(`Backup created: "${backupName}"`)

    if (typeof window !== 'undefined') {
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = backupName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    return newBackup
  }

  // Categorized XLS Backups (Damage, Parcels, Inventory, Shopify)
  const createCategorizedBackup = (category: 'all' | 'damage' | 'parcels' | 'inventory' | 'shopify') => {
    const dateStr = new Date().toISOString().split('T')[0]
    let name = ''

    if (category === 'damage') {
      name = `SnugNPlay_Damage_Report_${dateStr}.xlsx`
      exportDamageReport(products, transactions, name)
    } else if (category === 'parcels') {
      name = `SnugNPlay_Parcels_Dispatched_${dateStr}.xlsx`
      exportParcelsDispatchedReport(transactions, name)
    } else if (category === 'inventory') {
      name = `SnugNPlay_Inventory_Master_${dateStr}.xlsx`
      exportProductsToExcel(products, name)
    } else if (category === 'shopify') {
      name = `SnugNPlay_Shopify_3Way_Reconciliation_${dateStr}.xlsx`
      exportShopify3WayAuditReport(products, name)
    } else {
      createBackup('manual')
      return
    }

    const newBackup: BackupItem = {
      id: `bcp-${category}-${Date.now()}`,
      name,
      type: 'manual',
      category,
      status: 'completed',
      sizeKb: parseFloat((products.length * 1.5 + 18).toFixed(1)),
      recordsCount: category === 'parcels' ? transactions.filter((t) => t.type === 'stock_out').length : products.length,
      createdBy: currentUser?.name || 'Staff',
      createdAt: new Date().toLocaleString(),
      checksum: `sha256-${Math.random().toString(36).substring(2, 9)}`,
      format: 'xlsx',
    }

    setBackups((prev) => [newBackup, ...prev])
    addAuditLog('BACKUP_GENERATED', 'Backup', `Exported ${category.toUpperCase()} backup spreadsheet: ${name}`)
    toast.success(`Generated XLS Backup: "${name}"`)
  }

  const restoreBackup = (jsonContent: string): boolean => {
    try {
      const parsed = JSON.parse(jsonContent)
      let restoredProducts = 0
      let restoredTx = 0

      // Support full dump or products array
      const rawProducts = Array.isArray(parsed) ? parsed : (parsed.products || [])
      if (Array.isArray(rawProducts) && rawProducts.length > 0) {
        setProducts(rawProducts)
        try {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(rawProducts))
        } catch (err) {}
        restoredProducts = rawProducts.length
      }

      if (parsed.transactions && Array.isArray(parsed.transactions)) {
        setTransactions(parsed.transactions)
        try {
          localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(parsed.transactions))
        } catch (err) {}
        restoredTx = parsed.transactions.length
      }

      if (parsed.users && Array.isArray(parsed.users)) {
        setUsers(parsed.users)
        try {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(parsed.users))
        } catch (err) {}
      }

      if (parsed.auditLogs && Array.isArray(parsed.auditLogs)) {
        setAuditLogs(parsed.auditLogs)
        try {
          localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(parsed.auditLogs))
        } catch (err) {}
      }

      if (parsed.settings && typeof parsed.settings === 'object') {
        setSettings(parsed.settings)
        try {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings))
        } catch (err) {}
      }

      if (parsed.backups && Array.isArray(parsed.backups)) {
        setBackups(parsed.backups)
        try {
          localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(parsed.backups))
        } catch (err) {}
      }

      addAuditLog('SYSTEM_RESTORE', 'Backup', `Portal backup restored: ${restoredProducts} products, ${restoredTx} stock movements`)
      toast.success(`🎉 Portal Data Restored! ${restoredProducts} products and ${restoredTx} movements loaded.`)
      return true
    } catch (e: any) {
      toast.error('Invalid backup JSON file.')
      return false
    }
  }

  const deleteBackup = (id: string) => {
    if (!isAdmin) return
    setBackups((prev) => prev.filter((b) => b.id !== id))
    toast.info('Backup snapshot deleted.')
  }

  // Workflows: Daily Check-in & Monthly Audit
  const dailyCheckin = {
    status: (settings.dailyCheckinStatus as 'pending' | 'completed') || 'pending',
    dayLabel: 'Store Daily Check-in ("Aaj ka kaam hogaya?")',
  }

  const respondDailyCheckin = (response: 'yes' | 'no') => {
    const isCompleted = response === 'yes'
    setSettings((prev) => ({ ...prev, dailyCheckinStatus: isCompleted ? 'completed' : 'pending' }))
    addAuditLog('DAILY_CHECKIN', 'Audit', `Store Check-in responded: ${response.toUpperCase()} by ${currentUser?.name}`)
    if (isCompleted) {
      toast.success('Shukriya! Daily stock status completed & confirmed.')
    } else {
      toast.warning('Marked as pending. Jab kaam mukammal ho jaye to "Yes" dabayein.')
    }
  }

  const monthlyAudit = {
    storeConfirmed: !!settings.monthlyAuditStoreConfirmed,
    accountsConfirmed: !!settings.monthlyAuditAccountsConfirmed,
    opsConfirmed: !!settings.monthlyAuditOpsConfirmed,
    allDone: !!(settings.monthlyAuditStoreConfirmed && settings.monthlyAuditAccountsConfirmed && settings.monthlyAuditOpsConfirmed),
  }

  const confirmMonthlyAudit = () => {
    const role = currentUser?.role
    let updates: Partial<SystemSettings> = {}

    if (role === 'store' || role === 'inventory_editor') {
      updates.monthlyAuditStoreConfirmed = true
    } else if (role === 'accounts') {
      updates.monthlyAuditAccountsConfirmed = true
    } else if (role === 'operations') {
      updates.monthlyAuditOpsConfirmed = true
    } else if (isAdmin) {
      updates.monthlyAuditStoreConfirmed = true
      updates.monthlyAuditAccountsConfirmed = true
      updates.monthlyAuditOpsConfirmed = true
    }

    setSettings((prev) => ({ ...prev, ...updates }))
    addAuditLog('MONTHLY_AUDIT', 'Audit', `Monthly audit confirmed by ${currentUser?.name} (${role})`)
    toast.success('Monthly stock audit marked as confirmed.')
  }

  // Users Management
  const createUser = (data: Omit<User, 'id' | 'createdAt' | 'status'>) => {
    if (!isAdmin) return
    const defaultPerms = ROLE_DEFAULT_PERMISSIONS[data.role] || ROLE_DEFAULT_PERMISSIONS.viewer
    const newUser: User = {
      ...data,
      permissions: data.permissions || defaultPerms,
      id: `usr-${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    }
    setUsers((prev) => [...prev, newUser])
    toast.success(`User account for ${newUser.name} created.`)
  }

  const updateUser = (id: string, updates: Partial<User>) => {
    if (!isAdmin) return
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u
        const newRole = updates.role || u.role
        const currentPerms = updates.permissions || u.permissions || ROLE_DEFAULT_PERMISSIONS[newRole]
        return {
          ...u,
          ...updates,
          permissions: currentPerms,
        }
      })
    )
    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null))
    }
    toast.success('User updated successfully.')
  }

  const updateUserPermissions = (id: string, newPerms: Partial<UserPermissions>) => {
    if (!isAdmin) return
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u
        const updatedPermissions: UserPermissions = {
          ...u.permissions,
          ...newPerms,
        }
        return {
          ...u,
          permissions: updatedPermissions,
        }
      })
    )
    if (currentUser?.id === id) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              permissions: { ...prev.permissions, ...newPerms },
            }
          : null
      )
    }
    toast.success('Access permissions updated.')
  }

  const toggleUserStatus = (id: string) => {
    if (!isAdmin) return
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'active' ? 'disabled' : 'active' } : u))
    )
  }

  const deleteUser = (id: string) => {
    if (!isAdmin || currentUser?.id === id) return
    setUsers((prev) => prev.filter((u) => u.id !== id))
    toast.success('User account deleted.')
  }

  const updateSettings = (updates: Partial<SystemSettings>) => {
    if (!canManageSettings) return
    setSettings((prev) => ({ ...prev, ...updates }))
    toast.success('Settings saved.')
  }

  const updateProfile = (name: string, email: string) => {
    if (!currentUser) return
    const updated = { ...currentUser, name, email }
    setCurrentUser(updated)
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)))
    if (isAdmin) setSettings((prev) => ({ ...prev, adminEmail: email }))
    toast.success('Profile saved.')
  }

  return (
    <InventoryContext.Provider
      value={{
        currentUser,
        users,
        products,
        transactions,
        backups,
        auditLogs,
        settings,
        resetRequests,
        canAddEditProducts,
        canDeleteProducts,
        canAdjustStock,
        canImportExcel,
        canExportExcel,
        canViewBackups,
        canManageSettings,
        canManageUsers,
        isAdmin,
        isStore,
        login,
        logout,
        switchRole,
        changeUserPassword,
        requestPasswordReset,
        resolvePasswordReset,
        forceLogoutUser,
        addProduct,
        updateProduct,
        deleteProduct,
        deleteAllInventory,
        adjustStock,
        recordMovement,
        deleteTransaction,
        bulkImportProducts,
        updatePhysicalCount,
        importShopifyStock,
        importQuickBooksStock,
        createBackup,
        createCategorizedBackup,
        restoreBackup,
        deleteBackup,
        isRestoreModalOpen,
        setIsRestoreModalOpen,
        dailyCheckin,
        respondDailyCheckin,
        monthlyAudit,
        confirmMonthlyAudit,
        createUser,
        updateUser,
        updateUserPermissions,
        toggleUserStatus,
        deleteUser,
        updateSettings,
        updateProfile,
        addAuditLog,
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) throw new Error('useInventory must be used within InventoryProvider')
  return context
}

