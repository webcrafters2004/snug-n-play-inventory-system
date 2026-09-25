import { sql } from 'drizzle-orm'
import {
  bigint,
  bigserial,
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

const tz = (name: string) => timestamp(name, { withTimezone: true })

/* ---------------- Better Auth tables (camelCase columns) ---------------- */

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: tz('createdAt').notNull().defaultNow(),
  updatedAt: tz('updatedAt').notNull().defaultNow(),
  roleId: integer('roleId'),
  status: text('status').notNull().default('active'),
  lastLoginAt: tz('lastLoginAt'),
  mustChangePassword: boolean('mustChangePassword').notNull().default(false),
  notificationPrefs: jsonb('notificationPrefs').$type<NotificationPrefs>().notNull().default({}),
  themePreference: text('themePreference').notNull().default('system'),
  deletedAt: tz('deletedAt'),
  createdBy: text('createdBy'),
  updatedBy: text('updatedBy'),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: tz('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: tz('createdAt').notNull().defaultNow(),
  updatedAt: tz('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: tz('accessTokenExpiresAt'),
  refreshTokenExpiresAt: tz('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: tz('createdAt').notNull().defaultNow(),
  updatedAt: tz('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: tz('expiresAt').notNull(),
  createdAt: tz('createdAt').notNull().defaultNow(),
  updatedAt: tz('updatedAt').notNull().defaultNow(),
})

/* ------------------------------- RBAC ------------------------------- */

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  isSystem: boolean('is_system').notNull().default(true),
  createdAt: tz('created_at').notNull().defaultNow(),
  updatedAt: tz('updated_at').notNull().defaultNow(),
})

export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  module: text('module').notNull(),
  description: text('description'),
  createdAt: tz('created_at').notNull().defaultNow(),
})

export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: integer('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: integer('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
    createdAt: tz('created_at').notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })],
)

/* ----------------------------- Catalog ----------------------------- */

const catalogColumns = {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  status: text('status').notNull().default('active'),
  createdAt: tz('created_at').notNull().defaultNow(),
  updatedAt: tz('updated_at').notNull().defaultNow(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  archivedAt: tz('archived_at'),
}

export const categories = pgTable('categories', { ...catalogColumns, description: text('description') })
export const brands = pgTable('brands', { ...catalogColumns, description: text('description') })
export const suppliers = pgTable('suppliers', {
  ...catalogColumns,
  contactName: text('contact_name'),
  email: text('email'),
  phone: text('phone'),
})
export const warehouses = pgTable('warehouses', {
  ...catalogColumns,
  code: text('code').unique(),
  address: text('address'),
})

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  sku: text('sku').notNull().unique(),
  name: text('name').notNull(),
  variant: text('variant'),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  brandId: integer('brand_id').references(() => brands.id, { onDelete: 'set null' }),
  supplierId: integer('supplier_id').references(() => suppliers.id, { onDelete: 'set null' }),
  warehouseId: integer('warehouse_id').references(() => warehouses.id, { onDelete: 'set null' }),
  quantity: integer('quantity').notNull().default(0),
  minStock: integer('min_stock').notNull().default(0),
  maxStock: integer('max_stock').notNull().default(0),
  unitCost: numeric('unit_cost', { precision: 12, scale: 2 }).notNull().default('0'),
  sellingPrice: numeric('selling_price', { precision: 12, scale: 2 }).notNull().default('0'),
  isActive: boolean('is_active').notNull().default(true),
  notes: text('notes'),
  totalValue: numeric('total_value', { precision: 14, scale: 2 }).generatedAlwaysAs(sql`quantity * unit_cost`),
  status: text('status').generatedAlwaysAs(
    sql`CASE WHEN NOT is_active THEN 'inactive' WHEN quantity <= 0 THEN 'out_of_stock' WHEN quantity <= min_stock THEN 'low_stock' WHEN max_stock > 0 AND quantity > max_stock THEN 'overstock' ELSE 'in_stock' END`,
  ),
  createdAt: tz('created_at').notNull().defaultNow(),
  updatedAt: tz('updated_at').notNull().defaultNow(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  archivedAt: tz('archived_at'),
})

/* ---------------------------- Inventory ops ---------------------------- */

