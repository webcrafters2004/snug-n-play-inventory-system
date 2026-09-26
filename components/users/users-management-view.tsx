'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { User, UserRole, UserPermissions } from '@/lib/types'
import { ROLE_DEFAULT_PERMISSIONS } from '@/lib/initial-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Users2,
  UserPlus,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Edit2,
  Trash2,
  Power,
  Lock,
  SlidersHorizontal,
} from 'lucide-react'

export function UsersManagementView() {
  const {
    users,
    currentUser,
    createUser,
    updateUser,
    updateUserPermissions,
    deleteUser,
    toggleUserStatus,
    changeUserPassword,
  } = useInventory()

  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('password123')
  const [role, setRole] = useState<UserRole>('inventory_editor')

  // Change Password Modal State
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')

  // Granular Custom Access Control Modal State
  const [permissionsModalUser, setPermissionsModalUser] = useState<User | null>(null)
  const [customPerms, setCustomPerms] = useState<UserPermissions>({
    canAddEditProducts: false,
    canDeleteProducts: false,
    canAdjustStock: false,
    canImportExcel: false,
    canExportExcel: true,
    canViewBackups: false,
    canManageSettings: false,
    canManageUsers: false,
  })

  const handleOpenAdd = () => {
    setEditingUser(null)
    setName('')
    setUsername('')
    setEmail('')
    setPassword('password123')
    setRole('inventory_editor')
    setIsAddUserOpen(true)
  }

  const handleOpenEdit = (u: User) => {
    setEditingUser(u)
    setName(u.name)
    setUsername(u.username)
    setEmail(u.email)
    setRole(u.role)
    setIsAddUserOpen(true)
  }

  const handleOpenPermissions = (u: User) => {
    setPermissionsModalUser(u)
    setCustomPerms({
      ...ROLE_DEFAULT_PERMISSIONS[u.role],
      ...u.permissions,
    })
  }

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !username) return

    if (editingUser) {
      updateUser(editingUser.id, { name, username, email, role })
    } else {
      const defaultPerms = ROLE_DEFAULT_PERMISSIONS[role] || ROLE_DEFAULT_PERMISSIONS.viewer
      createUser({
        name,
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        password,
        role,
        permissions: { ...defaultPerms },
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      })
    }
    setIsAddUserOpen(false)
  }

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordModalUser || !newPassword) return
    changeUserPassword(passwordModalUser.id, newPassword)
    setPasswordModalUser(null)
    setNewPassword('')
  }

  const handleSavePermissions = () => {
    if (!permissionsModalUser) return
    updateUserPermissions(permissionsModalUser.id, customPerms)
    setPermissionsModalUser(null)
  }

  if (currentUser?.role !== 'system_admin') {
    return (
      <div className="p-12 text-center space-y-3 bg-white dark:bg-slate-900 border rounded-2xl shadow-xs">
        <Lock className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Admin Access Required</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          User account administration and custom permission access is restricted to the <strong>System Admin</strong>.
        </p>
      </div>
    )
  }

  const roleLabel = (r: UserRole) => {
    switch (r) {
      case 'system_admin':
        return 'System Admin'
      case 'inventory_editor':
        return 'Inventory Editor'
      case 'operations':
        return 'Operations'
      case 'accounts':
        return 'Accounts'
      case 'manager':
        return 'Manager'
      case 'viewer':
        return 'Viewer'
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            User Accounts & Granular Access Control
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create user accounts, set login credentials, and customize module permissions individually.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-9 px-3.5 rounded-xl shadow-xs"
        >
          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active System Users ({users.length})</h3>
          <span className="text-xs text-slate-400">Click permissions button to configure individual access</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-center">Assigned Role</th>
                <th className="py-3 px-4 text-center">Custom Permissions</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                    {u.name}
                    {u.id === currentUser.id && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.2 bg-indigo-600 text-white rounded font-bold">YOU</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-indigo-600 dark:text-indigo-400 font-semibold whitespace-nowrap">
                    @{u.username}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap">{u.email}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenPermissions(u)}
                      className="h-7 px-2.5 text-[11px] font-medium rounded-lg border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                    >
                      <SlidersHorizontal className="w-3 h-3 mr-1" />
                      Configure Access
                    </Button>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      u.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200'
                    }`}>
                      {u.status === 'active' ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {/* Change Password Button */}
                      <button
                        onClick={() => {
                          setPasswordModalUser(u)
                          setNewPassword('')
                        }}
                        className="px-2 py-1 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center gap-1 text-[11px] font-medium transition-colors"
                        title="Change User Password"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Password</span>
                      </button>

                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                        title="Toggle Status"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                        title="Edit User"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete account for ${u.name}?`)) deleteUser(u.id)
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingUser ? 'Edit User Details' : 'Add New User'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Enter user account info and assign an initial baseline role.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitUser} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Full Name *</Label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Asad Farooq"
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Username *</Label>
              <Input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. asad_ops"
                className="h-9 text-xs font-mono rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Email Address *</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@snugnplay.com"
                className="h-9 text-xs rounded-xl"
              />
            </div>

            {!editingUser && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Initial Password *</Label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Baseline Role</Label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full h-9 text-xs px-3 rounded-xl border border-input bg-background font-medium"
              >
                <option value="system_admin">System Admin (Full Power)</option>
                <option value="inventory_editor">Inventory Editor (Full Catalog Control)</option>
                <option value="operations">Operations</option>
                <option value="accounts">Accounts</option>
                <option value="manager">Manager</option>
                <option value="viewer">Viewer (View Only)</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)} className="text-xs rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl">
                {editingUser ? 'Save Changes' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Admin Change Password Modal */}
      <Dialog open={!!passwordModalUser} onOpenChange={(open) => !open && setPasswordModalUser(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-indigo-600 dark:text-indigo-400">
              <KeyRound className="w-4 h-4" />
              Change Password for {passwordModalUser?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Directly assign a new login password for <strong>{passwordModalUser?.username}</strong> ({passwordModalUser?.email}).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePassword} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">New Password</Label>
              <Input
                type="text"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="h-10 text-xs font-mono font-bold rounded-xl"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPasswordModalUser(null)} className="text-xs rounded-xl">
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
              >
                Save New Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Granular Custom Permission Config Modal */}
      <Dialog open={!!permissionsModalUser} onOpenChange={(open) => !open && setPermissionsModalUser(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              Custom Access Permissions: {permissionsModalUser?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Check or uncheck specific privileges to give custom control for this user.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs space-y-2.5 border border-slate-200/80 dark:border-slate-800">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={customPerms.canAddEditProducts}
                  onChange={(e) => setCustomPerms({ ...customPerms, canAddEditProducts: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">Add & Edit Products</span>
                  <span className="text-[11px] text-slate-400">Can create new SKUs and modify existing product details</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={customPerms.canDeleteProducts}
                  onChange={(e) => setCustomPerms({ ...customPerms, canDeleteProducts: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">Delete Products</span>
                  <span className="text-[11px] text-slate-400">Can permanently delete items from master catalog</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={customPerms.canAdjustStock}
                  onChange={(e) => setCustomPerms({ ...customPerms, canAdjustStock: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">Stock Movements (In / Out)</span>
                  <span className="text-[11px] text-slate-400">Can record incoming shipments and order dispatches</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={customPerms.canImportExcel}
                  onChange={(e) => setCustomPerms({ ...customPerms, canImportExcel: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">Import Excel Sheets</span>
                  <span className="text-[11px] text-slate-400">Can upload bulk .xlsx spreadsheets to update catalog</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={customPerms.canExportExcel}
                  onChange={(e) => setCustomPerms({ ...customPerms, canExportExcel: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">Export to Excel</span>
                  <span className="text-[11px] text-slate-400">Can download Excel reports of active stock</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={customPerms.canViewBackups}
                  onChange={(e) => setCustomPerms({ ...customPerms, canViewBackups: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">Database Backups Access</span>
                  <span className="text-[11px] text-slate-400">Can create and download database snapshots</span>
                </div>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPermissionsModalUser(null)} className="text-xs rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleSavePermissions}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
            >
              Apply Custom Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
