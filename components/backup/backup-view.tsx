'use client'

import React, { useState, useRef } from 'react'
import { useInventory } from '@/context/inventory-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  HardDriveDownload,
  Calendar,
  Download,
  Upload,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  FileCode,
  Sparkles,
  AlertCircle,
  Database,
} from 'lucide-react'
import { toast } from 'sonner'

export function BackupView() {
  const { backups, createBackup, restoreBackup, deleteBackup, settings, updateSettings, currentUser } =
    useInventory()

  const [customBackupName, setCustomBackupName] = useState('')
  const [isRestoring, setIsRestoring] = useState(false)
  const restoreFileRef = useRef<HTMLInputElement>(null)

  const handleManualBackupClick = () => {
    createBackup('manual', customBackupName ? `${customBackupName}.json` : undefined)
    setCustomBackupName('')
  }

  const handleRestoreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (confirm('Restoring this backup will replace current memory records with snapshot data. Proceed?')) {
        restoreBackup(content)
      }
      if (restoreFileRef.current) restoreFileRef.current.value = ''
    }
    reader.readAsText(file)
  }

  const handleDownloadExistingBackup = (backupItem: any) => {
    if (!backupItem.downloadPayload) {
      // Generate on the fly if not in payload
      createBackup('manual', backupItem.name)
      return
    }
    const blob = new Blob([backupItem.downloadPayload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = backupItem.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const canManageBackups = currentUser?.role === 'system_admin'

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <HardDriveDownload className="w-5 h-5 text-indigo-500" />
            Automated & Manual Backup Engine
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure 30-day recurring backup cycles, generate instant JSON snapshots, and restore system state.
          </p>
        </div>

        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs gap-1.5 self-start sm:self-auto py-1 px-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Auto-Backup Active
        </Badge>
      </div>

      {/* Grid: 30-Day Automated Config vs Manual Backup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 30-Day Recurring Scheduler Card */}
        <Card className="lg:col-span-6 border-border shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                30-Day Automated Backup Cycle
              </CardTitle>
              <Switch
                checked={settings.autoBackupEnabled}
                disabled={!canManageBackups}
                onCheckedChange={(checked) => updateSettings({ autoBackupEnabled: checked })}
              />
            </div>
            <CardDescription className="text-xs">
              Automatically creates a complete snapshot of products, transactions, and users every 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px]">Last Auto Backup</span>
                <strong className="text-foreground">{settings.lastBackupDate || '2026-09-01'}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Next Scheduled Backup</span>
                <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                  {settings.nextBackupDate || '2026-10-01'}
                </strong>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Backup Frequency (Days)</Label>
              <Input
                type="number"
                min="1"
                max="90"
                disabled={!canManageBackups}
                value={settings.backupFrequencyDays}
                onChange={(e) => updateSettings({ backupFrequencyDays: parseInt(e.target.value) || 30 })}
                className="h-8 text-xs font-bold"
              />
              <p className="text-[10px] text-muted-foreground">
                Set to 30 days for standard enterprise monthly audit snapshots.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Automated backups are cryptographically validated with SHA-256 checksums and saved to local & cloud storage.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Manual Instant Backup & Restore Card */}
        <Card className="lg:col-span-6 border-border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              Manual Snapshot & Recovery
            </CardTitle>
            <CardDescription className="text-xs">
              Take an immediate full system export or restore data from a previous JSON snapshot.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create Manual Backup */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Custom Snapshot Name (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  value={customBackupName}
                  onChange={(e) => setCustomBackupName(e.target.value)}
                  placeholder="e.g. Pre_Stocktake_Audit_Sep26"
                  className="h-8 text-xs font-mono"
                />
                <Button
                  onClick={handleManualBackupClick}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 gap-1.5 shadow-xs whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  Backup Now
                </Button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-border" />
              <span className="flex-shrink mx-3 text-[10px] text-muted-foreground uppercase font-semibold">
                Or Restore Snapshot
              </span>
              <div className="flex-grow border-t border-border" />
            </div>

            {/* Restore from File */}
            <div className="space-y-2">
              <input
                ref={restoreFileRef}
                type="file"
                accept=".json"
                onChange={handleRestoreFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                disabled={!canManageBackups}
                onClick={() => restoreFileRef.current?.click()}
                className="w-full h-9 text-xs border-dashed border-border hover:border-indigo-500 gap-2 hover:bg-muted"
              >
                <Upload className="w-4 h-4 text-indigo-500" />
                Upload & Restore from JSON Snapshot
              </Button>
              {!canManageBackups && (
                <p className="text-[10px] text-destructive text-center">
                  Only System Admin has permissions to restore database snapshots.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup Archives Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-500" />
              Backup Archives & Snapshot History
            </CardTitle>
            <CardDescription className="text-xs">
              All 30-day automated monthly snapshots and manual dumps.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {backups.length} Snapshots
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/70 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">Snapshot Name</th>
                  <th className="p-3 text-center">Type</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Size (KB)</th>
                  <th className="p-3 text-right">Records</th>
                  <th className="p-3">Created By</th>
                  <th className="p-3">Created Date</th>
                  <th className="p-3 font-mono">Checksum</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {backups.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-muted-foreground text-xs">
                      No backups generated yet. Click "Backup Now" to create your first snapshot.
                    </td>
                  </tr>
                ) : (
                  backups.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/30">
                      <td className="p-3 font-mono font-medium text-foreground">{b.name}</td>
                      <td className="p-3 text-center">
                        <Badge
                          variant="outline"
                          className={
                            b.type === 'automated'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[9px]'
                              : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[9px]'
                          }
                        >
                          {b.type === 'automated' ? '30-DAY AUTO' : 'MANUAL'}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[9px]">
                          COMPLETED
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-mono">{b.sizeKb} KB</td>
                      <td className="p-3 text-right font-bold">{b.recordsCount}</td>
                      <td className="p-3 text-muted-foreground truncate max-w-[150px]">{b.createdBy}</td>
                      <td className="p-3 text-muted-foreground whitespace-nowrap">{b.createdAt}</td>
                      <td className="p-3 font-mono text-[10px] text-muted-foreground">{b.checksum}</td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadExistingBackup(b)}
                            className="h-7 w-7 p-0 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                            title="Download JSON Snapshot"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                          {canManageBackups && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm(`Remove backup archive record "${b.name}"?`)) {
                                  deleteBackup(b.id)
                                }
                              }}
                              className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
