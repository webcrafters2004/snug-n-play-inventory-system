'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  backupReports,
  backups,
  brands,
  categories,
  inventoryTransactions,
  products,
  roles,
  stockAdjustments,
  suppliers,
  warehouses,
} from '@/lib/db/schema'
import { protectedAction, UserFacingError } from '@/lib/server/action'
import { getStorage } from '@/lib/server/storage'
import { notifyPermission } from '@/lib/server/notify'
import { getSettings } from '@/lib/server/settings'
import { audit, type CurrentUser } from '@/lib/server/session'

const BACKUP_TABLES = {
  categories,
  brands,
  suppliers,
  warehouses,
  products,
  roles,
  inventory_transactions: inventoryTransactions,
  stock_adjustments: stockAdjustments,
} as const

export async function runBackup(actor: CurrentUser | null, type: 'manual' | 'scheduled') {
  const backupId = randomUUID()
  const startedAt = new Date()

  await db.insert(backups).values({
    id: backupId,
    type,
    status: 'running',
    createdBy: actor?.id ?? null,
    createdByName: actor?.name ?? 'System',
    startedAt,
  })

  try {
    const dump: Record<string, unknown[]> = {}
    let totalRecords = 0
    for (const [name, table] of Object.entries(BACKUP_TABLES)) {
      const rows = await db.select().from(table as never)
      dump[name] = rows
      totalRecords += rows.length
    }

    const payload = JSON.stringify({ backupId, createdAt: startedAt.toISOString(), tables: dump }, null, 2)
    const buffer = Buffer.from(payload, 'utf-8')
    const storage = getStorage()
    const { key, size } = await storage.put(`backups/${backupId}.json`, buffer, 'application/json')

    const completedAt = new Date()
    await db
      .update(backups)
      .set({
        status: 'completed',
        sizeBytes: size,
        recordsIncluded: totalRecords,
        storageProvider: storage.name,
        storageKey: key,
        durationMs: completedAt.getTime() - startedAt.getTime(),
        completedAt,
      })
      .where(eq(backups.id, backupId))

    for (const [name, rows] of Object.entries(dump)) {
      await db.insert(backupReports).values({ backupId, tableName: name, recordCount: rows.length })
    }

    await audit(actor, {
      action: 'create',
      module: 'backup',
      recordType: 'backup',
      recordId: backupId,
      recordLabel: backupId,
      description: `${actor?.name ?? 'System'} created a ${type} backup (${totalRecords} records)`,
    })

    const settings = await getSettings()
    if (settings.backup.notifyOnSuccess) {
      await notifyPermission('backup.view', {
        type: 'backup',
        title: 'Backup completed',
        body: `${type === 'manual' ? 'Manual' : 'Scheduled'} backup finished with ${totalRecords} records.`,
        severity: 'success',
      })
    }

    return { id: backupId, status: 'completed' as const, recordsIncluded: totalRecords }
  } catch (error) {
    const completedAt = new Date()
    await db
      .update(backups)
      .set({ status: 'failed', error: (error as Error).message, durationMs: completedAt.getTime() - startedAt.getTime(), completedAt })
      .where(eq(backups.id, backupId))

    await audit(actor, {
      action: 'backup_failed',
      module: 'backup',
      recordType: 'backup',
      recordId: backupId,
      description: `Backup ${backupId} failed: ${(error as Error).message}`,
    })

    const settings = await getSettings()
    if (settings.backup.notifyOnFailure) {
      await notifyPermission('backup.view', {
        type: 'backup',
        title: 'Backup failed',
        body: (error as Error).message,
        severity: 'error',
      })
    }

    throw error
  }
}

export const createManualBackup = protectedAction('backup.create', z.object({}).optional(), async (_input, current) => {
  const result = await runBackup(current, 'manual')
  revalidatePath('/backups')
  return result
})

export const restoreFromBackup = protectedAction('backup.restore', z.object({ backupId: z.string().min(1) }), async ({ backupId }, current) => {
  const [backup] = await db.select().from(backups).where(eq(backups.id, backupId)).limit(1)
  if (!backup || backup.status !== 'completed' || !backup.storageKey) throw new UserFacingError('This backup cannot be restored.')

  const storage = getStorage()
  const file = await storage.get(backup.storageKey)
  if (!file) throw new UserFacingError('Backup file could not be found in storage.')

  const chunks: Uint8Array[] = []
  for await (const chunk of file.stream as unknown as AsyncIterable<Uint8Array>) chunks.push(chunk)
  const json = JSON.parse(Buffer.concat(chunks).toString('utf-8')) as { tables: Record<string, Record<string, unknown>[]> }

  await db.transaction(async (tx) => {
    if (json.tables.products) {
      for (const row of json.tables.products) {
        await tx
          .update(products)
          .set({ quantity: row.quantity as number })
          .where(eq(products.id, row.id as number))
      }
    }
  })

  await audit(current, {
    action: 'restore',
    module: 'backup',
    recordType: 'backup',
    recordId: backupId,
    description: `${current.name} restored inventory quantities from backup ${backupId}`,
  })

  revalidatePath('/inventory')
  revalidatePath('/backups')
  return { ok: true }
})
