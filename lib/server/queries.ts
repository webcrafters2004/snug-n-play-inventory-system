import 'server-only'
import { and, asc, desc, eq, gt, ilike, isNull, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  auditLogs,
  backupReports,
  backups,
  brands,
  categories,
  inventoryTransactions,
  passwordResetRequests,
  permissions,
  products,
  roles,
  rolePermissions,
  stockAdjustments,
  suppliers,
  user,
  warehouses,
} from '@/lib/db/schema'

/* -------------------------------- Catalogs ------------------------------- */

export async function getCategories() {
  return db.select().from(categories).where(isNull(categories.archivedAt)).orderBy(asc(categories.name))
}
export async function getBrands() {
  return db.select().from(brands).where(isNull(brands.archivedAt)).orderBy(asc(brands.name))
}
export async function getSuppliers() {
  return db.select().from(suppliers).where(isNull(suppliers.archivedAt)).orderBy(asc(suppliers.name))
}
export async function getWarehouses() {
  return db.select().from(warehouses).where(isNull(warehouses.archivedAt)).orderBy(asc(warehouses.name))
}

/* -------------------------------- Products -------------------------------- */

export type ProductFilters = {
  search?: string
  categoryId?: number
  brandId?: number
  warehouseId?: number
  status?: string
  page?: number
  pageSize?: number
}

export async function getProductsPage(filters: ProductFilters) {
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20))

  const conditions = [isNull(products.archivedAt)]
  if (filters.search) {
    conditions.push(
      or(ilike(products.sku, `%${filters.search}%`), ilike(products.name, `%${filters.search}%`))!,
    )
  }
  if (filters.categoryId) conditions.push(eq(products.categoryId, filters.categoryId))
  if (filters.brandId) conditions.push(eq(products.brandId, filters.brandId))
  if (filters.warehouseId) conditions.push(eq(products.warehouseId, filters.warehouseId))
  if (filters.status) conditions.push(eq(products.status, filters.status))

  const where = and(...conditions)

  const [rows, [{ count }]] = await Promise.all([
    db
      .select({
        id: products.id,
        sku: products.sku,
        name: products.name,
        variant: products.variant,
        quantity: products.quantity,
        minStock: products.minStock,
        maxStock: products.maxStock,
        unitCost: products.unitCost,
        sellingPrice: products.sellingPrice,
        totalValue: products.totalValue,
        status: products.status,
        isActive: products.isActive,
        categoryName: categories.name,
        brandName: brands.name,
        supplierName: suppliers.name,
        warehouseName: warehouses.name,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .leftJoin(categories, eq(categories.id, products.categoryId))
      .leftJoin(brands, eq(brands.id, products.brandId))
      .leftJoin(suppliers, eq(suppliers.id, products.supplierId))
      .leftJoin(warehouses, eq(warehouses.id, products.warehouseId))
      .where(where)
      .orderBy(desc(products.updatedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ count: sql<number>`count(*)::int` }).from(products).where(where),
  ])

  return { rows, total: count, page, pageSize, totalPages: Math.max(1, Math.ceil(count / pageSize)) }
}

export async function getProductById(id: number) {
  const [row] = await db
    .select({
      product: products,
      categoryName: categories.name,
      brandName: brands.name,
      supplierName: suppliers.name,
      warehouseName: warehouses.name,
    })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(brands, eq(brands.id, products.brandId))
    .leftJoin(suppliers, eq(suppliers.id, products.supplierId))
    .leftJoin(warehouses, eq(warehouses.id, products.warehouseId))
    .where(eq(products.id, id))
    .limit(1)
  return row ?? null
}

export async function getStockHistory(productId: number, limit = 50) {
  return db
    .select()
    .from(inventoryTransactions)
    .where(eq(inventoryTransactions.productId, productId))
    .orderBy(desc(inventoryTransactions.createdAt))
    .limit(limit)
}

/* -------------------------------- Dashboard -------------------------------- */

export async function getDashboardStats() {
  const [[totals], [valueRow], [lowStock], [outOfStock], recentTx, recentAdjustments] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(products).where(isNull(products.archivedAt)),
    db
      .select({ total: sql<string>`coalesce(sum(${products.totalValue}), 0)` })
      .from(products)
      .where(isNull(products.archivedAt)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(and(isNull(products.archivedAt), eq(products.status, 'low_stock'))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(and(isNull(products.archivedAt), eq(products.status, 'out_of_stock'))),
    db
      .select({
        id: inventoryTransactions.id,
        productId: inventoryTransactions.productId,
        productName: products.name,
        sku: products.sku,
        type: inventoryTransactions.type,
        quantity: inventoryTransactions.quantity,
        createdAt: inventoryTransactions.createdAt,
      })
      .from(inventoryTransactions)
      .innerJoin(products, eq(products.id, inventoryTransactions.productId))
      .orderBy(desc(inventoryTransactions.createdAt))
      .limit(8),
    db
      .select({
        id: stockAdjustments.id,
        productId: stockAdjustments.productId,
        productName: products.name,
        adjustmentType: stockAdjustments.adjustmentType,
        quantity: stockAdjustments.quantity,
        reason: stockAdjustments.reason,
        createdAt: stockAdjustments.createdAt,
      })
      .from(stockAdjustments)
      .innerJoin(products, eq(products.id, stockAdjustments.productId))
      .orderBy(desc(stockAdjustments.createdAt))
      .limit(8),
  ])

  return {
    productCount: totals.count,
    totalStockValue: Number(valueRow.total),
    lowStockCount: lowStock.count,
    outOfStockCount: outOfStock.count,
    recentTransactions: recentTx,
    recentAdjustments,
  }
}

/* -------------------------------- Analytics -------------------------------- */

export async function getAnalytics() {
  const [byCategory, movement, fastMoving, lowStockList, outOfStockList, overstockList] = await Promise.all([
    db
      .select({
        category: sql<string>`coalesce(${categories.name}, 'Uncategorized')`,
        productCount: sql<number>`count(*)::int`,
        totalValue: sql<string>`coalesce(sum(${products.totalValue}), 0)`,
        totalQuantity: sql<number>`coalesce(sum(${products.quantity}), 0)::int`,
      })
      .from(products)
      .leftJoin(categories, eq(categories.id, products.categoryId))
      .where(isNull(products.archivedAt))
      .groupBy(categories.name)
      .orderBy(desc(sql`sum(${products.totalValue})`)),
    db
      .select({
        day: sql<string>`to_char(${inventoryTransactions.createdAt}, 'YYYY-MM-DD')`,
        type: inventoryTransactions.type,
        totalQuantity: sql<number>`sum(abs(${inventoryTransactions.quantity}))::int`,
      })
      .from(inventoryTransactions)
      .where(gt(inventoryTransactions.createdAt, sql`now() - interval '30 days'`))
      .groupBy(sql`to_char(${inventoryTransactions.createdAt}, 'YYYY-MM-DD')`, inventoryTransactions.type)
      .orderBy(asc(sql`to_char(${inventoryTransactions.createdAt}, 'YYYY-MM-DD')`)),
    db
      .select({
        productId: inventoryTransactions.productId,
        name: products.name,
        sku: products.sku,
        movements: sql<number>`count(*)::int`,
        totalQuantity: sql<number>`sum(abs(${inventoryTransactions.quantity}))::int`,
      })
      .from(inventoryTransactions)
      .innerJoin(products, eq(products.id, inventoryTransactions.productId))
      .where(gt(inventoryTransactions.createdAt, sql`now() - interval '30 days'`))
      .groupBy(inventoryTransactions.productId, products.name, products.sku)
      .orderBy(desc(sql`sum(abs(${inventoryTransactions.quantity}))`))
      .limit(10),
    db
      .select({ id: products.id, sku: products.sku, name: products.name, quantity: products.quantity, minStock: products.minStock })
      .from(products)
      .where(and(isNull(products.archivedAt), eq(products.status, 'low_stock')))
      .orderBy(asc(products.quantity))
      .limit(20),
    db
      .select({ id: products.id, sku: products.sku, name: products.name, quantity: products.quantity })
      .from(products)
      .where(and(isNull(products.archivedAt), eq(products.status, 'out_of_stock')))
      .limit(20),
    db
      .select({ id: products.id, sku: products.sku, name: products.name, quantity: products.quantity, maxStock: products.maxStock })
      .from(products)
      .where(and(isNull(products.archivedAt), eq(products.status, 'overstock')))
      .limit(20),
  ])

  return { byCategory, movement, fastMoving, lowStockList, outOfStockList, overstockList }
}

/* -------------------------------- Users / Roles -------------------------------- */

export async function getUsersList() {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      roleId: user.roleId,
      roleName: roles.name,
      roleKey: roles.key,
    })
    .from(user)
    .leftJoin(roles, eq(roles.id, user.roleId))
    .where(isNull(user.deletedAt))
    .orderBy(asc(user.name))
}

