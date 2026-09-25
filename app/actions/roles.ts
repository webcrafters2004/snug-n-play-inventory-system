'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { permissions, rolePermissions, roles } from '@/lib/db/schema'
import { protectedAction, UserFacingError } from '@/lib/server/action'
import { audit } from '@/lib/server/session'

const updateSchema = z.object({
  roleId: z.coerce.number().int().positive(),
  permissionKeys: z.array(z.string()),
})

export const updateRolePermissions = protectedAction('users.manage_roles', updateSchema, async (input, current) => {
  const [role] = await db.select().from(roles).where(eq(roles.id, input.roleId)).limit(1)
  if (!role) throw new UserFacingError('Role not found.')
  if (role.key === 'system_admin') throw new UserFacingError('System Admin permissions cannot be changed.')

  const allPermissions = await db.select().from(permissions)
  const keySet = new Set(input.permissionKeys)
  const idsToGrant = allPermissions.filter((p) => keySet.has(p.key)).map((p) => p.id)

  await db.transaction(async (tx) => {
    await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, input.roleId))
    if (idsToGrant.length) {
      await tx.insert(rolePermissions).values(idsToGrant.map((permissionId) => ({ roleId: input.roleId, permissionId })))
    }
  })

  await audit(current, {
    action: 'update_permissions',
    module: 'users',
    recordType: 'role',
    recordId: role.id,
    recordLabel: role.name,
    description: `${current.name} updated permissions for role ${role.name}`,
    newValue: { permissionKeys: Array.from(keySet) },
  })

  revalidatePath('/roles')
  revalidatePath('/users')
  return { ok: true }
})
