'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Package,
} from 'lucide-react'

export function LoginView() {
  const { login } = useInventory()
  const [identifier, setIdentifier] = useState('admin')
  const [password, setPassword] = useState('adminpassword')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim()) return
    login(identifier, password)
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800">
            <img
              src="/logo.webp"
              alt="Snug N Play"
              className="h-16 w-auto object-contain"
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
              Pure Physical Stock & Warehouse Quantity Tracking
            </p>
          </div>
        </div>

        {/* Clean Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 text-center">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Warehouse Access Portal
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Address or Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin or amankamran2004@outlook.com"
                  className="pl-10 h-11 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-11 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold h-11 rounded-2xl shadow-lg shadow-indigo-600/25 text-xs transition-transform active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>Open Inventory</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Policy / Password notice */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1 text-center">
            <div className="flex items-center justify-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Password & Security Policy</span>
            </div>
            <p>
              Forgot or need to change your password? Contact your <strong>System Admin</strong> to update your credentials.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500 dark:text-slate-400">
          System Admin: <strong className="text-slate-700 dark:text-slate-300 font-mono">amankamran2004@outlook.com</strong>
        </div>
      </div>
    </div>
  )
}
