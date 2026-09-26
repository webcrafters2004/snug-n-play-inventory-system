'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  User,
  ShieldCheck,
  Mail,
  Lock,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  Building,
  DollarSign,
  AlertTriangle,
  HardDrive,
} from 'lucide-react'
import { toast } from 'sonner'

export function ProfileSettingsView() {
  const { currentUser, updateProfile, settings, updateSettings } = useInventory()
  const { theme, setTheme } = useTheme()

  // Profile Form state
  const [name, setName] = useState(currentUser?.name || '')
  const [email, setEmail] = useState(currentUser?.email || 'amankamran2004@outlook.com')
  const [avatar, setAvatar] = useState(currentUser?.avatar || '')

  // Password state
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')

  // System Settings state
  const [companyName, setCompanyName] = useState(settings.companyName)
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol)
  const [lowStockDefault, setLowStockDefault] = useState(settings.lowStockThresholdDefault)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) return
    updateProfile(name, email, avatar || undefined)
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPass !== confirmPass) {
      toast.error('New passwords do not match.')
      return
    }
    if (newPass.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    toast.success('Password updated successfully!')
    setCurrentPass('')
    setNewPass('')
    setConfirmPass('')
  }

  const handleSaveSystemSettings = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings({
      companyName,
      currencySymbol,
      lowStockThresholdDefault: lowStockDefault,
    })
  }

  const isSystemAdmin = currentUser?.role === 'system_admin'

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-500" />
            Profile & System Preferences
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your account details, security credentials, theme, and company defaults.
          </p>
        </div>

        <Badge variant="outline" className="text-xs uppercase bg-indigo-500/10 text-indigo-500 border-indigo-500/30">
          Role: {currentUser?.role?.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personal Profile & Appearance */}
        <div className="lg:col-span-6 space-y-6">
          {/* Profile Card */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" />
                Personal Profile Information
              </CardTitle>
              <CardDescription className="text-xs">
                Update your display name and registered contact email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Full Display Name</Label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Email Address (Super Admin)</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="amankamran2004@outlook.com"
                      className="pl-8 h-8 text-xs font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    This email is used for primary system alerts and password reset routing.
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Avatar Image URL (Optional)</Label>
                  <Input
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://..."
                    className="h-8 text-xs"
                  />
                </div>

                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8">
                  Update Profile Details
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Theme & Visual Appearance */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                Theme & Interface Appearance
              </CardTitle>
              <CardDescription className="text-xs">
                Toggle between Light Mode, Dark Mode, or System default.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-2 transition-all ${
                    theme === 'light'
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Sun className="w-5 h-5 text-amber-500" />
                  <span>Light Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-2 transition-all ${
                    theme === 'dark'
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Moon className="w-5 h-5 text-indigo-400" />
                  <span>Dark Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-2 transition-all ${
                    theme === 'system'
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Laptop className="w-5 h-5 text-slate-400" />
                  <span>System Auto</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Security & System Settings */}
        <div className="lg:col-span-6 space-y-6">
          {/* Change Password Card */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-500" />
                Change Password & Access Key
              </CardTitle>
              <CardDescription className="text-xs">
                Update your login password for secure session management.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Current Password</Label>
                  <Input
                    type="password"
                    required
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="••••••••"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">New Password</Label>
                    <Input
                      type="password"
                      required
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="••••••••"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Confirm Password</Label>
                    <Input
                      type="password"
                      required
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="••••••••"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <Button type="submit" variant="outline" className="text-xs h-8 mt-1">
                  Save New Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* System Settings (Admin Only) */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-500" />
                Company Configuration & Defaults
              </CardTitle>
              <CardDescription className="text-xs">
                Global settings for currency, branding, and default thresholds.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSystemSettings} className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Organization / Brand Name</Label>
                  <Input
                    disabled={!isSystemAdmin}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Currency Prefix</Label>
                    <Input
                      disabled={!isSystemAdmin}
                      value={currencySymbol}
                      onChange={(e) => setCurrencySymbol(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Low Stock Threshold Default</Label>
                    <Input
                      type="number"
                      disabled={!isSystemAdmin}
                      value={lowStockDefault}
                      onChange={(e) => setLowStockDefault(parseInt(e.target.value) || 10)}
                      className="h-8 text-xs font-bold"
                    />
                  </div>
                </div>

                {isSystemAdmin ? (
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 mt-1">
                    Save System Defaults
                  </Button>
                ) : (
                  <p className="text-[10px] text-muted-foreground italic">
                    Company configurations are managed by the System Admin.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
