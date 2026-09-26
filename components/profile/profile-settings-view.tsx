'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Settings,
  User,
  Mail,
  Lock,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react'
import { toast } from 'sonner'

export function ProfileSettingsView() {
  const { currentUser, updateProfile } = useInventory()
  const { theme, setTheme } = useTheme()

  const [name, setName] = useState(currentUser?.name || '')
  const [email, setEmail] = useState(currentUser?.email || 'amankamran2004@outlook.com')
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) return
    updateProfile(name, email)
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPass.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    toast.success('Password updated successfully!')
    setCurrentPass('')
    setNewPass('')
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            Account & System Preferences
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Update your profile email, password, and visual theme.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 capitalize">
          {currentUser?.role?.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            Profile Details
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Display Name</label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 text-xs rounded-2xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Admin Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="amankamran2004@outlook.com"
                  className="pl-9 h-10 text-xs font-mono rounded-2xl"
                />
              </div>
            </div>

            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-10 text-xs rounded-2xl">
              Save Profile
            </Button>
          </form>
        </div>

        {/* Theme Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            Theme & Appearance
          </h3>
          <p className="text-xs text-slate-500">Choose your preferred portal view</p>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3 rounded-2xl border-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                theme === 'light' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500" />
              <span>Light</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-2xl border-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                theme === 'dark' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-400' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <Moon className="w-5 h-5 text-indigo-400" />
              <span>Dark</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-3 rounded-2xl border-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                theme === 'system' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <Laptop className="w-5 h-5 text-slate-400" />
              <span>Auto</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
