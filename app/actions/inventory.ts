'use server'

import { and, eq, isNull, ne } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { brands, categories, inventoryTransactions, products, stockAdjustments, suppliers, warehouses } from '@/lib/db/schema'
import { notifyPermission } from '@/lib/server/notify'
import { audit, requirePermission } from '@/lib/server/session'
import { protectedAction, UserFacingError } from '@/lib/server/action'

const productSchema = z.object({
  sku: z.string().trim().min(2).max(40),
  name: z.string().trim().min(2).max(150),
  variant: z.string().trim().max(120).optional().nullable(),
  categoryId: z.coerce.number().int().positive().optional().nullable(),
  brandId: z.coerce.number().int().positive().optional().nullable(),
  supplierId: z.coerce.number().int().positive().optional().nullable(),
  warehouseId: z.coerce.number().int().positive().optional().nullable(),
  quantity: z.coerce.number().int().min(0).default(0),
  minStock: z.coerce.number().int().min(0).default(0),
  maxStock: z.coerce.number().int().min(0).default(0),
  unitCost: z.coerce.number().min(0).default(0),
  sellingPrice: z.coerce.number().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
  notes: z.string().trim().max(2000).optional().nullable(),
})

export const createProduct = protectedAction('inventory.create', productSchema, async (input, current) => {
  const [existing] = await db.select({ id: products.id }).from(products).where(eq(products.sku, input.sku)).limit(1)
  if (existing) throw new UserFacingError(`SKU "${input.sku}" already exists.`)

  const [created] = await db
    .insert(products)
    .values({
      ...input,
      unitCost: String(input.unitCost),
      sellingPrice: String(input.sellingPrice),
      createdBy: current.id,
      updatedBy: current.id,
    })
    .returning()

  if (input.quantity > 0) {
    await db.insert(inventoryTransactions).values({
      productId: created.id,
      type: 'initial',
      quantity: input.quantity,
      previousQuantity: 0,
      newQuantity: input.quantity,
      reason: 'Initial stock on product creation',
      userId: current.id,
    })
  }

  await audit(current, {
    action: 'create',
    module: 'inventory',
    recordType: 'product',
    recordId: created.id,
    recordLabel: created.name,
    description: `${current.name} created product ${created.sku} (${created.name})`,
    newValue: created,
  })

  revalidatePath('/inventory')
  revalidatePath('/')
  return created
})

export const updateProduct = protectedAction(
  'inventory.edit',
  productSchema.extend({ id: z.coerce.number().int().positive() }),
  async (input, current) => {
    const [existing] = await db.select().from(products).where(eq(products.id, input.id)).limit(1)
    if (!existing) throw new UserFacingError('Product not found.')

    const [dupe] = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.sku, input.sku), ne(products.id, input.id)))
      .limit(1)
    if (dupe) throw new UserFacingError(`SKU "${input.sku}" already exists.`)

    const { id, quantity, ...rest } = input
    const [updated] = await db
      .update(products)
      .set({
        ...rest,
        unitCost: String(input.unitCost),
        sellingPrice: String(input.sellingPrice),
        updatedBy: current.id,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning()

    await audit(current, {
      action: 'update',
      module: 'inventory',
      recordType: 'product',
      recordId: updated.id,
      recordLabel: updated.name,
      description: `${current.name} updated product ${updated.sku} (${updated.name})`,
      previousValue: existing,
      newValue: updated,
    })

    revalidatePath('/inventory')
    revalidatePath(`/inventory/${id}`)
    revalidatePath('/')
    return updated
  },
)

export const archiveProduct = protectedAction(
  'inventory.delete',
  z.object({ id: z.coerce.number().int().positive() }),
  async ({ id }, current) => {
    const [existing] = await db.select().from(products).where(eq(products.id, id)).limit(1)
    if (!existing) throw new UserFacingError('Product not found.')

    await db.update(products).set({ archivedAt: new Date(), isActive: false, updatedBy: current.id }).where(eq(products.id, id))

    await audit(current, {
      action: 'archive',
      module: 'inventory',
      recordType: 'product',
      recordId: id,
      recordLabel: existing.name,
      description: `${current.name} archived product ${existing.sku} (${existing.name})`,
      previousValue: existing,
    })

    revalidatePath('/inventory')
    revalidatePath('/')
    return { id }
  },
)

