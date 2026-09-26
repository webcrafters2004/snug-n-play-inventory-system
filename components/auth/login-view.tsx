'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { UserRole } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function LoginView() {
  const { login, requestPasswordReset } = useInventory()
  const [email, setEmail] = useState('amankamran2004@outlook.com')
  const [password, setPassword] = useState('password123')
  const [selectedRole, setSelectedRole] = useState<UserRole>('system_admin')

  // Forgot password dialog
  const [isForgotOpen, setIsForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotNotes, setForgotNotes] = useState('')
  const [forgotResult, setForgotResult] = useState<{ success: boolean; message: string; refCode?: string } | null>(null)

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email)
  }

  const handleRoleQuickLogin = (role: UserRole) => {
    setSelectedRole(role)
    login(role)
  }

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) return
    const res = requestPasswordReset(forgotEmail, forgotNotes)
    setForgotResult(res)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 inline-block">
              <img
                src="/logo.webp"
                alt="Snug N Play"
                className="h-14 w-auto object-contain max-w-[180px]"
                onError={(e) => {
                  // Fallback if image fails
                  const target = e.currentTarget
                  target.style.display = 'none'
                  target.parentElement!.innerHTML = '<span class="text-2xl font-black text-indigo-600">Snug N Play</span>'
                }}
              />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Inventory Management Portal</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in with your account or choose your role below
          </p>
        </div>

        {/* Clean Login Card */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-base font-bold text-center">Account Sign In</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Quick 1-Click Role Tabs */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block text-center">
                1-Click Quick Login (Select Role)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleQuickLogin('system_admin')}
                  className="p-2.5 rounded-lg border text-left transition-all bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 group"
                >
                  <div className="font-bold text-xs text-indigo-700 dark:text-indigo-300">System Admin</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Full Access</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleQuickLogin('manager')}
                  className="p-2.5 rounded-lg border text-left transition-all bg-blue-50/60 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 hover:border-blue-500 group"
                >
                  <div className="font-bold text-xs text-blue-700 dark:text-blue-300">Manager</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Approvals & View</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleQuickLogin('operations')}
                  className="p-2.5 rounded-lg border text-left transition-all bg-amber-50/60 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 hover:border-amber-500 group"
                >
                  <div className="font-bold text-xs text-amber-700 dark:text-amber-300">Operations</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Stock In / Out</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleQuickLogin('accounts')}
                  className="p-2.5 rounded-lg border text-left transition-all bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 group"
                >
                  <div className="font-bold text-xs text-emerald-700 dark:text-emerald-300">Accounts</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Valuation & Costing</div>
                </button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
              <span className="flex-shrink mx-2 text-[10px] text-slate-400 uppercase font-semibold">Or Email Sign In</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
            </div>

            {/* Manual Form */}
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="amankamran2004@outlook.com"
                    className="pl-9 h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email)
                      setForgotResult(null)
                      setIsForgotOpen(true)
                    }}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 h-9 text-xs"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 font-bold mt-2">
                Sign In to Portal <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-0 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 py-3 justify-between">
            <span>Admin: <strong>amankamran2004@outlook.com</strong></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">● Online</span>
          </CardFooter>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <KeyRound className="w-5 h-5 text-indigo-500" />
              Reset Password Request
            </DialogTitle>
            <DialogDescription className="text-xs">
              Password reset requests are sent directly to the <strong>System Admin</strong> for approval.
            </DialogDescription>
          </DialogHeader>

          {forgotResult ? (
            <div className="py-3 space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold">Request Submitted!</p>
                  <p className="text-[11px] mt-0.5">{forgotResult.message}</p>
                </div>
              </div>
              <p className="text-center font-mono font-bold text-indigo-600">
                Reference Code: {forgotResult.refCode}
              </p>
            </div>
          ) : (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3 py-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Your Registered Email</label>
                <Input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@snugnplay.com"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Reason (Optional)</label>
                <Input
                  value={forgotNotes}
                  onChange={(e) => setForgotNotes(e.target.value)}
                  placeholder="e.g. Forgot passcode on mobile"
                  className="h-8 text-xs"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsForgotOpen(false)} className="text-xs h-8">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8">
                  Submit to Admin
                </Button>
              </DialogFooter>
            </form>
          )}

          {forgotResult && (
            <DialogFooter>
              <Button onClick={() => setIsForgotOpen(false)} className="bg-indigo-600 text-white text-xs h-8">
                Close
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
