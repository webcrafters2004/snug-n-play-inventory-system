'use server'

import { hashPassword } from 'better-auth/crypto'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { db } from '@/lib/db'
import { account, passwordResetRequests, roles, user } from '@/lib/db/schema'
import { protectedAction, UserFacingError } from '@/lib/server/action'
import { notifyUsers } from '@/lib/server/notify'
import { audit } from '@/lib/server/session'

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  password: z.string().min(8).max(128),
  roleId: z.coerce.number().int().positive(),
})

export const createUser = protectedAction('users.create', createUserSchema, async (input, current) => {
  const email = input.email.toLowerCase()
  const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1)
  if (existing) throw new UserFacingError('A user with this email already exists.')

  const [role] = await db.select().from(roles).where(eq(roles.id, input.roleId)).limit(1)
  if (!role) throw new UserFacingError('Selected role does not exist.')

  const userId = randomUUID()
  const hash = await hashPassword(input.password)

  const [created] = await db
    .insert(user)
    .values({
      id: userId,
      name: input.name,
      email,
      emailVerified: true,
      roleId: role.id,
      status: 'active',
      mustChangePassword: true,
      createdBy: current.id,
      updatedBy: current.id,
    })
    .returning()

  await db.insert(account).values({ id: randomUUID(), accountId: userId, providerId: 'credential', userId, password: hash })

  await audit(current, {
    action: 'create',
    module: 'users',
    recordType: 'user',
    recordId: created.id,
    recordLabel: created.email,
    description: `${current.name} created user ${created.email} with role ${role.name}`,
    newValue: { name: created.name, email: created.email, roleKey: role.key },
  })

  revalidatePath('/users')
  return created
})

const updateUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  roleId: z.coerce.number().int().positive(),
})

export const updateUser = protectedAction('users.edit', updateUserSchema, async (input, current) => {
  const [existing] = await db.select().from(user).where(eq(user.id, input.id)).limit(1)
  if (!existing) throw new UserFacingError('User not found.')

  const email = input.email.toLowerCase()
  const [dupe] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1)
  if (dupe && dupe.id !== input.id) throw new UserFacingError('Another user already uses this email.')

  const [role] = await db.select().from(roles).where(eq(roles.id, input.roleId)).limit(1)
  if (!role) throw new UserFacingError('Selected role does not exist.')

  const [updated] = await db
    .update(user)
    .set({ name: input.name, email, roleId: role.id, updatedBy: current.id, updatedAt: new Date() })
    .where(eq(user.id, input.id))
    .returning()

  await audit(current, {
    action: 'update',
    module: 'users',
    recordType: 'user',
    recordId: updated.id,
    recordLabel: updated.email,
    description: `${current.name} updated user ${updated.email}`,
    previousValue: { name: existing.name, email: existing.email, roleId: existing.roleId },
    newValue: { name: updated.name, email: updated.email, roleId: updated.roleId },
  })

  revalidatePath('/users')
  return updated
})

export const setUserStatus = protectedAction(
  'users.edit',
  z.object({ id: z.string().min(1), status: z.enum(['active', 'disabled']) }),
  async ({ id, status }, current) => {
    if (id === current.id) throw new UserFacingError('You cannot change your own account status.')
    const [existing] = await db.select().from(user).where(eq(user.id, id)).limit(1)
    if (!existing) throw new UserFacingError('User not found.')

    const [updated] = await db.update(user).set({ status, updatedBy: current.id, updatedAt: new Date() }).where(eq(user.id, id)).returning()

    await audit(current, {
      action: status === 'active' ? 'enable' : 'disable',
      module: 'users',
      recordType: 'user',
      recordId: id,
      recordLabel: existing.email,
      description: `${current.name} ${status === 'active' ? 'enabled' : 'disabled'} user ${existing.email}`,
    })

    revalidatePath('/users')
    return updated
  },
)

