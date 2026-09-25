/**
 * Permission catalog. Used to seed the `permissions` table and as the type
 * source for permission checks. Runtime grants are read from the database
 * (`role_permissions`), so role access can be changed without a deploy.
 */
export const PERMISSION_CATALOG = [
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
] as const

export type Permission = (typeof PERMISSION_CATALOG)[number]['key']

export const ROLE_KEYS = ['system_admin', 'accounts', 'operations', 'manager'] as const
export type RoleKey = (typeof ROLE_KEYS)[number]

export const DEFAULT_ROLES: {
  key: RoleKey
  name: string
  description: string
  permissions: Permission[] | 'all'
}[] = [
  {
    key: 'system_admin',
    name: 'System Admin',
    description: 'Full system access, including users, security, backups and settings.',
    permissions: 'all',
  },
  {
    key: 'accounts',
    name: 'Accounts',
    description: 'Financial visibility: inventory value, costs, reports and exports.',
    permissions: [
      'dashboard.view',
      'inventory.view',
      'inventory.export',
      'inventory.view_cost',
      'analytics.view',
      'reports.view',
      'backup.view',
    ],
  },
  {
    key: 'operations',
    name: 'Operations',
    description: 'Day-to-day inventory operations, adjustments and Excel workflows.',
    permissions: [
      'dashboard.view',
      'inventory.view',
      'inventory.create',
      'inventory.edit',
      'inventory.adjust',
      'inventory.import',
      'inventory.export',
    ],
  },
  {
    key: 'manager',
    name: 'Manager',
    description: 'Management oversight: dashboard, analytics, insights, reports and inventory.',
    permissions: [
      'dashboard.view',
      'inventory.view',
      'inventory.edit',
      'inventory.adjust',
      'inventory.export',
      'inventory.view_cost',
      'analytics.view',
      'reports.view',
      'backup.view',
    ],
  },
]
