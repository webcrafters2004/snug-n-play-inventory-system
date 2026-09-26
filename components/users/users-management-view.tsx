'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { User, UserRole } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  Clock,
  Edit2,
  Trash2,
  Power,
  ShieldAlert,
  Lock,
  Calculator,
  Layers,
  Package,
} from 'lucide-react'
import { toast } from 'sonner'

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

  // Add/Edit Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('operations')

  // Password reset approval modal
  const [approveModalReq, setApproveModalReq] = useState<any | null>(null)
  const [tempPassword, setTempPassword] = useState('SnugPlay@2026')

  const pendingRequests = resetRequests.filter((r) => r.status === 'pending')
  const handledRequests = resetRequests.filter((r) => r.status !== 'pending')

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

  const roleBadge = (r: UserRole) => {
    switch (r) {
      case 'system_admin':
        return (
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 text-[10px] gap-1">
            <ShieldCheck className="w-3 h-3" /> System Admin
          </Badge>
        )
      case 'manager':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px] gap-1">
            <Layers className="w-3 h-3" /> Manager
          </Badge>
        )
      case 'operations':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] gap-1">
            <Package className="w-3 h-3" /> Operations
          </Badge>
        )
      case 'accounts':
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] gap-1">
            <Calculator className="w-3 h-3" /> Accounts
          </Badge>
        )
    }
  }

  if (currentUser?.role !== 'system_admin') {
    return (
      <div className="p-8 text-center space-y-3 bg-card border rounded-2xl">
        <Lock className="w-8 h-8 text-destructive mx-auto" />
        <h2 className="text-base font-bold text-foreground">Access Restricted</h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          User & Role Administration is restricted to the <strong>System Admin</strong> account (
          amankamran2004@outlook.com).
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users2 className="w-5 h-5 text-indigo-500" />
            User Access & Role Management (RBAC)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage employee accounts, assign permissions, and process password reset requests.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 gap-1.5 shadow-sm shadow-indigo-600/20 self-start sm:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add User Account
        </Button>
      </div>

      {/* Password Reset Requests Queue (Critical Requirement) */}
      <Card className="border-indigo-500/30 bg-indigo-500/5 shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <KeyRound className="w-4 h-4" />
              Password Reset Requests Queue
            </CardTitle>
            <CardDescription className="text-xs">
              When users click "Forgot Password", their requests are queued here for System Admin approval.
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs">
            {pendingRequests.length} Pending
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {pendingRequests.length === 0 ? (
              <div className="p-5 text-center text-xs text-muted-foreground">
                No pending password reset requests. All accounts are in good standing.
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-xs">{req.userName}</span>
                      <span className="text-muted-foreground text-xs font-mono">({req.userEmail})</span>
                      <Badge variant="outline" className="text-[9px] font-mono bg-indigo-500/10 text-indigo-500">
                        {req.referenceCode}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{req.notes || 'Password reset requested via login'}</p>
                    <p className="text-[10px] text-muted-foreground">Requested on: {req.requestedAt}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectPasswordReset(req.id)}
                      className="text-xs h-7 text-destructive border-destructive/30 hover:bg-destructive/10"
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
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-7 gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve & Issue Password
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">Active System Users ({users.length})</CardTitle>
          <CardDescription className="text-xs">Configured roles and access permissions.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/70 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3 text-center">Assigned Role</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Last Login</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30">
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-foreground">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground font-mono whitespace-nowrap">{u.email}</td>
                    <td className="p-3 text-center whitespace-nowrap">{roleBadge(u.role)}</td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={
                          u.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[9px]'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 text-[9px]'
                        }
                      >
                        {u.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">{u.lastLogin || 'Never'}</td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleUserStatus(u.id)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          title={u.status === 'active' ? 'Disable Account' : 'Enable Account'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(u)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          title="Edit User"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        {u.id !== currentUser.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Remove user ${u.name}?`)) deleteUser(u.id)
                            }}
                            className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Role Permission Matrix Card */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">Role Permission Reference Matrix</CardTitle>
          <CardDescription className="text-xs">Summary of capabilities by role tier.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/70 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">Capability / Feature</th>
                  <th className="p-3 text-center">System Admin</th>
                  <th className="p-3 text-center">Manager</th>
                  <th className="p-3 text-center">Operations</th>
                  <th className="p-3 text-center">Accounts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-center">
                <tr>
                  <td className="p-3 text-left font-medium">Full Dashboard & KPI Charts</td>
                  <td className="p-3 text-emerald-500 font-bold">✓</td>
                  <td className="p-3 text-emerald-500 font-bold">✓</td>
                  <td className="p-3 text-emerald-500 font-bold">✓</td>
                  <td className="p-3 text-emerald-500 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="p-3 text-left font-medium">Excel (.XLSX) Export</td>
                  <td className="p-3 text-emerald-500 font-bold">✓</td>
                  <td className="p-3 text-emerald-500 font-bold">✓</td>
                  <td className="p-3 text-emerald-500 font-bold">✓</td>
                  <td className="p-3 text-emerald-500 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="p-3 text-left font-medium">Excel (.XLSX) Import & SKU Create</td>
                  <td className="p-3 text-emerald-500 font-bold">✓</td>
                  <td className="p-3 text-muted-foreground">—</td>
                  <td className="p-3 text-emerald-500 font-bold">✓</td>
                  <td className="p-3 text-muted-foreground">—</td>
                </tr>
                <tr>
                  <td className="p-3 text-left font-medium">Cost & Margin Valuation Visibility</td>
                  <td className="p-3 text-emerald-500 font-bold">✓</td>
                  <td className="p-3 text-emerald-500 font-bold">✓</td>
                  <td className="p-3 text-muted-foreground">—</td>
                  <td className="p-3 text-emerald-500 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="p-3 text-left font-medium">Stock In / Stock Out Ledger Posting</td>
                  <td className="p-3 text-emerald-500 font-bold">✓</td>
                  <td className="p-3 text-emerald-500 font-bold">✓</td>
                  <td className="p-3 text-emerald-500 font-bold">✓</td>
                  <td className="p-3 text-muted-foreground">—</td>
                </tr>
                <tr>
                  <td className="p-3 text-left font-medium">User Management & Password Resets</td>
                  <td className="p-3 text-emerald-500 font-bold">✓ Full Control</td>
                  <td className="p-3 text-muted-foreground">—</td>
                  <td className="p-3 text-muted-foreground">—</td>
                  <td className="p-3 text-muted-foreground">—</td>
                </tr>
                <tr>
                  <td className="p-3 text-left font-medium">Backup Creation & Restore</td>
                  <td className="p-3 text-emerald-500 font-bold">✓ Full Control</td>
                  <td className="p-3 text-muted-foreground">Read Only</td>
                  <td className="p-3 text-muted-foreground">—</td>
                  <td className="p-3 text-muted-foreground">Read Only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit User Modal */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="max-w-md bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingUser ? 'Edit User Account' : 'Add New User'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure login credentials and role assignment.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitUser} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Full Name *</Label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Asad Farooq"
                className="h-8 text-xs"
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
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Assigned Role</Label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full h-8 text-xs px-2.5 rounded-md border border-input bg-background text-foreground"
              >
                <option value="system_admin">System Admin (Full Access)</option>
                <option value="manager">Manager (Approvals & Analytics)</option>
                <option value="operations">Operations (Stock Movement & Excel)</option>
                <option value="accounts">Accounts (Valuation & Financial Reports)</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddUserOpen(false)} className="text-xs h-8">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8">
                {editingUser ? 'Save Changes' : 'Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Reset Approval Modal */}
      <Dialog open={!!approveModalReq} onOpenChange={(open) => !open && setApproveModalReq(null)}>
        <DialogContent className="max-w-md bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              Approve Password Reset Request
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Issue a temporary password for <strong>{approveModalReq?.userName}</strong> ({approveModalReq?.userEmail}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Generated Temporary Password</Label>
              <Input
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                className="h-9 text-xs font-mono font-bold bg-muted"
              />
              <p className="text-[10px] text-muted-foreground">
                The user can sign in with this temporary key and change their password in Profile Settings.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setApproveModalReq(null)} className="text-xs h-8">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                approvePasswordReset(approveModalReq.id, tempPassword)
                setApproveModalReq(null)
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8"
            >
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
