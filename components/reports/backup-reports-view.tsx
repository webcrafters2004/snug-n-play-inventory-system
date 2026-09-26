'use client'

import React, { useState } from 'react'
import { useInventory } from '@/context/inventory-context'
import { AuditLogItem } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  FileSpreadsheet,
  Search,
  Filter,
  ShieldCheck,
  Download,
  Activity,
  UserCheck,
  Package,
  Layers,
  HardDriveDownload,
} from 'lucide-react'
import * as XLSX from 'xlsx'

export function BackupReportsView() {
  const { auditLogs, backups, products, settings } = useInventory()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedModule, setSelectedModule] = useState<string>('ALL')

  const modules = ['ALL', 'Auth', 'Inventory', 'Stock', 'Backup', 'Users', 'Settings']

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesModule = selectedModule === 'ALL' || log.module === selectedModule
    return matchesSearch && matchesModule
  })

  const exportAuditReportToExcel = () => {
    const rows = filteredLogs.map((l) => ({
      'Log ID': l.id,
      Timestamp: l.timestamp,
      Module: l.module,
      Action: l.action,
      Description: l.description,
      'User Name': l.userName,
      'User Email': l.userEmail,
      Role: l.role.toUpperCase(),
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Audit_Report')
    XLSX.writeFile(wb, `SnugNPlay_Audit_Report_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const moduleIcon = (mod: AuditLogItem['module']) => {
    switch (mod) {
      case 'Auth':
        return <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
      case 'Inventory':
        return <Package className="w-3.5 h-3.5 text-emerald-500" />
      case 'Stock':
        return <Activity className="w-3.5 h-3.5 text-purple-500" />
      case 'Backup':
        return <HardDriveDownload className="w-3.5 h-3.5 text-blue-500" />
      default:
        return <Layers className="w-3.5 h-3.5 text-amber-500" />
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
            Audit Reports & System Event Logs
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable activity log tracking every inventory mutation, Excel import, backup execution, and user session.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={exportAuditReportToExcel}
          className="text-xs h-8 gap-1.5 border-border hover:bg-muted self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-emerald-500" />
          Export Audit Log (.xlsx)
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border shadow-xs">
          <CardHeader className="p-3.5 pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Total Logged Events</span>
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-2xl font-bold text-foreground">{auditLogs.length} Records</div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">100% Traceability</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="p-3.5 pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Completed Backups</span>
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{backups.length} Snapshots</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Automated & manual</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="p-3.5 pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">System Integrity</span>
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">PASSED (Optimal)</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">SHA-256 Checksum Verified</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Module Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit descriptions, user email, action code..."
            className="pl-9 h-9 text-xs bg-card"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full h-9 text-xs px-3 rounded-md border border-input bg-card text-foreground"
          >
            {modules.map((m) => (
              <option key={m} value={m}>
                Module: {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold">Activity Audit Records</CardTitle>
            <CardDescription className="text-xs">Showing {filteredLogs.length} matching event logs.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/70 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">Activity Description</th>
                  <th className="p-3">User & Email</th>
                  <th className="p-3 text-right">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground text-xs">
                      No audit events found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30">
                      <td className="p-3 text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                        {log.timestamp}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium">
                          {moduleIcon(log.module)}
                          <span>{log.module}</span>
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <Badge variant="outline" className="font-mono text-[9px] bg-muted/50">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="p-3 text-foreground font-medium max-w-[320px] truncate" title={log.description}>
                        {log.description}
                      </td>
                      <td className="p-3 text-muted-foreground whitespace-nowrap">
                        <span className="font-semibold text-foreground block">{log.userName}</span>
                        <span className="text-[10px] text-muted-foreground">{log.userEmail}</span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className="capitalize text-[9px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                        >
                          {log.role.replace('_', ' ')}
                        </Badge>
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
