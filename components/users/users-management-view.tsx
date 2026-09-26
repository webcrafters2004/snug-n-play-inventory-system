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
  XCircle,
  Edit2,
  Trash2,
  Power,
  Lock,
} from 'lucide-react'

export function UsersManagementView() {
  const {
    users,
    currentUser,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    resetRequests,
    approvePasswordReset,
    rejectPasswordReset,
  } = useInventory()

  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('operations')

  const [approveModalReq, setApproveModalReq] = useState<any | null>(null)
  const [tempPassword, setTempPassword] = useState('SnugPlay@2026')

  const pendingRequests = resetRequests.filter((r) => r.status === 'pending')

  const handleOpenAdd = () => {
    setEditingUser(null)
    setName('')
    setEmail('')
    setRole('operations')
    setIsAddUserOpen(true)
  }

  const handleOpenEdit = (u: User) => {
    setEditingUser(u)
    setName(u.name)
    setEmail(u.email)
    setRole(u.role)
    setIsAddUserOpen(true)
  }

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) return

    if (editingUser) {
      updateUser(editingUser.id, { name, email, role })
    } else {
      createUser({
        name,
        email,
        role,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      })
    }
    setIsAddUserOpen(false)
  }

  if (currentUser?.role !== 'system_admin') {
    return (
      <div className="p-12 text-center space-y-3 bg-white dark:bg-slate-900 border rounded-3xl">
        <Lock className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold">Access Restricted</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          User & Role Administration is only accessible by the <strong>System Admin</strong> account (amankamran2004@outlook.com).
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users2 className="w-6 h-6 text-indigo-600" />
            User Roles & Permissions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Add team members, assign permissions (Admin, Manager, Ops, Accounts), and approve password resets.
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

      {/* Password Reset Queue Card */}
      {pendingRequests.length > 0 && (
        <div className="p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-600" />
              Pending Password Reset Requests ({pendingRequests.length})
            </h3>
          </div>

          <div className="divide-y divide-indigo-100 dark:divide-indigo-900/60">
            {pendingRequests.map((req) => (
              <div key={req.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{req.userName}</span>
                  <span className="text-slate-500 text-xs ml-2">({req.userEmail})</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{req.notes || 'Password reset requested via login'}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectPasswordReset(req.id)}
                    className="text-xs h-8 rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setApproveModalReq(req)
                      setTempPassword('SnugPlay@' + Math.floor(1000 + Math.random() * 9000))
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-8 px-3 rounded-xl shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Approve & Issue Password
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active System Accounts ({users.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-center">Role</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">{u.name}</td>
                  <td className="p-4 text-slate-500 font-mono whitespace-nowrap">{u.email}</td>
                  <td className="p-4 text-center whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 capitalize">
                      {u.role.replace('_', ' ')}
                    </span>
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
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Toggle Status"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete user ${u.name}?`)) deleteUser(u.id)
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
              {editingUser ? 'Edit User Details' : 'Add New User'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitUser} className="space-y-4 py-2">
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

            <div className="space-y-1">
              <Label className="text-xs font-bold">Assigned Role</Label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full h-9 text-xs px-3 rounded-xl border border-input bg-background font-bold"
              >
                <option value="system_admin">👑 System Admin (Full Power)</option>
                <option value="manager">📊 Manager (Stock & Analytics)</option>
                <option value="operations">📦 Operations (Stock In / Out & Excel)</option>
                <option value="accounts">💰 Accounts (Valuation & Costing)</option>
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

      {/* Password Reset Approval Modal */}
      <Dialog open={!!approveModalReq} onOpenChange={(open) => !open && setApproveModalReq(null)}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              Approve Password Reset
            </DialogTitle>
            <DialogDescription className="text-xs">
              Assign a temporary password for <strong>{approveModalReq?.userName}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label className="text-xs font-bold">Temporary Password</Label>
            <Input
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              className="h-10 text-sm font-mono font-bold bg-muted rounded-xl"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModalReq(null)} className="text-xs rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={() => {
                approvePasswordReset(approveModalReq.id, tempPassword)
                setApproveModalReq(null)
              }}
              className="bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
