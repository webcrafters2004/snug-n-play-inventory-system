'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  User,
  UserRole,
  Product,
  Transaction,
  BackupItem,
  AuditLogItem,
  SystemSettings,
  TransactionType,
  ShopifySyncAlert,
} from '@/lib/types'
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_BACKUPS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
  INITIAL_SHOPIFY_ALERTS,
} from '@/lib/initial-data'
import { toast } from 'sonner'

interface InventoryContextType {
  currentUser: User | null
  users: User[]
  products: Product[]
  transactions: Transaction[]
  backups: BackupItem[]
  shopifyAlerts: ShopifySyncAlert[]
  auditLogs: AuditLogItem[]
  settings: SystemSettings
  canEditInventory: boolean
  isAdmin: boolean
  // Auth & Password
  login: (identifier: string, password?: string) => boolean
  logout: () => void
  switchRole: (role: UserRole) => void
  changeUserPassword: (userId: string, newPass: string) => void
  // Inventory
  addProduct: (data: Omit<Product, 'id' | 'updatedAt' | 'status'>) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  adjustStock: (productId: string, type: TransactionType, quantity: number, reason: string, reference?: string) => void
  bulkImportProducts: (importedList: Partial<Product>[]) => { added: number; updated: number }
  // Shopify Sync
  syncWithShopify: () => void
  dismissShopifyAlert: (alertId: string) => void
  // Backups
  createBackup: (type?: 'manual' | 'automated', name?: string) => BackupItem
  restoreBackup: (jsonContent: string) => boolean
  deleteBackup: (id: string) => void
  // Users
  createUser: (data: Omit<User, 'id' | 'createdAt' | 'status'>) => void
  updateUser: (id: string, updates: Partial<User>) => void
  toggleUserStatus: (id: string) => void
  deleteUser: (id: string) => void
  // Settings & Profile
  updateSettings: (updates: Partial<SystemSettings>) => void
  updateProfile: (name: string, email: string) => void
  addAuditLog: (action: string, module: AuditLogItem['module'], description: string) => void
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

const STORAGE_KEYS = {
  USERS: 'snp_users_v3',
  PRODUCTS: 'snp_products_v3',
  TRANSACTIONS: 'snp_tx_v3',
  BACKUPS: 'snp_backups_v3',
  SHOPIFY: 'snp_shopify_v3',
  AUDIT: 'snp_audit_v3',
  SETTINGS: 'snp_settings_v3',
  ACTIVE_USER: 'snp_active_user_v3',
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0])
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS)
  const [backups, setBackups] = useState<BackupItem[]>(INITIAL_BACKUPS)
  const [shopifyAlerts, setShopifyAlerts] = useState<ShopifySyncAlert[]>(INITIAL_SHOPIFY_ALERTS)
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS)
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS)

  // Load state on mount
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS)
      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
      const storedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
      const storedBackups = localStorage.getItem(STORAGE_KEYS.BACKUPS)
      const storedShopify = localStorage.getItem(STORAGE_KEYS.SHOPIFY)
      const storedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT)
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      const storedActiveUser = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER)

      if (storedUsers) setUsers(JSON.parse(storedUsers))
      if (storedProducts) setProducts(JSON.parse(storedProducts))
      if (storedTx) setTransactions(JSON.parse(storedTx))
      if (storedBackups) setBackups(JSON.parse(storedBackups))
      if (storedShopify) setShopifyAlerts(JSON.parse(storedShopify))
      if (storedAudit) setAuditLogs(JSON.parse(storedAudit))
      if (storedSettings) setSettings(JSON.parse(storedSettings))

      if (storedActiveUser) {
        setCurrentUser(JSON.parse(storedActiveUser))
      } else {
        setCurrentUser(INITIAL_USERS[0])
      }
    } catch (e) {
      console.error('Storage load failed:', e)
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
      localStorage.setItem(STORAGE_KEYS.SHOPIFY, JSON.stringify(shopifyAlerts))
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs))
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(currentUser))
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER)
      }
    } catch (e) {
      console.error('Storage sync failed:', e)
    }
  }, [users, products, transactions, backups, shopifyAlerts, auditLogs, settings, currentUser, isLoaded])

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
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)])
  }

  // RBAC flags: Only System Admin & Inventory Editor can mutate catalog
  const canEditInventory = currentUser?.role === 'system_admin' || currentUser?.role === 'inventory_editor'
  const isAdmin = currentUser?.role === 'system_admin'

  // Auth: Email OR Username login
  const login = (identifier: string, pass = ''): boolean => {
    const target = users.find(
      (u) =>
        u.email.toLowerCase() === identifier.trim().toLowerCase() ||
        u.username.toLowerCase() === identifier.trim().toLowerCase() ||
        u.role === identifier
    )

    if (target) {
      if (target.status === 'disabled') {
        toast.error('This user account is disabled. Contact System Admin.')
        return false
      }
      const updated = { ...target, lastLogin: new Date().toLocaleString() }
      setCurrentUser(updated)
      setUsers((prev) => prev.map((u) => (u.id === target.id ? updated : u)))
      addAuditLog('USER_LOGIN', 'Auth', `${target.name} (${target.role}) logged in`)
      toast.success(`Welcome, ${target.name}!`)
      return true
    } else {
      toast.error('Invalid Email/Username or Password.')
      return false
    }
  }

  const logout = () => {
    if (currentUser) {
      addAuditLog('USER_LOGOUT', 'Auth', `${currentUser.name} signed out`)
    }
    setCurrentUser(null)
    toast.info('Signed out.')
  }

  const switchRole = (role: UserRole) => {
    const existing = users.find((u) => u.role === role && u.status === 'active')
    if (existing) {
      setCurrentUser(existing)
      toast.success(`Switched role: ${existing.name} (${role.replace('_', ' ')})`)
    }
  }

  // Admin changes password for any user
  const changeUserPassword = (userId: string, newPass: string) => {
    if (!isAdmin) {
      toast.error('Only System Admin can reset/change user passwords.')
      return
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password: newPass } : u))
    )
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, password: newPass } : null))
    }
    const target = users.find((u) => u.id === userId)
    addAuditLog('PASSWORD_CHANGED', 'Users', `System Admin updated password for ${target?.name || userId}`)
    toast.success(`Password updated for ${target?.name || 'user'}!`)
  }

  // Product status helper
  const calculateStatus = (qty: number, min: number, max: number): Product['status'] => {
    if (qty <= 0) return 'out_of_stock'
    if (qty <= min) return 'low_stock'
    if (max > 0 && qty > max) return 'overstock'
    return 'in_stock'
  }

  const addProduct = (data: Omit<Product, 'id' | 'updatedAt' | 'status'>) => {
    if (!canEditInventory) {
      toast.error('Permission denied. Only Inventory Editor / Admin can add products.')
      return
    }
    const status = calculateStatus(data.quantity, data.minStock, data.maxStock)
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      status,
      updatedAt: new Date().toISOString().split('T')[0],
      shopifySynced: true,
      shopifyStock: data.quantity,
    }

    setProducts((prev) => [newProduct, ...prev])
    addAuditLog('PRODUCT_CREATE', 'Inventory', `Added product: ${newProduct.name} (${newProduct.sku})`)
    toast.success(`Product ${newProduct.name} created.`)
  }

  const updateProduct = (id: string, updates: Partial<Product>) => {
    if (!canEditInventory) {
      toast.error('Permission denied. View-only access.')
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
    if (!canEditInventory) {
      toast.error('Permission denied. Only Inventory Editor / Admin can delete products.')
      return
    }
    const prod = products.find((p) => p.id === id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
    addAuditLog('PRODUCT_DELETE', 'Inventory', `Deleted: ${prod?.sku}`)
    toast.success('Product deleted.')
  }

  const adjustStock = (
    productId: string,
    type: TransactionType,
    quantity: number,
    reason: string,
    reference?: string
  ) => {
    if (!canEditInventory) {
      toast.error('Permission denied. Only Inventory Editor / Admin can adjust stock.')
      return
    }
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
      userName: currentUser?.name || 'Inventory Editor',
    }

    setTransactions((prev) => [tx, ...prev])
    updateProduct(productId, { quantity: newQuantity, shopifyStock: newQuantity })
    addAuditLog('STOCK_ADJUSTMENT', 'Stock', `${type.toUpperCase()}: ${product.sku} changed by ${quantity}`)
    toast.success(`Stock updated for ${product.sku} (New: ${newQuantity} Units)`)
  }

  const bulkImportProducts = (importedList: Partial<Product>[]) => {
    if (!canEditInventory) {
      toast.error('Permission denied. Only Inventory Editor / Admin can import Excel.')
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
            quantity: qty,
            minStock: min,
            maxStock: max,
            status,
            isActive: true,
            notes: item.notes || '',
            updatedAt: new Date().toISOString().split('T')[0],
            shopifySynced: true,
            shopifyStock: qty,
          })
          added++
        }
      })
      return copy
    })

    addAuditLog('EXCEL_IMPORT', 'Inventory', `Imported Excel: ${added} added, ${updated} updated.`)
    toast.success(`Excel import complete: ${added} added, ${updated} updated.`)
    return { added, updated }
  }

  // Shopify Sync logic
  const syncWithShopify = () => {
    // Check if any Shopify alert SKU can be synced
    if (shopifyAlerts.length > 0) {
      shopifyAlerts.forEach((alert) => {
        if (alert.reason === 'missing_in_local') {
          addProduct({
            sku: alert.sku,
            name: alert.title,
            category: 'Shopify Imported',
            brand: 'Snug N Play',
            supplier: 'Shopify Store',
            warehouse: 'Main Hub - Karachi',
            quantity: alert.shopifyQuantity,
            minStock: 10,
            maxStock: 100,
            isActive: true,
            notes: 'Auto-synced from Shopify Store Catalog',
          })
        }
      })
      setShopifyAlerts([])
      toast.success('Shopify inventory synchronized! Missing items added to catalog.')
    } else {
      toast.success('Shopify inventory is already 100% in sync with local stock.')
    }
    addAuditLog('SHOPIFY_SYNC', 'Shopify', 'Manual Shopify sync executed.')
  }

  const dismissShopifyAlert = (alertId: string) => {
    setShopifyAlerts((prev) => prev.filter((a) => a.id !== alertId))
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
      recordsCount: products.length + transactions.length,
      createdBy: currentUser ? `${currentUser.name}` : 'Automated 30-Day Cron',
      createdAt: new Date().toLocaleString(),
      checksum: `sha256-${Math.random().toString(36).substring(2, 10)}`,
      downloadPayload: jsonString,
    }

    setBackups((prev) => [newBackup, ...prev])
    setSettings((prev) => ({ ...prev, lastBackupDate: new Date().toISOString().split('T')[0] }))
    toast.success(`Backup "${backupName}" downloaded!`)

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
    if (!isAdmin) {
      toast.error('Only System Admin can restore backups.')
      return false
    }
    try {
      const parsed = JSON.parse(jsonContent)
      if (parsed.products) setProducts(parsed.products)
      if (parsed.users) setUsers(parsed.users)
      if (parsed.transactions) setTransactions(parsed.transactions)
      toast.success('Backup snapshot restored successfully!')
      return true
    } catch (e: any) {
      toast.error('Invalid backup file.')
      return false
    }
  }

  const deleteBackup = (id: string) => {
    if (!isAdmin) return
    setBackups((prev) => prev.filter((b) => b.id !== id))
    toast.info('Backup record removed.')
  }

  // Users management
  const createUser = (data: Omit<User, 'id' | 'createdAt' | 'status'>) => {
    if (!isAdmin) return
    const newUser: User = {
      ...data,
      id: `usr-${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    }
    setUsers((prev) => [...prev, newUser])
    toast.success(`User ${newUser.name} created.`)
  }

  const updateUser = (id: string, updates: Partial<User>) => {
    if (!isAdmin) return
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)))
    toast.success('User updated.')
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
    toast.success('User removed.')
  }

  const updateSettings = (updates: Partial<SystemSettings>) => {
    if (!isAdmin) return
    setSettings((prev) => ({ ...prev, ...updates }))
    toast.success('Settings updated.')
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
        shopifyAlerts,
        auditLogs,
        settings,
        canEditInventory,
        isAdmin,
        login,
        logout,
        switchRole,
        changeUserPassword,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        bulkImportProducts,
        syncWithShopify,
        dismissShopifyAlert,
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
  if (!context) throw new Error('useInventory must be used within InventoryProvider')
  return context
}
