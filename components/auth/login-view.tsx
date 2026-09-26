'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { UserRole } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Sparkles,
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

  // Forgot password state
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200/80 dark:border-slate-700">
            <img
              src="/logo.webp"
              alt="Snug N Play"
              className="h-14 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Snug N Play Inventory
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select your role below or enter your login details
            </p>
          </div>
        </div>

        {/* Simple Login Box */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-5">
          {/* Big, Clean 1-Click Role Buttons */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              ⚡ 1-Click Quick Login
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('system_admin')}
                className="p-3 rounded-2xl border-2 border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-left transition-transform active:scale-95 hover:shadow-md"
              >
                <div className="font-extrabold text-xs text-indigo-700 dark:text-indigo-300">👑 System Admin</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Full System Power</div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickLogin('manager')}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-blue-500 text-left transition-transform active:scale-95 hover:shadow-md"
              >
                <div className="font-extrabold text-xs text-blue-700 dark:text-blue-300">📊 Manager</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Stock & Analytics</div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickLogin('operations')}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-amber-500 text-left transition-transform active:scale-95 hover:shadow-md"
              >
                <div className="font-extrabold text-xs text-amber-700 dark:text-amber-300">📦 Operations</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Stock In / Out & Excel</div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickLogin('accounts')}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-emerald-500 text-left transition-transform active:scale-95 hover:shadow-md"
              >
                <div className="font-extrabold text-xs text-emerald-700 dark:text-emerald-300">💰 Accounts</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Costing & Valuation</div>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            <span className="absolute bg-white dark:bg-slate-900 px-3 text-[11px] text-slate-400 font-medium">
              or enter password
            </span>
          </div>

          {/* Email / Pass Form */}
          <form onSubmit={handleManualSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="amankamran2004@outlook.com"
                  className="pl-10 h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email)
                    setForgotResult(null)
                    setIsForgotOpen(true)
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-10 rounded-xl shadow-lg shadow-indigo-600/20 text-xs"
            >
              Sign In <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        </div>

        <div className="text-center text-xs text-slate-500">
          Admin Email: <strong className="text-slate-700 dark:text-slate-300">amankamran2004@outlook.com</strong>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <KeyRound className="w-5 h-5 text-indigo-600" />
              Forgot Password
            </DialogTitle>
            <DialogDescription className="text-xs">
              Submit your email, and the <strong>System Admin</strong> will assign you a new password.
            </DialogDescription>
          </DialogHeader>

          {forgotResult ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs space-y-1">
              <p className="font-bold text-emerald-800 dark:text-emerald-300">Request Sent Successfully!</p>
              <p className="text-emerald-700 dark:text-emerald-400">{forgotResult.message}</p>
            </div>
          ) : (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3 py-2">
              <div className="space-y-1">
                <label className="text-xs font-bold">Your Registered Email</label>
                <Input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@snugnplay.com"
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold">Notes for Admin (Optional)</label>
                <Input
                  value={forgotNotes}
                  onChange={(e) => setForgotNotes(e.target.value)}
                  placeholder="e.g. Switched phone"
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsForgotOpen(false)} className="text-xs rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 text-white text-xs font-bold rounded-xl">
                  Send Request
                </Button>
              </DialogFooter>
            </form>
          )}

          {forgotResult && (
            <DialogFooter>
              <Button onClick={() => setIsForgotOpen(false)} className="bg-indigo-600 text-white text-xs rounded-xl">
                Close
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
