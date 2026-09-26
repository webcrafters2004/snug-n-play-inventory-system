'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { User, UserRole } from '@/lib/types'
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
  Eye,
} from 'lucide-react'

export function UsersManagementView() {
  const {
    users,
    currentUser,
    createUser,
    updateUser,
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

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !username) return

    if (editingUser) {
      updateUser(editingUser.id, { name, username, email, role })
    } else {
      createUser({
        name,
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        password,
        role,
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

  if (currentUser?.role !== 'system_admin') {
    return (
      <div className="p-12 text-center space-y-3 bg-white dark:bg-slate-900 border rounded-3xl shadow-sm">
        <Lock className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold">Access Restricted to System Admin</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          User & Role Administration and Password Control is exclusively managed by the <strong>System Admin</strong> account (amankamran2004@outlook.com).
        </p>
      </div>
    )
  }

  const roleBadge = (r: UserRole) => {
    switch (r) {
      case 'system_admin':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">👑 SYSTEM ADMIN</span>
      case 'inventory_editor':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">✏️ INVENTORY EDITOR</span>
      case 'operations':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">📦 OPERATIONS (VIEW)</span>
      case 'accounts':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">💰 ACCOUNTS (VIEW)</span>
      case 'manager':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">📊 MANAGER (VIEW)</span>
      case 'viewer':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">👁️ VIEWER (VIEW)</span>
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users2 className="w-6 h-6 text-indigo-600" />
            User Roles & Admin Password Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            System Admin controls all user accounts, role permissions, and direct password updates.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs h-10 px-4 rounded-2xl shadow-md"
        >
          <UserPlus className="w-4 h-4 mr-1.5" />
          Add New User
        </Button>
      </div>

      {/* Role Architecture Explanation */}
      <div className="p-5 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs space-y-2">
        <div className="flex items-center gap-2 font-black text-indigo-900 dark:text-indigo-200 text-xs uppercase tracking-wide">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          Role Permission Architecture:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-[11px] text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-900">
            <strong className="text-indigo-600 dark:text-indigo-400 block font-bold">👑 System Admin</strong>
            Full system power, manage user accounts & change passwords, database backups.
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-emerald-900">
            <strong className="text-emerald-600 dark:text-emerald-400 block font-bold">✏️ Inventory Editor</strong>
            The single authorized person who can add/edit/delete SKUs, import Excel & adjust quantities.
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-white block font-bold">👁️ Operations / Accounts / Manager / Viewer</strong>
            Read-only access. View live stock quantities and export to Excel.
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active System Accounts ({users.length})</h3>
          <span className="text-xs text-slate-400">Click Key icon to change any user's password</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Username</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-center">Assigned Role</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {u.name}
                    {u.id === currentUser.id && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-indigo-600 text-white rounded-md font-extrabold">YOU</span>
                    )}
                  </td>
                  <td className="p-4 font-mono text-indigo-600 dark:text-indigo-400 font-bold whitespace-nowrap">
                    @{u.username}
                  </td>
                  <td className="p-4 text-slate-500 font-mono whitespace-nowrap">{u.email}</td>
                  <td className="p-4 text-center whitespace-nowrap">
                    {roleBadge(u.role)}
                  </td>
                  <td className="p-4 text-center whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {u.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 whitespace-nowrap">{u.lastLogin || 'Never'}</td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Change Password Button for Admin */}
                      <button
                        onClick={() => {
                          setPasswordModalUser(u)
                          setNewPassword('')
                        }}
                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center gap-1 text-[11px] font-bold"
                        title="Change / Reset User Password"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span className="hidden sm:inline">Set Pass</span>
                      </button>

                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Toggle Account Status"
                      >
                        <Power className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Edit User Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete user account ${u.name}?`)) deleteUser(u.id)
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
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
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingUser ? 'Edit User Details' : 'Add New User Account'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure user details, login username, and access permissions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitUser} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold">Full Name *</Label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Asad Farooq"
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold">Username (For Login) *</Label>
              <Input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. asad_ops"
                className="h-9 text-xs font-mono rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold">Email Address *</Label>
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
                <Label className="text-xs font-bold">Initial Password *</Label>
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
              <Label className="text-xs font-bold">Assigned Role</Label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full h-9 text-xs px-3 rounded-xl border border-input bg-background font-bold"
              >
                <option value="system_admin">👑 System Admin (Full System Power)</option>
                <option value="inventory_editor">✏️ Inventory Editor (Add/Edit/Delete & Stock Control)</option>
                <option value="operations">📦 Operations (View Only)</option>
                <option value="accounts">💰 Accounts (View Only)</option>
                <option value="manager">📊 Manager (View Only)</option>
                <option value="viewer">👁️ Viewer (View Only)</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)} className="text-xs rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 text-white text-xs font-bold rounded-xl">
                {editingUser ? 'Save Changes' : 'Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Admin Change Password Modal */}
      <Dialog open={!!passwordModalUser} onOpenChange={(open) => !open && setPasswordModalUser(null)}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-indigo-600">
              <KeyRound className="w-5 h-5" />
              Set New Password for {passwordModalUser?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              As System Admin, you can directly set or reset the password for <strong>{passwordModalUser?.username}</strong> ({passwordModalUser?.email}).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePassword} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">New Password</Label>
              <Input
                type="text"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (e.g. Pass@2026)"
                className="h-10 text-xs font-mono font-bold rounded-xl"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPasswordModalUser(null)} className="text-xs rounded-xl">
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
              >
                Save New Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
