import { z } from 'zod'

export const settingsSchemas = {
  general: z.object({
    companyName: z.string().trim().min(2).max(80),
    logoPath: z.string().max(300).nullable(),
    currency: z.string().trim().length(3).toUpperCase(),
    timezone: z.string().trim().min(2).max(60),
    dateFormat: z.enum(['dd MMM yyyy', 'MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd']),
  }),
  inventory: z.object({
    lowStockThreshold: z.coerce.number().int().min(0).max(100000),
    allowNegativeStock: z.boolean(),
    skuPattern: z.string().trim().min(1).max(120),
    maxImportRows: z.coerce.number().int().min(100).max(20000),
  }),
  backup: z.object({
    autoEnabled: z.boolean(),
    intervalDays: z.coerce.number().int().min(1).max(365),
    retentionCount: z.coerce.number().int().min(1).max(500),
    notifyOnSuccess: z.boolean(),
    notifyOnFailure: z.boolean(),
  }),
  notifications: z.object({
    lowStockAlerts: z.boolean(),
    importAlerts: z.boolean(),
    exportAlerts: z.boolean(),
    backupAlerts: z.boolean(),
    securityAlerts: z.boolean(),
  }),
  email: z.object({
    enabled: z.boolean(),
    fromName: z.string().trim().min(1).max(80),
    adminAlertEmail: z.email().or(z.literal('')),
  }),
  security: z.object({
    minPasswordLength: z.coerce.number().int().min(8).max(64),
    requireSymbols: z.boolean(),
    forcePasswordChangeOnReset: z.boolean(),
  }),
  appearance: z.object({
    defaultTheme: z.enum(['light', 'dark', 'system']),
    compactTables: z.boolean(),
  }),
} as const

export type SettingsCategory = keyof typeof settingsSchemas
export type SystemSettings = { [K in SettingsCategory]: z.infer<(typeof settingsSchemas)[K]> }

export const DEFAULT_SETTINGS: SystemSettings = {
  general: {
    companyName: 'Snug N Play',
    logoPath: null,
    currency: 'PKR',
    timezone: 'Asia/Karachi',
    dateFormat: 'dd MMM yyyy',
  },
  inventory: {
    lowStockThreshold: 10,
    allowNegativeStock: false,
    skuPattern: '^[A-Z0-9][A-Z0-9-_]{2,39}$',
    maxImportRows: 5000,
  },
  backup: {
    autoEnabled: true,
    intervalDays: 30,
    retentionCount: 24,
    notifyOnSuccess: true,
    notifyOnFailure: true,
  },
  notifications: {
    lowStockAlerts: true,
    importAlerts: true,
    exportAlerts: true,
    backupAlerts: true,
    securityAlerts: true,
  },
  email: {
    enabled: false,
    fromName: 'Snug N Play Inventory',
    adminAlertEmail: 'amankamran2004@outlook.com',
  },
  security: {
    minPasswordLength: 10,
    requireSymbols: false,
    forcePasswordChangeOnReset: true,
  },
  appearance: {
    defaultTheme: 'system',
    compactTables: false,
  },
}

export function passwordSchema(policy: SystemSettings['security']) {
  let schema = z
    .string()
    .min(policy.minPasswordLength, `Use at least ${policy.minPasswordLength} characters.`)
    .max(128)
    .regex(/[a-z]/, 'Include a lowercase letter.')
    .regex(/[A-Z]/, 'Include an uppercase letter.')
    .regex(/[0-9]/, 'Include a number.')
  if (policy.requireSymbols) schema = schema.regex(/[^A-Za-z0-9]/, 'Include a symbol.')
  return schema
}
