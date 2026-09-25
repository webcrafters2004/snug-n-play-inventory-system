import 'server-only'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { notifications, permissions, rolePermissions, user, type NotificationPrefs } from '@/lib/db/schema'
import type { Permission } from '@/lib/rbac/catalog'
import { sendEmail } from './email'
import { getSettings } from './settings'

export type NotificationType = 'low_stock' | 'import' | 'export' | 'backup' | 'password_reset' | 'security' | 'system'

const PREF_BY_TYPE: Partial<Record<NotificationType, keyof NotificationPrefs>> = {
  low_stock: 'lowStock',
  import: 'imports',
  export: 'exports',
  backup: 'backups',
  password_reset: 'security',
  security: 'security',
}

const SETTING_BY_TYPE = {
  low_stock: 'lowStockAlerts',
  import: 'importAlerts',
  export: 'exportAlerts',
  backup: 'backupAlerts',
  password_reset: 'securityAlerts',
  security: 'securityAlerts',
} as const

type Payload = {
  type: NotificationType
  title: string
  body?: string
  link?: string
  severity?: 'info' | 'success' | 'warning' | 'error'
  email?: boolean
}

async function deliver(recipients: { id: string; email: string; notificationPrefs: NotificationPrefs }[], payload: Payload) {
  const settings = await getSettings()
  const settingKey = SETTING_BY_TYPE[payload.type as keyof typeof SETTING_BY_TYPE]
  if (settingKey && !settings.notifications[settingKey]) return

  const prefKey = PREF_BY_TYPE[payload.type]
  const targets = recipients.filter((r) => !prefKey || r.notificationPrefs?.[prefKey] !== false)
  if (targets.length === 0) return

  await db.insert(notifications).values(
    targets.map((t) => ({
      userId: t.id,
      type: payload.type,
      severity: payload.severity ?? 'info',
      title: payload.title,
      body: payload.body ?? null,
      link: payload.link ?? null,
    })),
  )

  if (payload.email) {
    const emailTargets = targets.filter((t) => t.notificationPrefs?.email !== false).map((t) => t.email)
    if (emailTargets.length) {
      await sendEmail({ to: emailTargets, subject: payload.title, text: payload.body ?? payload.title })
    }
  }
}

/** Notify every active user whose role grants the permission. */
export async function notifyPermission(permission: Permission, payload: Payload) {
  try {
    const recipients = await db
      .selectDistinct({ id: user.id, email: user.email, notificationPrefs: user.notificationPrefs })
      .from(user)
      .innerJoin(rolePermissions, eq(rolePermissions.roleId, user.roleId))
      .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
      .where(and(eq(permissions.key, permission), eq(user.status, 'active'), isNull(user.deletedAt)))
    await deliver(recipients, payload)
  } catch (error) {
    console.error('[notify] failed', (error as Error).message)
  }
}

export async function notifyUsers(userIds: string[], payload: Payload) {
  if (userIds.length === 0) return
  try {
    const recipients = await db
      .select({ id: user.id, email: user.email, notificationPrefs: user.notificationPrefs })
      .from(user)
      .where(and(inArray(user.id, userIds), isNull(user.deletedAt)))
    await deliver(recipients, payload)
  } catch (error) {
    console.error('[notify] failed', (error as Error).message)
  }
}