export const deleteUser = protectedAction('users.delete', z.object({ id: z.string().min(1) }), async ({ id }, current) => {
  if (id === current.id) throw new UserFacingError('You cannot delete your own account.')
  const [existing] = await db.select().from(user).where(eq(user.id, id)).limit(1)
  if (!existing) throw new UserFacingError('User not found.')

  await db.update(user).set({ deletedAt: new Date(), status: 'disabled', updatedBy: current.id }).where(eq(user.id, id))

  await audit(current, {
    action: 'delete',
    module: 'users',
    recordType: 'user',
    recordId: id,
    recordLabel: existing.email,
    description: `${current.name} deleted user ${existing.email}`,
  })

  revalidatePath('/users')
  return { id }
})

const resetPasswordSchema = z.object({ id: z.string().min(1), newPassword: z.string().min(8).max(128) })

export const adminResetPassword = protectedAction('users.reset_password', resetPasswordSchema, async (input, current) => {
  const [existing] = await db.select().from(user).where(eq(user.id, input.id)).limit(1)
  if (!existing) throw new UserFacingError('User not found.')

  const hash = await hashPassword(input.newPassword)
  const [existingAccount] = await db.select().from(account).where(eq(account.userId, input.id)).limit(1)
  if (existingAccount) {
    await db.update(account).set({ password: hash, updatedAt: new Date() }).where(eq(account.id, existingAccount.id))
  } else {
    await db.insert(account).values({ id: randomUUID(), accountId: input.id, providerId: 'credential', userId: input.id, password: hash })
  }
  await db.update(user).set({ mustChangePassword: true }).where(eq(user.id, input.id))

  await audit(current, {
    action: 'reset_password',
    module: 'users',
    recordType: 'user',
    recordId: input.id,
    recordLabel: existing.email,
    description: `${current.name} reset the password for ${existing.email}`,
  })

  await notifyUsers([input.id], {
    type: 'security',
    title: 'Your password was reset',
    body: 'A System Admin reset your password. You will be asked to set a new one at next sign-in.',
    severity: 'warning',
  })

  revalidatePath('/users')
  return { ok: true }
})

const requestResetSchema = z.object({ email: z.email() })

export async function requestPasswordReset(raw: z.input<typeof requestResetSchema>) {
  const parsed = requestResetSchema.safeParse(raw)
  if (!parsed.success) return { ok: false as const, error: 'Enter a valid email address.' }
  const email = parsed.data.email.toLowerCase()

  const [foundUser] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1)
  const referenceCode = `PR-${Date.now().toString(36).toUpperCase()}`

  await db.insert(passwordResetRequests).values({ referenceCode, userId: foundUser?.id ?? null, email, status: 'pending' })

  await import('@/lib/server/audit-core').then(({ recordAudit }) =>
    recordAudit({
      action: 'password_reset_request',
      module: 'auth',
      description: `Password reset requested for ${email}`,
      userEmail: email,
      metadata: { referenceCode },
    }),
  )

  return { ok: true as const, referenceCode }
}

export const resolvePasswordResetRequest = protectedAction(
  'users.reset_password',
  z.object({ id: z.coerce.number().int().positive(), status: z.enum(['approved', 'rejected']), notes: z.string().max(500).optional() }),
  async (input, current) => {
    const [existing] = await db.select().from(passwordResetRequests).where(eq(passwordResetRequests.id, input.id)).limit(1)
    if (!existing) throw new UserFacingError('Request not found.')

    await db
      .update(passwordResetRequests)
      .set({ status: input.status, handledBy: current.id, handledAt: new Date(), notes: input.notes ?? null, updatedAt: new Date() })
      .where(eq(passwordResetRequests.id, input.id))

    await audit(current, {
      action: 'password_reset_request_resolved',
      module: 'users',
      recordType: 'password_reset_request',
      recordId: input.id,
      recordLabel: existing.email,
      description: `${current.name} marked reset request for ${existing.email} as ${input.status}`,
    })

    revalidatePath('/users')
    return { ok: true }
  },
)
