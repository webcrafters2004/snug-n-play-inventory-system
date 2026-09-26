'use client'

import React, { useState, useRef } from 'react'
import { useInventory } from '@/context/inventory-context'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  HardDriveDownload,
  Calendar,
  Download,
  Upload,
  ShieldCheck,
  Trash2,
  Database,
  CheckCircle2,
} from 'lucide-react'

export function BackupView() {
  const { backups, createBackup, restoreBackup, deleteBackup, settings, updateSettings, currentUser } =
    useInventory()

  const restoreFileRef = useRef<HTMLInputElement>(null)

  const handleRestoreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (confirm('Restoring this backup will update current records with the snapshot data. Proceed?')) {
        restoreBackup(content)
      }
      if (restoreFileRef.current) restoreFileRef.current.value = ''
    }
    reader.readAsText(file)
  }

  const handleDownloadExistingBackup = (backupItem: any) => {
    if (!backupItem.downloadPayload) {
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
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <HardDriveDownload className="w-6 h-6 text-indigo-600" />
            Inventory Backups & System Safety
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automatic 30-day backups & 1-click manual exports to ensure your inventory data is always protected.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => createBackup('manual')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs h-10 px-4 rounded-2xl shadow-md shadow-indigo-600/20"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Download Full Backup Now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 30-Day Auto Backup Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">30-Day Automated Backup</h3>
                <p className="text-[11px] text-slate-400">Scheduled system snapshots every month</p>
              </div>
            </div>

            <Switch
              checked={settings.autoBackupEnabled}
              disabled={!canManageBackups}
              onCheckedChange={(checked) => updateSettings({ autoBackupEnabled: checked })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Last Backup</span>
              <span className="font-extrabold text-slate-900 dark:text-white">{settings.lastBackupDate || '2026-09-01'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Next Scheduled</span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{settings.nextBackupDate || '2026-10-01'}</span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>Auto-backup is enabled. All products and logs are securely backed up.</span>
          </div>
        </div>

        {/* Restore Backup Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Restore from Backup</h3>
              <p className="text-[11px] text-slate-400">Upload a previous JSON backup file</p>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Select a saved Snug N Play JSON backup file from your device to recover your inventory catalog.
          </p>

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
            className="w-full h-10 text-xs font-bold rounded-2xl border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-600 gap-2"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            Upload & Restore Backup (.json)
          </Button>
        </div>
      </div>

      {/* Backup History Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Saved Backup Archives ({backups.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4">Snapshot Name</th>
                <th className="p-4 text-center">Type</th>
                <th className="p-4 text-right">Size</th>
                <th className="p-4 text-right">Records</th>
                <th className="p-4">Date Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {backups.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{b.name}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      b.type === 'automated' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {b.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono">{b.sizeKb} KB</td>
                  <td className="p-4 text-right font-black">{b.recordsCount} items</td>
                  <td className="p-4 text-slate-400 whitespace-nowrap">{b.createdAt}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownloadExistingBackup(b)}
                        className="h-8 w-8 p-0 text-indigo-600 hover:bg-indigo-50"
                        title="Download Backup"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      {canManageBackups && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteBackup(b.id)}
                          className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
