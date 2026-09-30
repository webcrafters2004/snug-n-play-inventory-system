/**
 * Date filtering helper for Snug N Play Inventory System
 * Handles date parsing across various formats (ISO, US, Localized, Mock)
 */

export function parseDateOnly(dateStr?: string): string | null {
  if (!dateStr) return null

  // 1. Try ISO pattern: YYYY-MM-DD
  const isoMatch = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (isoMatch) {
    const y = isoMatch[1]
    const m = isoMatch[2].padStart(2, '0')
    const d = isoMatch[3].padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  // 2. Try US slash pattern: MM/DD/YYYY or M/D/YYYY
  const slashMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (slashMatch) {
    const m = slashMatch[1].padStart(2, '0')
    const d = slashMatch[2].padStart(2, '0')
    const y = slashMatch[3]
    return `${y}-${m}-${d}`
  }

  // 3. Fallback to JavaScript Date
  const parsed = new Date(dateStr)
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear()
    const m = String(parsed.getMonth() + 1).padStart(2, '0')
    const d = String(parsed.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  return null
}

export function isDateInRange(dateStr?: string, fromDate?: string, toDate?: string): boolean {
  if (!fromDate && !toDate) return true

  const itemDate = parseDateOnly(dateStr)
  if (!itemDate) return true // Don't hide if date cannot be parsed

  if (fromDate && itemDate < fromDate) {
    return false
  }

  if (toDate && itemDate > toDate) {
    return false
  }

  return true
}

export function getTodayDateString(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
