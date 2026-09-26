'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { UserRole } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ShieldCheck,
  Package,
  Layers,
  Calculator,
  UserCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Sparkles,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
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
  const { login, requestPasswordReset, users } = useInventory()
  const [email, setEmail] = useState('amankamran2004@outlook.com')
  const [password, setPassword] = useState('password123')
  const [isForgotOpen, setIsForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotNotes, setForgotNotes] = useState('')
  const [forgotResult, setForgotResult] = useState<{ success: boolean; message: string; refCode?: string } | null>(null)

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email)
  }

  const handleRoleQuickLogin = (role: UserRole) => {
    login(role)
  }

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) return
    const res = requestPasswordReset(forgotEmail, forgotNotes)
    setForgotResult(res)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Side: Brand Story & Features */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            Snug N Play Enterprise Edition
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Snug N Play <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Inventory Management
              </span>
            </h1>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Complete inventory control, multi-role RBAC, seamless Excel .XLSX import/export, 30-day automated backups, and real-time stock analytics.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                4-Tier RBAC
              </div>
              <p className="text-xs text-slate-400 mt-1">Admin, Manager, Operations & Accounts</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs">
                <Package className="w-4 h-4 text-emerald-400" />
                Excel Engine
              </div>
              <p className="text-xs text-slate-400 mt-1">Bulk .XLSX import, export & templates</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                <Layers className="w-4 h-4 text-amber-400" />
                Auto-Backups
              </div>
              <p className="text-xs text-slate-400 mt-1">30-day scheduled & one-click manual</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs">
                <Calculator className="w-4 h-4 text-purple-400" />
                Smart Valuation
              </div>
              <p className="text-xs text-slate-400 mt-1">Costing, margins & live KPI charts</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card & Demo Switches */}
        <div className="lg:col-span-6">
          <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-2xl text-slate-100">
            <CardHeader className="space-y-1 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-white">Sign In to Workspace</CardTitle>
                <Badge variant="outline" className="bg-indigo-950/60 text-indigo-300 border-indigo-700/40 text-xs">
                  Vercel Live
                </Badge>
              </div>
              <CardDescription className="text-slate-400 text-xs">
                Enter your credentials or choose a role demo shortcut below.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Quick Role Selectors */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Quick Demo Access (Select Role):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleQuickLogin('system_admin')}
                    className="flex flex-col items-start p-2.5 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/30 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-indigo-200 group-hover:text-white">System Admin</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5">Full System Access</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleQuickLogin('manager')}
                    className="flex flex-col items-start p-2.5 rounded-lg bg-blue-950/50 hover:bg-blue-900/60 border border-blue-500/30 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-blue-200 group-hover:text-white">Manager</span>
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5">Analytics & Approvals</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleQuickLogin('operations')}
                    className="flex flex-col items-start p-2.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-amber-200 group-hover:text-white">Operations</span>
                      <Package className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5">Stock In/Out & Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleQuickLogin('accounts')}
                    className="flex flex-col items-start p-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-emerald-200 group-hover:text-white">Accounts</span>
                      <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5">Valuation & Reports</span>
                  </button>
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800" />
                <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase tracking-wider">or sign in with email</span>
                <div className="flex-grow border-t border-slate-800" />
              </div>

              {/* Manual Email / Pass form */}
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="amankamran2004@outlook.com"
                      className="pl-9 bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 text-xs h-9 focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email)
                        setForgotResult(null)
                        setIsForgotOpen(true)
                      }}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Forgot password?
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
                      className="pl-9 bg-slate-800/80 border-slate-700 text-white text-xs h-9 focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold h-9 mt-2 transition-all shadow-lg shadow-indigo-600/20"
                >
                  Sign In <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </form>
            </CardContent>

            <CardFooter className="pt-0 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/60 mt-3 py-3">
              <span>Super Admin: <strong className="text-slate-200">amankamran2004@outlook.com</strong></span>
              <span className="text-emerald-400 font-medium">● System Operational</span>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <KeyRound className="w-5 h-5 text-indigo-400" />
              Request Password Reset
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Password resets are managed securely by the <strong>System Admin</strong>. Submit your request below, and the Admin will issue your new temporary credentials.
            </DialogDescription>
          </DialogHeader>

          {forgotResult ? (
            <div className="py-4 space-y-3">
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Reset Request Registered!</p>
                  <p className="mt-1 text-[11px] text-emerald-300">{forgotResult.message}</p>
                </div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 text-slate-300 text-xs">
                Reference Code: <strong className="text-indigo-400 font-mono">{forgotResult.refCode}</strong>
              </div>
            </div>
          ) : (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3 py-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Registered Email Address</label>
                <Input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@snugnplay.com"
                  className="bg-slate-800 border-slate-700 text-white text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Reason / Notes for Admin</label>
                <Input
                  type="text"
                  value={forgotNotes}
                  onChange={(e) => setForgotNotes(e.target.value)}
                  placeholder="e.g. Switched to new laptop, forgot passcode"
                  className="bg-slate-800 border-slate-700 text-white text-xs h-9"
                />
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsForgotOpen(false)}
                  className="border-slate-700 text-slate-300 text-xs h-8"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8">
                  Submit Request
                </Button>
              </DialogFooter>
            </form>
          )}

          {forgotResult && (
            <DialogFooter>
              <Button onClick={() => setIsForgotOpen(false)} className="bg-indigo-600 text-white text-xs h-8">
                Close & Return to Sign In
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
