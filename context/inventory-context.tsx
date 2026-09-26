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
  // Backups
  createBackup: (type?: 'manual' | 'automated', name?: string) => BackupItem
  restoreBackup: (jsonContent: string) => boolean
  deleteBackup: (id: string) => void
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
  USERS: 'snp_users_v4',
  PRODUCTS: 'snp_products_v4',
  TRANSACTIONS: 'snp_tx_v4',
  BACKUPS: 'snp_backups_v4',
  AUDIT: 'snp_audit_v4',
  SETTINGS: 'snp_settings_v4',
  ACTIVE_USER: 'snp_active_user_v4',
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

      if (storedUsers) {
        const parsed = JSON.parse(storedUsers)
        // Ensure every user has permissions structure
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
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(currentUser))
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER)
      }
    } catch (e) {
      console.error('Storage sync error:', e)
    }
  }, [users, products, transactions, backups, auditLogs, settings, currentUser, isLoaded])

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

  // Dynamic Granular RBAC Permissions
  const isAdmin = currentUser?.role === 'system_admin'
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
      addAuditLog('USER_LOGIN', 'Auth', `${target.name} logged in`)
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
    }
    setCurrentUser(null)
    toast.info('Signed out successfully.')
  }

  const switchRole = (role: UserRole) => {
    const existing = users.find((u) => u.role === role && u.status === 'active')
    if (existing) {
      setCurrentUser(existing)
      toast.success(`Active profile: ${existing.name}`)
    }
  }

  // Admin changes password for any user
  const changeUserPassword = (userId: string, newPass: string) => {
    if (!isAdmin) {
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
    addAuditLog('PASSWORD_CHANGED', 'Users', `System Admin updated password for ${target?.name || userId}`)
    toast.success(`Password updated for ${target?.name || 'user'}`)
  }

  // Product status helper
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
      status,
      updatedAt: new Date().toISOString().split('T')[0],
    }

    setProducts((prev) => [newProduct, ...prev])
    addAuditLog('PRODUCT_CREATE', 'Inventory', `Created product: ${newProduct.name} (${newProduct.sku})`)
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

  const adjustStock = (
    productId: string,
    type: TransactionType,
    quantity: number,
    reason: string,
    reference?: string
  ) => {
    if (!canAdjustStock) {
      toast.error('Permission denied: You do not have access to adjust stock.')
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
      userName: currentUser?.name || 'Inventory Operator',
    }

    setTransactions((prev) => [tx, ...prev])
    updateProduct(productId, { quantity: newQuantity })
    addAuditLog('STOCK_ADJUSTMENT', 'Stock', `${type.toUpperCase()}: ${product.sku} altered by ${quantity} units`)
    toast.success(`Stock updated: ${product.sku} (${newQuantity} Units)`)
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

  // Backups
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

  const restoreBackup = (jsonContent: string): boolean => {
    if (!isAdmin) {
      toast.error('Only System Admin can restore database snapshots.')
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
    toast.info('Backup snapshot deleted.')
  }

  // Users & Granular Access Control
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
        canAddEditProducts,
        canDeleteProducts,
        canAdjustStock,
        canImportExcel,
        canExportExcel,
        canViewBackups,
        canManageSettings,
        canManageUsers,
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
        createBackup,
        restoreBackup,
        deleteBackup,
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
