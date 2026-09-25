// One-off seed script: RBAC catalog (roles/permissions) + a System Admin user.
// Run with: node --env-file-if-exists=.env.development.local scripts/seed.mjs
import { hashPassword } from 'better-auth/crypto'
import { randomUUID } from 'node:crypto'
import { Pool } from 'pg'

const PERMISSION_CATALOG = [
  { key: 'dashboard.view', module: 'Dashboard', description: 'View the dashboard overview' },
  { key: 'inventory.view', module: 'Inventory', description: 'View inventory items' },
  { key: 'inventory.create', module: 'Inventory', description: 'Create inventory items' },
  { key: 'inventory.edit', module: 'Inventory', description: 'Edit inventory items' },
  { key: 'inventory.delete', module: 'Inventory', description: 'Archive or delete inventory items' },
  { key: 'inventory.import', module: 'Inventory', description: 'Import inventory from Excel/CSV' },
  { key: 'inventory.export', module: 'Inventory', description: 'Export inventory to Excel/CSV' },
  { key: 'inventory.adjust', module: 'Inventory', description: 'Perform stock adjustments' },
  { key: 'inventory.view_cost', module: 'Inventory', description: 'View unit cost and inventory value' },
  { key: 'analytics.view', module: 'Analytics', description: 'View insights & analytics' },
  { key: 'reports.view', module: 'Reports', description: 'View reports' },
  { key: 'backup.view', module: 'Backups', description: 'View backups and backup reports' },
  { key: 'backup.create', module: 'Backups', description: 'Create manual backups' },
  { key: 'backup.export', module: 'Backups', description: 'Download/export backup files' },
  { key: 'backup.restore', module: 'Backups', description: 'Restore inventory from a backup' },
  { key: 'users.view', module: 'Users', description: 'View users' },
  { key: 'users.create', module: 'Users', description: 'Create users' },
  { key: 'users.edit', module: 'Users', description: 'Edit users and enable/disable accounts' },
  { key: 'users.delete', module: 'Users', description: 'Delete users' },
  { key: 'users.manage_roles', module: 'Users', description: 'Assign roles and change role permissions' },
  { key: 'users.reset_password', module: 'Users', description: 'Reset passwords and handle reset requests' },
  { key: 'audit.view', module: 'Audit', description: 'View audit logs' },
  { key: 'settings.view', module: 'Settings', description: 'View system settings' },
  { key: 'settings.manage', module: 'Settings', description: 'Change system settings' },
]

const DEFAULT_ROLES = [
  { key: 'system_admin', name: 'System Admin', description: 'Full system access, including users, security, backups and settings.', permissions: 'all' },
  {
    key: 'accounts',
    name: 'Accounts',
    description: 'Financial visibility: inventory value, costs, reports and exports.',
    permissions: ['dashboard.view', 'inventory.view', 'inventory.export', 'inventory.view_cost', 'analytics.view', 'reports.view', 'backup.view'],
  },
  {
    key: 'operations',
    name: 'Operations',
    description: 'Day-to-day inventory operations, adjustments and Excel workflows.',
    permissions: ['dashboard.view', 'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.adjust', 'inventory.import', 'inventory.export'],
  },
  {
    key: 'manager',
    name: 'Manager',
    description: 'Management oversight: dashboard, analytics, insights, reports and inventory.',
    permissions: ['dashboard.view', 'inventory.view', 'inventory.edit', 'inventory.adjust', 'inventory.export', 'inventory.view_cost', 'analytics.view', 'reports.view', 'backup.view'],
  },
]

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@snugnplay.com'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!'
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? 'System Admin'

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  for (const p of PERMISSION_CATALOG) {
    await pool.query(
      `INSERT INTO permissions (key, module, description) VALUES ($1, $2, $3)
       ON CONFLICT (key) DO UPDATE SET module = $2, description = $3`,
      [p.key, p.module, p.description],
    )
  }
  console.log(`[seed] upserted ${PERMISSION_CATALOG.length} permissions`)

  const roleIdByKey = {}
  for (const r of DEFAULT_ROLES) {
    const { rows } = await pool.query(
      `INSERT INTO roles (key, name, description, is_system) VALUES ($1, $2, $3, true)
       ON CONFLICT (key) DO UPDATE SET name = $2, description = $3
       RETURNING id`,
      [r.key, r.name, r.description],
    )
    roleIdByKey[r.key] = rows[0].id
  }
  console.log(`[seed] upserted ${DEFAULT_ROLES.length} roles`)

  const { rows: allPerms } = await pool.query(`SELECT id, key FROM permissions`)
  const permIdByKey = Object.fromEntries(allPerms.map((p) => [p.key, p.id]))

  for (const r of DEFAULT_ROLES) {
    const roleId = roleIdByKey[r.key]
    const keys = r.permissions === 'all' ? PERMISSION_CATALOG.map((p) => p.key) : r.permissions
    for (const key of keys) {
      const permId = permIdByKey[key]
      if (!permId) continue
      await pool.query(
        `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [roleId, permId],
      )
    }
  }
  console.log('[seed] upserted role_permissions')

  const { rows: existing } = await pool.query(`SELECT id FROM "user" WHERE email = $1`, [ADMIN_EMAIL.toLowerCase()])
  if (existing.length === 0) {
    const userId = randomUUID()
    const hash = await hashPassword(ADMIN_PASSWORD)
    await pool.query(
      `INSERT INTO "user" (id, name, email, "emailVerified", "roleId", status)
       VALUES ($1, $2, $3, true, $4, 'active')`,
      [userId, ADMIN_NAME, ADMIN_EMAIL.toLowerCase(), roleIdByKey.system_admin],
    )
    await pool.query(
      `INSERT INTO account (id, "accountId", "providerId", "userId", password)
       VALUES ($1, $2, 'credential', $3, $4)`,
      [randomUUID(), userId, userId, hash],
    )
    console.log(`[seed] created System Admin user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
  } else {
    console.log(`[seed] System Admin user already exists: ${ADMIN_EMAIL}`)
  }

  await pool.end()
}

main().catch((err) => {
  console.error('[seed] failed', err)
  process.exit(1)
})
