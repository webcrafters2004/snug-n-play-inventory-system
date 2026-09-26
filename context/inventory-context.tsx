'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  User,
  UserRole,
  Product,
  Transaction,
  BackupItem,
  PasswordResetRequest,
  AuditLogItem,
  SystemSettings,
  TransactionType,
} from '@/lib/types'
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_BACKUPS,
  INITIAL_RESET_REQUESTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
} from '@/lib/initial-data'
import { toast } from 'sonner'

interface InventoryContextType {
  currentUser: User | null
  users: User[]
  products: Product[]
  transactions: Transaction[]
  backups: BackupItem[]
  resetRequests: PasswordResetRequest[]
  auditLogs: AuditLogItem[]
  settings: SystemSettings
  hasPermission: (permission: string) => boolean
  // Auth
  login: (userOrRole: UserRole | string) => boolean
  logout: () => void
  switchRole: (role: UserRole) => void
  requestPasswordReset: (email: string, notes?: string) => { success: boolean; message: string; refCode?: string }
  approvePasswordReset: (requestId: string, tempPassword?: string) => void
  rejectPasswordReset: (requestId: string) => void
  // Inventory
  addProduct: (data: Omit<Product, 'id' | 'updatedAt' | 'status'>) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  adjustStock: (productId: string, type: TransactionType, quantity: number, reason: string, reference?: string) => void
  bulkImportProducts: (importedList: Partial<Product>[]) => { added: number; updated: number }
  // Backups
  createBackup: (type?: 'manual' | 'automated', name?: string) => BackupItem
  restoreBackup: (jsonContent: string) => boolean
  deleteBackup: (id: string) => void
  // Users & Roles
  createUser: (data: Omit<User, 'id' | 'createdAt' | 'status'>) => void
  updateUser: (id: string, updates: Partial<User>) => void
  toggleUserStatus: (id: string) => void
  deleteUser: (id: string) => void
  // Settings & Profile
  updateSettings: (updates: Partial<SystemSettings>) => void
  updateProfile: (name: string, email: string, avatar?: string) => void
  addAuditLog: (action: string, module: AuditLogItem['module'], description: string) => void
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

const STORAGE_KEYS = {
  USERS: 'snp_inventory_users_v2',
  PRODUCTS: 'snp_inventory_products_v2',
  TRANSACTIONS: 'snp_inventory_tx_v2',
  BACKUPS: 'snp_inventory_backups_v2',
  RESETS: 'snp_inventory_resets_v2',
  AUDIT: 'snp_inventory_audit_v2',
  SETTINGS: 'snp_inventory_settings_v2',
  ACTIVE_USER: 'snp_inventory_active_user_v2',
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]) // Default: System Admin
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS)
  const [backups, setBackups] = useState<BackupItem[]>(INITIAL_BACKUPS)
  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>(INITIAL_RESET_REQUESTS)
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS)
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS)

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS)
      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
      const storedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
      const storedBackups = localStorage.getItem(STORAGE_KEYS.BACKUPS)
      const storedResets = localStorage.getItem(STORAGE_KEYS.RESETS)
      const storedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT)
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      const storedActiveUser = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER)

      if (storedUsers) setUsers(JSON.parse(storedUsers))
      if (storedProducts) setProducts(JSON.parse(storedProducts))
      if (storedTx) setTransactions(JSON.parse(storedTx))
      if (storedBackups) setBackups(JSON.parse(storedBackups))
      if (storedResets) setResetRequests(JSON.parse(storedResets))
      if (storedAudit) setAuditLogs(JSON.parse(storedAudit))
      if (storedSettings) setSettings(JSON.parse(storedSettings))

      if (storedActiveUser) {
        const found = JSON.parse(storedActiveUser)
        setCurrentUser(found)
      } else {
        setCurrentUser(INITIAL_USERS[0])
      }
    } catch (e) {
      console.error('Failed to load storage state:', e)
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
      localStorage.setItem(STORAGE_KEYS.RESETS, JSON.stringify(resetRequests))
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs))
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(currentUser))
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER)
      }
    } catch (e) {
      console.error('Failed to save to local storage:', e)
    }
  }, [users, products, transactions, backups, resetRequests, auditLogs, settings, currentUser, isLoaded])

  const addAuditLog = (action: string, module: AuditLogItem['module'], description: string) => {
    const newLog: AuditLogItem = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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

  // Permissions helper
  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false
    const role = currentUser.role
    if (role === 'system_admin') return true

    switch (permission) {
      case 'dashboard.view':
        return true
      case 'inventory.view':
        return true
      case 'inventory.create':
      case 'inventory.import':
        return role === 'operations'
      case 'inventory.edit':
      case 'inventory.adjust':
        return role === 'operations' || role === 'manager'
      case 'inventory.delete':
        return false // Admin only
      case 'inventory.export':
      case 'inventory.view_cost':
        return role === 'accounts' || role === 'manager'
      case 'analytics.view':
      case 'reports.view':
        return role === 'accounts' || role === 'manager'
      case 'backup.view':
        return role === 'accounts' || role === 'manager'
      case 'backup.create':
      case 'backup.export':
      case 'backup.restore':
        return false // Admin only
      case 'users.manage':
      case 'settings.manage':
        return false // Admin only
      default:
        return false
    }
  }

  // Auth actions
  const login = (userOrRole: UserRole | string): boolean => {
    let targetUser: User | undefined
    if (['system_admin', 'accounts', 'operations', 'manager'].includes(userOrRole)) {
      targetUser = users.find((u) => u.role === userOrRole && u.status === 'active')
    } else {
      targetUser = users.find((u) => u.email.toLowerCase() === userOrRole.toLowerCase())
    }

    if (targetUser) {
      if (targetUser.status === 'disabled') {
        toast.error('This account is disabled. Contact System Admin.')
        return false
      }
      const updated = { ...targetUser, lastLogin: new Date().toLocaleString() }
      setCurrentUser(updated)
      setUsers((prev) => prev.map((u) => (u.id === targetUser!.id ? updated : u)))
      addAuditLog('USER_LOGIN', 'Auth', `${targetUser.name} (${targetUser.role}) logged in`)
      toast.success(`Welcome back, ${targetUser.name}!`)
      return true
    } else {
      toast.error('User not found with provided credentials.')
      return false
    }
  }

  const logout = () => {
    if (currentUser) {
      addAuditLog('USER_LOGOUT', 'Auth', `${currentUser.name} signed out`)
    }
    setCurrentUser(null)
    toast.info('Logged out successfully.')
  }

  const switchRole = (role: UserRole) => {
    const existing = users.find((u) => u.role === role && u.status === 'active')
    if (existing) {
      setCurrentUser(existing)
      toast.success(`Switched role to ${existing.name} (${role.toUpperCase()})`)
      addAuditLog('ROLE_SWITCH', 'Auth', `Switched active session to ${role}`)
    }
  }

  const requestPasswordReset = (email: string, notes?: string) => {
    const trimmed = email.trim().toLowerCase()
    const targetUser = users.find((u) => u.email.toLowerCase() === trimmed)
    const refCode = `RST-${Math.floor(10000 + Math.random() * 90000)}`

    const newReq: PasswordResetRequest = {
      id: `rst-${Date.now()}`,
      referenceCode: refCode,
      userId: targetUser?.id,
      userEmail: trimmed,
      userName: targetUser?.name || 'External User Request',
      status: 'pending',
      requestedAt: new Date().toLocaleString(),
      notes: notes || 'Password reset requested via login portal.',
    }

    setResetRequests((prev) => [newReq, ...prev])
    addAuditLog('PASSWORD_RESET_REQ', 'Auth', `Password reset requested for ${trimmed} (Ref: ${refCode})`)
    return {
      success: true,
      message: `Reset request submitted. Ref Code: ${refCode}. The System Admin has been notified to generate your new access key.`,
      refCode,
    }
  }

  const approvePasswordReset = (requestId: string, tempPassword = 'SnugPlay@' + Math.floor(1000 + Math.random() * 9000)) => {
    setResetRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: 'approved',
              handledAt: new Date().toLocaleString(),
              handledBy: currentUser?.name || 'System Admin',
              temporaryPassword: tempPassword,
            }
          : req
      )
    )
    addAuditLog('PASSWORD_RESET_APPROVED', 'Auth', `System Admin approved reset request ID ${requestId}`)
    toast.success(`Reset request approved. Temporary password assigned: ${tempPassword}`)
  }

  const rejectPasswordReset = (requestId: string) => {
    setResetRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: 'rejected',
              handledAt: new Date().toLocaleString(),
              handledBy: currentUser?.name || 'System Admin',
            }
          : req
      )
    )
    addAuditLog('PASSWORD_RESET_REJECTED', 'Auth', `System Admin rejected reset request ID ${requestId}`)
    toast.info('Password reset request was rejected.')
  }

  // Product CRUD
  const calculateStatus = (qty: number, min: number, max: number): Product['status'] => {
    if (qty <= 0) return 'out_of_stock'
    if (qty <= min) return 'low_stock'
    if (max > 0 && qty > max) return 'overstock'
    return 'in_stock'
  }

  const addProduct = (data: Omit<Product, 'id' | 'updatedAt' | 'status'>) => {
    const status = calculateStatus(data.quantity, data.minStock, data.maxStock)
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      status,
      updatedAt: new Date().toISOString().split('T')[0],
    }

    setProducts((prev) => [newProduct, ...prev])
    addAuditLog('PRODUCT_CREATE', 'Inventory', `Created product: ${newProduct.name} (SKU: ${newProduct.sku})`)
    toast.success(`Product "${newProduct.name}" added successfully.`)
  }

  const updateProduct = (id: string, updates: Partial<Product>) => {
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
    addAuditLog('PRODUCT_UPDATE', 'Inventory', `Updated product ID ${id}`)
    toast.success('Product updated successfully.')
  }

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
    addAuditLog('PRODUCT_DELETE', 'Inventory', `Deleted product: ${prod?.name || id} (SKU: ${prod?.sku})`)
    toast.success('Product deleted from inventory.')
  }

  // Stock adjustments
  const adjustStock = (
    productId: string,
    type: TransactionType,
    quantity: number,
    reason: string,
    reference?: string
  ) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    let newQuantity = product.quantity
    if (type === 'stock_in' || type === 'return') {
      newQuantity += quantity
    } else if (type === 'stock_out' || type === 'damage') {
      newQuantity = Math.max(0, newQuantity - quantity)
    } else if (type === 'adjustment') {
      newQuantity = quantity
    }

    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      productId,
      productName: product.name,
      sku: product.sku,
      type,
      quantity,
      previousQuantity: product.quantity,
      newQuantity,
      reason,
      reference: reference || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleString(),
      userName: currentUser?.name || 'System User',
    }

    setTransactions((prev) => [tx, ...prev])
    updateProduct(productId, { quantity: newQuantity })
    addAuditLog('STOCK_ADJUSTMENT', 'Stock', `${type.toUpperCase()}: ${product.sku} altered by ${quantity} units.`)
    toast.success(`Stock updated for SKU ${product.sku} (New Qty: ${newQuantity})`)
  }

  // Bulk Excel Import
  const bulkImportProducts = (importedList: Partial<Product>[]) => {
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
            status,
            updatedAt: new Date().toISOString().split('T')[0],
          }
          updated++
        } else {
          copy.unshift({
            id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            sku: item.sku,
            name: item.name || 'Unnamed Imported Product',
            category: item.category || 'General Toys',
            brand: item.brand || 'Snug N Play',
            supplier: item.supplier || 'Standard Supplier',
            warehouse: item.warehouse || 'Main Hub - Karachi',
            quantity: qty,
            minStock: min,
            maxStock: max,
            unitCost: item.unitCost || 0,
            sellingPrice: item.sellingPrice || 0,
            status,
            isActive: true,
            notes: item.notes || 'Imported via Excel Batch',
            updatedAt: new Date().toISOString().split('T')[0],
          })
          added++
        }
      })
      return copy
    })

    addAuditLog('EXCEL_IMPORT', 'Inventory', `Imported Excel Batch: ${added} added, ${updated} updated.`)
    toast.success(`Excel Import Complete! ${added} new items added, ${updated} existing items updated.`)
    return { added, updated }
  }

  // Backups
  const createBackup = (type: 'manual' | 'automated' = 'manual', customName?: string): BackupItem => {
    const dump = {
      timestamp: new Date().toISOString(),
      metadata: {
        app: 'Snugnplay Inventory System',
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
      status: 'completed',
      sizeKb,
      recordsCount: products.length + transactions.length + users.length,
      createdBy: currentUser ? `${currentUser.name} (${currentUser.email})` : 'Automated Cron (30-Day)',
      createdAt: new Date().toLocaleString(),
      checksum: `sha256-${Math.random().toString(36).substring(2, 12)}`,
      downloadPayload: jsonString,
    }

    setBackups((prev) => [newBackup, ...prev])

    // Update settings last backup
    setSettings((prev) => ({
      ...prev,
      lastBackupDate: new Date().toISOString().split('T')[0],
    }))

    addAuditLog('BACKUP_CREATED', 'Backup', `Generated ${type} backup: ${backupName} (${sizeKb} KB)`)
    toast.success(`Backup snapshot "${backupName}" created successfully!`)

    // Trigger instant download for manual backup
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

  const restoreBackup = (jsonContent: string): boolean => {
    try {
      const parsed = JSON.parse(jsonContent)
      if (!parsed.products || !Array.isArray(parsed.products)) {
        toast.error('Invalid backup file structure: Missing products dataset.')
        return false
      }

      if (parsed.products) setProducts(parsed.products)
      if (parsed.users && Array.isArray(parsed.users)) setUsers(parsed.users)
      if (parsed.transactions && Array.isArray(parsed.transactions)) setTransactions(parsed.transactions)
      if (parsed.settings) setSettings(parsed.settings)

      addAuditLog('BACKUP_RESTORED', 'Backup', `Restored system state from uploaded JSON snapshot.`)
      toast.success('System state and inventory restored successfully!')
      return true
    } catch (e: any) {
      toast.error(`Restore failed: ${e.message || 'Malformed JSON'}`)
      return false
    }
  }

  const deleteBackup = (id: string) => {
    setBackups((prev) => prev.filter((b) => b.id !== id))
    toast.info('Backup record removed.')
  }

  // Users Management
  const createUser = (data: Omit<User, 'id' | 'createdAt' | 'status'>) => {
    const newUser: User = {
      ...data,
      id: `usr-${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    }
    setUsers((prev) => [...prev, newUser])
    addAuditLog('USER_CREATE', 'Users', `Created new user: ${newUser.name} (${newUser.email}) with role ${newUser.role}`)
    toast.success(`User "${newUser.name}" created successfully.`)
  }

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)))
    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null))
    }
    addAuditLog('USER_UPDATE', 'Users', `Updated user ID ${id}`)
    toast.success('User updated successfully.')
  }

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u
        const nextStatus = u.status === 'active' ? 'disabled' : 'active'
        toast.info(`Account for ${u.name} is now ${nextStatus}.`)
        return { ...u, status: nextStatus }
      })
    )
  }

  const deleteUser = (id: string) => {
    if (currentUser?.id === id) {
      toast.error('Cannot delete the currently logged in user.')
      return
    }
    setUsers((prev) => prev.filter((u) => u.id !== id))
    addAuditLog('USER_DELETE', 'Users', `Deleted user ID ${id}`)
    toast.success('User removed.')
  }

  // Settings & Profile
  const updateSettings = (updates: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
    addAuditLog('SETTINGS_UPDATE', 'Settings', 'Updated system preferences and company configuration.')
    toast.success('System settings saved.')
  }

  const updateProfile = (name: string, email: string, avatar?: string) => {
    if (!currentUser) return
    const updated = { ...currentUser, name, email, avatar: avatar || currentUser.avatar }
    setCurrentUser(updated)
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)))
    if (currentUser.role === 'system_admin') {
      setSettings((prev) => ({ ...prev, adminEmail: email }))
    }
    addAuditLog('PROFILE_UPDATE', 'Auth', `${name} updated their profile info.`)
    toast.success('Profile details updated successfully.')
  }

  return (
    <InventoryContext.Provider
      value={{
        currentUser,
        users,
        products,
        transactions,
        backups,
        resetRequests,
        auditLogs,
        settings,
        hasPermission,
        login,
        logout,
        switchRole,
        requestPasswordReset,
        approvePasswordReset,
        rejectPasswordReset,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        bulkImportProducts,
        createBackup,
        restoreBackup,
        deleteBackup,
        createUser,
        updateUser,
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
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider')
  }
  return context
}
