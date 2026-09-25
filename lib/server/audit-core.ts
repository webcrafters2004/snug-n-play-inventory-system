import 'server-only'
import { db, type Tx } from '@/lib/db'
import { auditLogs } from '@/lib/db/schema'

export type AuditEntry = {
  action: string
  module: string
  description: string
  userId?: string | null
  userName?: string | null
  userEmail?: string | null
  roleKey?: string | null
  recordType?: string | null
  recordId?: string | number | null
  recordLabel?: string | null
  previousValue?: unknown
  newValue?: unknown
  metadata?: Record<string, unknown> | null
  ipAddress?: string | null
  userAgent?: string | null
}

const SENSITIVE_KEYS = /password|secret|token|hash/i

function scrub(value: unknown): unknown {
  if (value === null || value === undefined) return null
  if (Array.isArray(value)) return value.map(scrub)
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !SENSITIVE_KEYS.test(key))
        .map(([key, v]) => [key, scrub(v)]),
    )
  }
  return value
}

/** Low-level audit writer. Never throws, so auditing cannot break a user flow. */
export async function recordAudit(entry: AuditEntry, tx?: Tx) {
  try {
    await (tx ?? db).insert(auditLogs).values({
      action: entry.action,
      module: entry.module,
      description: entry.description,
      userId: entry.userId ?? null,
      userName: entry.userName ?? null,
      userEmail: entry.userEmail ?? null,
      roleKey: entry.roleKey ?? null,
      recordType: entry.recordType ?? null,
      recordId: entry.recordId === undefined || entry.recordId === null ? null : String(entry.recordId),
      recordLabel: entry.recordLabel ?? null,
      previousValue: scrub(entry.previousValue),
      newValue: scrub(entry.newValue),
      metadata: (scrub(entry.metadata) as Record<string, unknown> | null) ?? null,
      ipAddress: entry.ipAddress ?? null,
      userAgent: entry.userAgent?.slice(0, 400) ?? null,
    })
  } catch (error) {
    if (tx) throw error
    console.error('[audit] failed to record entry', entry.action, (error as Error).message)
  }
}