export async function getRolesWithPermissions() {
  const allRoles = await db.select().from(roles).orderBy(asc(roles.name))
  const allPermissions = await db.select().from(permissions).orderBy(asc(permissions.module), asc(permissions.key))
  const grants = await db
    .select({ roleId: rolePermissions.roleId, permissionKey: permissions.key })
    .from(rolePermissions)
    .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))

  const grantsByRole = new Map<number, Set<string>>()
  for (const g of grants) {
    if (!grantsByRole.has(g.roleId)) grantsByRole.set(g.roleId, new Set())
    grantsByRole.get(g.roleId)!.add(g.permissionKey)
  }

  return {
    roles: allRoles.map((r) => ({ ...r, permissionKeys: Array.from(grantsByRole.get(r.id) ?? []) })),
    permissions: allPermissions,
  }
}

export async function getPasswordResetRequests() {
  return db
    .select()
    .from(passwordResetRequests)
    .where(eq(passwordResetRequests.status, 'pending'))
    .orderBy(desc(passwordResetRequests.createdAt))
}

/* -------------------------------- Audit -------------------------------- */

export async function getAuditLogsPage(params: { page?: number; pageSize?: number; module?: string; search?: string }) {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 25))
  const conditions = []
  if (params.module) conditions.push(eq(auditLogs.module, params.module))
  if (params.search) {
    conditions.push(
      or(
        ilike(auditLogs.description, `%${params.search}%`),
        ilike(auditLogs.userEmail, `%${params.search}%`),
        ilike(auditLogs.action, `%${params.search}%`),
      )!,
    )
  }
  const where = conditions.length ? and(...conditions) : undefined

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(auditLogs)
      .where(where)
      .orderBy(desc(auditLogs.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ count: sql<number>`count(*)::int` }).from(auditLogs).where(where),
  ])

  return { rows, total: count, page, pageSize, totalPages: Math.max(1, Math.ceil(count / pageSize)) }
}

/* -------------------------------- Backups -------------------------------- */

export async function getBackupsList() {
  return db.select().from(backups).orderBy(desc(backups.createdAt)).limit(50)
}

export async function getBackupReports(backupId: string) {
  return db.select().from(backupReports).where(eq(backupReports.backupId, backupId))
}
