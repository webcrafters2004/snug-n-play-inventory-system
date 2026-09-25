'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { settingsSchemas, type SettingsCategory } from '@/lib/settings-defaults'
import { protectedAction, UserFacingError } from '@/lib/server/action'
import { saveSettingsCategory } from '@/lib/server/settings'
import { audit } from '@/lib/server/session'

const categories = Object.keys(settingsSchemas) as SettingsCategory[]

const wrapperSchema = z.object({
  category: z.enum(categories as [SettingsCategory, ...SettingsCategory[]]),
  values: z.record(z.string(), z.any()),
})

export const saveSettings = protectedAction('settings.manage', wrapperSchema, async ({ category, values }, current) => {
  const schema = settingsSchemas[category]
  const parsed = schema.safeParse(values)
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error)
    throw new UserFacingError(flat.formErrors[0] ?? 'Invalid settings.')
  }

  await saveSettingsCategory(category, parsed.data as never, current.id)

  await audit(current, {
    action: 'update_settings',
    module: 'settings',
    recordType: 'settings',
    recordId: category,
    recordLabel: category,
    description: `${current.name} updated ${category} settings`,
    newValue: parsed.data,
  })

  revalidatePath('/settings')
  return parsed.data
})
