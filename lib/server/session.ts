import 'server-only'
import { and, eq, isNull } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { permissions, rolePermissions, roles, user } from '@/lib/db/schema'
import type { Permission } from '@/lib/rbac/catalog'
import { recordAudit, type AuditEntry } from './audit-core'

export class AuthorizationError extends Error {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }))

export const getCurrentUser = cache(async () => {
  const session = await getSession()
  if (!session?.user) return null

  const [row] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      mustChangePassword: user.mustChangePassword,
      notificationPrefs: user.notificationPrefs,
      themePreference: user.themePreference,
      roleId: user.roleId,
      roleKey: roles.key,
      roleName: roles.name,
    })
    .from(user)
    .leftJoin(roles, eq(roles.id, user.roleId))
    .where(and(eq(user.id, session.user.id), isNull(user.deletedAt)))
    .limit(1)

  if (!row || row.status !== 'active') return null

  const grants = row.roleId
    ? await db
        .select({ key: permissions.key })
        .from(rolePermissions)
        .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
        .where(eq(rolePermissions.roleId, row.roleId))
    : []

  return { ...row, sessionId: session.session.id, permissions: grants.map((g) => g.key as Permission) }
})

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>

export function hasPermission(current: Pick<CurrentUser, 'permissions'> | null, permission: Permission) {
  return !!current?.permissions.includes(permission)
}

/** For pages/layouts: redirects unauthenticated users to login and unauthorized users to /forbidden. */
export async function requirePageUser(permission?: Permission) {
  const current = await getCurrentUser()
  if (!current) redirect('/login')
  if (permission && !hasPermission(current, permission)) redirect('/forbidden')
  return current
}

/** For server actions and route handlers: throws instead of redirecting. */
export async function requirePermission(permission?: Permission) {
  const current = await getCurrentUser()
  if (!current) throw new AuthorizationError('Your session has expired. Please sign in again.')
  if (permission && !hasPermission(current, permission)) throw new AuthorizationError()
  return current
}

export async function getRequestMeta() {
  const h = await headers()
  return {
    ipAddress: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? null,
    userAgent: h.get('user-agent') ?? null,
  }
}

/** Audit helper that attaches the acting user and request metadata. */
export async function audit(
  actor: Pick<CurrentUser, 'id' | 'name' | 'email' | 'roleKey'> | null,
  entry: Omit<AuditEntry, 'userId' | 'userName' | 'userEmail' | 'roleKey' | 'ipAddress' | 'userAgent'>,
) {
  const meta = await getRequestMeta()
  await recordAudit({
    ...entry,
    userId: actor?.id ?? null,
    userName: actor?.name ?? 'System',
    userEmail: actor?.email ?? null,
    roleKey: actor?.roleKey ?? null,
    ...meta,
  })
}
