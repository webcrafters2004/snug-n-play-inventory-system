import 'server-only'
import { db } from '@/lib/db'
import { systemSettings } from '@/lib/db/schema'
import { DEFAULT_SETTINGS, type SettingsCategory, type SystemSettings } from '@/lib/settings-defaults'

export async function getSettings(): Promise<SystemSettings> {
  const rows = await db.select().from(systemSettings)
  const merged = structuredClone(DEFAULT_SETTINGS) as SystemSettings
  for (const row of rows) {
    const category = row.key as SettingsCategory
    if (category in merged) {
      Object.assign(merged[category], row.value as object)
    }
  }
  return merged
}

export async function saveSettingsCategory<C extends SettingsCategory>(
  category: C,
  value: SystemSettings[C],
  userId: string,
) {
  await db
    .insert(systemSettings)
    .values({ key: category, category, value, updatedBy: userId })
    .onConflictDoUpdate({
      target: systemSettings.key,
      set: { value, updatedBy: userId, updatedAt: new Date() },
    })
}
