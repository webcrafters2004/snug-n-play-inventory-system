'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export function LoginView() {
  const { login } = useInventory()
  const [identifier, setIdentifier] = useState('admin')
  const [password, setPassword] = useState('adminpassword')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim()) return
    // Support typing either 'rehmat' or 'rehmat@snugnplay.com' or 'admin'
    const fullIdentifier =
      identifier.includes('@') || identifier === 'admin'
        ? identifier.trim()
        : `${identifier.trim()}@snugnplay.com`
    login(fullIdentifier, password)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-100 dark:bg-slate-950">
      <div className="w-full max-w-4xl min-h-[520px] grid grid-cols-1 md:grid-cols-12 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800">
        {/* Left: Colorful Brand Panel (Matching Reference Website) */}
        <div className="md:col-span-5 relative overflow-hidden bg-gradient-to-br from-[#F4568C] via-[#FBA919] to-[#29B8B0] p-8 sm:p-10 flex flex-col justify-between text-white">
          {/* Subtle Decorative Blobs */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/15 blur-sm pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/10 blur-sm pointer-events-none" />
          <div className="absolute bottom-24 right-4 w-24 h-24 rounded-full bg-white/20 blur-sm pointer-events-none" />

          {/* Top Brand Info */}
          <div className="relative z-10 space-y-4">
            <div className="inline-block p-3 bg-white/95 backdrop-blur rounded-2xl shadow-md">
              <img
                src="/logo.webp"
                alt="Snug N Play"
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-xs">
                Snug N' Play
              </h1>
              <span className="text-[11px] font-bold tracking-widest uppercase text-white/90 block mt-0.5">
                SMC-Pvt Limited
              </span>
            </div>
          </div>

          {/* Bottom Brand Description */}
          <div className="relative z-10 space-y-3 mt-8 md:mt-0">
            <p className="text-xs leading-relaxed text-white/95 max-w-sm font-medium">
              We're a toy e-commerce brand — this system tracks physical stock across every
              warehouse location, with a photo for every SKU. Built just for our team; no complex sync or confusion here.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-white/80">
              Site: Karachi Main Warehouse
            </div>
          </div>
        </div>

        {/* Right: Clean Sign-In Form Panel */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white dark:bg-slate-900">
          <div className="mb-6 space-y-1">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block">
              Inventory Management System
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your username and password to access warehouse inventory.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Username
              </label>
              <div className="relative">
                <Input
                  type="text"
                  required
                  autoComplete="off"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. rehmat or admin"
                  className="h-11 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 font-medium pr-32"
                />
                {!identifier.includes('@') && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400 pointer-events-none">
                    @snugnplay.com
                  </span>
                )}
              </div>
            </div>

            {/* Password with Eye Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Button with Reference Gradient */}
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#F4568C] to-[#FBA919] hover:brightness-105 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Sign in to System</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Clean Footer / Admin Support */}
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure Warehouse Login
            </span>
            <span>
              Admin: <strong className="font-mono text-slate-700 dark:text-slate-300">amankamran2004</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