const adjustSchema = z.object({
  productId: z.coerce.number().int().positive(),
  adjustmentType: z.enum(['increase', 'decrease', 'set']),
  quantity: z.coerce.number().int().min(0),
  reason: z.string().trim().min(2).max(200),
  notes: z.string().trim().max(1000).optional().nullable(),
})

export const adjustStock = protectedAction('inventory.adjust', adjustSchema, async (input, current) => {
  const [product] = await db.select().from(products).where(eq(products.id, input.productId)).limit(1)
  if (!product) throw new UserFacingError('Product not found.')

  const previousQuantity = product.quantity
  let newQuantity = previousQuantity
  let delta = 0
  if (input.adjustmentType === 'increase') {
    delta = input.quantity
    newQuantity = previousQuantity + input.quantity
  } else if (input.adjustmentType === 'decrease') {
    delta = -input.quantity
    newQuantity = previousQuantity - input.quantity
    if (newQuantity < 0) throw new UserFacingError('Resulting stock cannot be negative.')
  } else {
    delta = input.quantity - previousQuantity
    newQuantity = input.quantity
  }

  const updated = await db.transaction(async (tx) => {
    const [product2] = await tx
      .update(products)
      .set({ quantity: newQuantity, updatedBy: current.id, updatedAt: new Date() })
      .where(eq(products.id, input.productId))
      .returning()

    const [tx1] = await tx
      .insert(inventoryTransactions)
      .values({
        productId: input.productId,
        type: 'adjustment',
        quantity: delta,
        previousQuantity,
        newQuantity,
        reason: input.reason,
        userId: current.id,
      })
      .returning()

    await tx.insert(stockAdjustments).values({
      productId: input.productId,
      transactionId: tx1.id,
      adjustmentType: input.adjustmentType,
      quantity: input.quantity,
      reason: input.reason,
      notes: input.notes ?? null,
      status: 'applied',
      createdBy: current.id,
    })

    return product2
  })

  await audit(current, {
    action: 'stock_adjustment',
    module: 'inventory',
    recordType: 'product',
    recordId: product.id,
    recordLabel: product.name,
    description: `${current.name} ${input.adjustmentType}d stock of ${product.sku} by ${Math.abs(delta)} (${input.reason})`,
    previousValue: { quantity: previousQuantity },
    newValue: { quantity: newQuantity },
    metadata: { adjustmentType: input.adjustmentType, reason: input.reason },
  })

  if (updated.status === 'low_stock' || updated.status === 'out_of_stock') {
    await notifyPermission('inventory.view', {
      type: 'low_stock',
      title: updated.status === 'out_of_stock' ? `${updated.name} is out of stock` : `${updated.name} is low on stock`,
      body: `Current quantity: ${updated.quantity} (min ${updated.minStock})`,
      link: `/inventory/${updated.id}`,
      severity: 'warning',
    })
  }

  revalidatePath(`/inventory/${input.productId}`)
  revalidatePath('/inventory')
  revalidatePath('/')
  return updated
})

const lookupSchema = z.object({
  type: z.enum(['category', 'brand', 'supplier', 'warehouse']),
  name: z.string().trim().min(1).max(100),
})

export const createLookup = protectedAction('inventory.create', lookupSchema, async ({ type, name }, current) => {
  const table = { category: categories, brand: brands, supplier: suppliers, warehouse: warehouses }[type]
  const [existing] = await db.select().from(table).where(eq(table.name, name)).limit(1)
  if (existing) return existing
  const [created] = await db.insert(table).values({ name, createdBy: current.id, updatedBy: current.id }).returning()
  revalidatePath('/inventory')
  return created
})

export async function requireInventoryView() {
  return requirePermission('inventory.view')
}
