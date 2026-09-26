'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Settings,
  User,
  Mail,
  Lock,
  Sun,
  Moon,
  Laptop,
  KeyRound,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'

export function ProfileSettingsView() {
  const { currentUser, updateProfile, changeUserPassword, isAdmin } = useInventory()
  const { theme, setTheme } = useTheme()

  const [name, setName] = useState(currentUser?.name || '')
  const [email, setEmail] = useState(currentUser?.email || 'amankamran2004@outlook.com')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) return
    updateProfile(name, email)
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return
    if (newPass.length < 6) {
      toast.error('Password must be at least 6 characters long.')
      return
    }
    if (newPass !== confirmPass) {
      toast.error('New Password and Confirm Password do not match.')
      return
    }

    changeUserPassword(currentUser.id, newPass)
    setNewPass('')
    setConfirmPass('')
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Account & System Preferences
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Update your profile details, password, and display theme.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 capitalize flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            {currentUser?.role?.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Details Card */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Profile Details
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Display Name</label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Admin Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="amankamran2004@outlook.com"
                  className="pl-9 h-10 text-xs font-mono rounded-xl"
                />
              </div>
            </div>

            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-10 text-xs rounded-xl">
              Save Profile Details
            </Button>
          </form>
        </div>

        {/* Change Admin Password Card */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Change Admin Password
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Enter new password (min. 6 characters)"
                  className="pl-9 h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Re-enter new password"
                  className="pl-9 h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-10 text-xs rounded-xl">
              Update Password
            </Button>
          </form>
        </div>

        {/* Theme & Appearance Card */}
        <div className="lg:col-span-12 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sun className="w-4 h-4 text-amber-500" />
            Theme & Appearance Mode
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select your preferred visual mode for the Snug N Play system.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2.5 transition-all ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Light Mode (Default)</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2.5 transition-all ${
                theme === 'dark'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-400 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Dark Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2.5 transition-all ${
                theme === 'system'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Laptop className="w-4 h-4 text-slate-400" />
              <span>System Auto</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