export const importJobs = pgTable('import_jobs', {
  id: serial('id').primaryKey(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull().default(0),
  mode: text('mode').notNull(),
  status: text('status').notNull().default('processing'),
  totalRows: integer('total_rows').notNull().default(0),
  createdCount: integer('created_count').notNull().default(0),
  updatedCount: integer('updated_count').notNull().default(0),
  skippedCount: integer('skipped_count').notNull().default(0),
  errorCount: integer('error_count').notNull().default(0),
  columnMapping: jsonb('column_mapping').notNull().default({}),
  error: text('error'),
  createdBy: text('created_by'),
  createdAt: tz('created_at').notNull().defaultNow(),
  completedAt: tz('completed_at'),
})

export const importRows = pgTable('import_rows', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  importJobId: integer('import_job_id')
    .notNull()
    .references(() => importJobs.id, { onDelete: 'cascade' }),
  rowNumber: integer('row_number').notNull(),
  sku: text('sku'),
  action: text('action').notNull(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
  data: jsonb('data').notNull().default({}),
  changes: jsonb('changes'),
  errors: jsonb('errors'),
  createdAt: tz('created_at').notNull().defaultNow(),
})

export const inventoryTransactions = pgTable('inventory_transactions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  quantity: integer('quantity').notNull(),
  previousQuantity: integer('previous_quantity').notNull(),
  newQuantity: integer('new_quantity').notNull(),
  reason: text('reason'),
  reference: text('reference'),
  importJobId: integer('import_job_id').references(() => importJobs.id, { onDelete: 'set null' }),
  userId: text('user_id'),
  createdAt: tz('created_at').notNull().defaultNow(),
})

export const stockAdjustments = pgTable('stock_adjustments', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  transactionId: bigint('transaction_id', { mode: 'number' }).references(() => inventoryTransactions.id, {
    onDelete: 'set null',
  }),
  adjustmentType: text('adjustment_type').notNull(),
  quantity: integer('quantity').notNull(),
  reason: text('reason').notNull(),
  notes: text('notes'),
  status: text('status').notNull().default('applied'),
  createdBy: text('created_by'),
  createdAt: tz('created_at').notNull().defaultNow(),
})

export const exportJobs = pgTable('export_jobs', {
  id: serial('id').primaryKey(),
  format: text('format').notNull(),
  scope: text('scope').notNull(),
  filters: jsonb('filters').notNull().default({}),
  rowCount: integer('row_count').notNull().default(0),
  status: text('status').notNull().default('completed'),
  createdBy: text('created_by'),
  createdAt: tz('created_at').notNull().defaultNow(),
})

/* ------------------------------ Backups ------------------------------ */

export const backups = pgTable('backups', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  status: text('status').notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull().default(0),
  recordsIncluded: integer('records_included').notNull().default(0),
  storageProvider: text('storage_provider'),
  storageKey: text('storage_key'),
  checksum: text('checksum'),
  durationMs: integer('duration_ms'),
  error: text('error'),
  createdBy: text('created_by'),
  createdByName: text('created_by_name'),
  startedAt: tz('started_at').notNull().defaultNow(),
  completedAt: tz('completed_at'),
  createdAt: tz('created_at').notNull().defaultNow(),
})

export const backupReports = pgTable('backup_reports', {
  id: serial('id').primaryKey(),
  backupId: text('backup_id')
    .notNull()
    .references(() => backups.id, { onDelete: 'cascade' }),
  tableName: text('table_name').notNull(),
  recordCount: integer('record_count').notNull().default(0),
  createdAt: tz('created_at').notNull().defaultNow(),
})

/* --------------------------- System records --------------------------- */

export const auditLogs = pgTable('audit_logs', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: text('user_id'),
  userName: text('user_name'),
  userEmail: text('user_email'),
  roleKey: text('role_key'),
  action: text('action').notNull(),
  module: text('module').notNull(),
  recordType: text('record_type'),
  recordId: text('record_id'),
  recordLabel: text('record_label'),
  description: text('description').notNull(),
  previousValue: jsonb('previous_value'),
  newValue: jsonb('new_value'),
  metadata: jsonb('metadata'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: tz('created_at').notNull().defaultNow(),
})

export const notifications = pgTable('notifications', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  severity: text('severity').notNull().default('info'),
  title: text('title').notNull(),
  body: text('body'),
  link: text('link'),
  readAt: tz('read_at'),
  createdAt: tz('created_at').notNull().defaultNow(),
})

export const passwordResetRequests = pgTable('password_reset_requests', {
  id: serial('id').primaryKey(),
  referenceCode: text('reference_code').notNull().unique(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  status: text('status').notNull().default('pending'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  handledBy: text('handled_by'),
  handledAt: tz('handled_at'),
  notes: text('notes'),
  createdAt: tz('created_at').notNull().defaultNow(),
  updatedAt: tz('updated_at').notNull().defaultNow(),
})

export const systemSettings = pgTable('system_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  category: text('category').notNull(),
  updatedBy: text('updated_by'),
  updatedAt: tz('updated_at').notNull().defaultNow(),
})

export type NotificationPrefs = {
  lowStock?: boolean
  imports?: boolean
  exports?: boolean
  backups?: boolean
  security?: boolean
  email?: boolean
}

export type Product = typeof products.$inferSelect
export type Backup = typeof backups.$inferSelect
export type AuditLog = typeof auditLogs.$inferSelect
