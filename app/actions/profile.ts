'use server'

import { hashPassword, verifyPassword } from 'better-auth/crypto'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { account, user, type NotificationPrefs } from '@/lib/db/schema'
import { protectedAction, UserFacingError } from '@/lib/server/action'
import { getStorage } from '@/lib/server/storage'
import { audit } from '@/lib/server/session'

export const updateProfile = protectedAction(
  null,
  z.object({ name: z.string().trim().min(2).max(100) }),
  async ({ name }, current) => {
    await db.update(user).set({ name, updatedAt: new Date() }).where(eq(user.id, current.id))
    await audit(current, { action: 'update_profile', module: 'profile', description: `${current.name} updated their profile name` })
    revalidatePath('/profile')
    return { name }
  },
)

export const changePassword = protectedAction(
  null,
  z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8).max(128) }),
  async ({ currentPassword, newPassword }, current) => {
    const [existingAccount] = await db.select().from(account).where(eq(account.userId, current.id)).limit(1)
    if (!existingAccount?.password) throw new UserFacingError('No password is set for this account.')

    const valid = await verifyPassword({ hash: existingAccount.password, password: currentPassword })
    if (!valid) throw new UserFacingError('Current password is incorrect.')

    const hash = await hashPassword(newPassword)
    await db.update(account).set({ password: hash, updatedAt: new Date() }).where(eq(account.id, existingAccount.id))
    await db.update(user).set({ mustChangePassword: false }).where(eq(user.id, current.id))

    await audit(current, { action: 'change_password', module: 'profile', description: `${current.name} changed their password` })
    return { ok: true }
  },
)

export const updateNotificationPrefs = protectedAction(
  null,
  z.object({
    lowStock: z.boolean(),
    imports: z.boolean(),
    exports: z.boolean(),
    backups: z.boolean(),
    security: z.boolean(),
    email: z.boolean(),
  }),
  async (prefs, current) => {
    await db
      .update(user)
      .set({ notificationPrefs: prefs as NotificationPrefs, updatedAt: new Date() })
      .where(eq(user.id, current.id))
    revalidatePath('/profile')
    return prefs
  },
)

export const updateThemePreference = protectedAction(
  null,
  z.object({ theme: z.enum(['light', 'dark', 'system']) }),
  async ({ theme }, current) => {
    await db.update(user).set({ themePreference: theme, updatedAt: new Date() }).where(eq(user.id, current.id))
    revalidatePath('/profile')
    return { theme }
  },
)

export const uploadAvatar = protectedAction(
  null,
  z.object({ dataUrl: z.string().startsWith('data:image/'), contentType: z.string() }),
  async ({ dataUrl, contentType }, current) => {
    const base64 = dataUrl.split(',')[1]
    if (!base64) throw new UserFacingError('Invalid image data.')
    const buffer = Buffer.from(base64, 'base64')
    if (buffer.length > 3 * 1024 * 1024) throw new UserFacingError('Image must be smaller than 3MB.')

    const storage = getStorage()
    const ext = contentType.split('/')[1] ?? 'png'
    const { key } = await storage.put(`avatars/${current.id}-${Date.now()}.${ext}`, buffer, contentType)

    await db.update(user).set({ image: `/api/files/${encodeURIComponent(key)}`, updatedAt: new Date() }).where(eq(user.id, current.id))

    await audit(current, { action: 'update_avatar', module: 'profile', description: `${current.name} updated their avatar` })
    revalidatePath('/profile')
    return { image: `/api/files/${encodeURIComponent(key)}` }
  },
)
