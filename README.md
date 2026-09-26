# 🧸 Snug N Play - Enterprise Web-Based Inventory Management System

A modern, high-performance web-based inventory management platform built for **Snug N Play** with Next.js, React 19, TypeScript, Tailwind CSS, Lucide Icons, and SheetJS (XLSX).

Deployed seamlessly on **Vercel** with zero external database prerequisites.

---

## 🌟 Key Features

### 1. 🔐 Multi-Tier Role Based Access Control (RBAC) & Login Portal
- **4 Granular User Roles**:
  - **System Admin**: Complete system control, add/edit users, assign roles, approve/reject password resets, database backups & global settings.
  - **Manager**: Inventory tracking, approvals, stock valuation, and advanced analytics.
  - **Operations**: Stock In / Stock Out, warehouse dispatches, Excel .XLSX bulk import/export, and stock adjustments.
  - **Accounts**: Inventory valuation, financial costing, stock profitability, and report exports.
- **Forgot Password Workflow**: Users request password resets directly to the System Admin's approval queue.
- **Default Super Admin**: `amankamran2004@outlook.com` (Editable in Profile Settings).

### 2. 📊 Executive KPI Dashboard
- Real-time KPI summary cards: Total SKUs, Total Units, Inventory Valuation, Retail Potential, Low Stock warnings (< 10 units), and Out of Stock alerts.
- Interactive **Recharts** charts:
  - Monthly Inflow vs Dispatch Stock Velocity (Area Chart)
  - Category Valuation Distribution (Donut Chart)
  - Low Stock Rapid Restock Action Panel

### 3. 📦 Inventory Master Catalog & Excel Engine
- Full CRUD: Add, Edit, Delete, Search, and Category/Warehouse filtering.
- **Excel Bulk Import (.xlsx / .csv)**: Drag-and-drop file upload with client-side parsing, column validation, and preview.
- **Excel Bulk Export**: One-click download of clean formatted spreadsheets.
- **Sample Template Generator**: One-click download of the standard Excel template for error-free importing.
- In-table Quick Stock Adjustment (+/-).

### 4. 💾 Automated & Manual 30-Day Backup System
- **30-Day Recurring Auto-Backup**: Scheduled snapshots tracking products, transactions, users, and settings.
- **Manual 1-Click Backup**: Instant JSON/Excel database snapshot generation & browser download.
- **System Snapshot Restore**: Upload and restore previous system states from JSON files.
- Backup Archives table with SHA-256 checksums and file size tracking.

### 5. 📈 Insights & Predictive Analytics
- Gross profit margin calculations per SKU.
- Dead Stock & Overstocked inventory detector (capital efficiency).
- Fast-Moving high-velocity product highlights.

### 6. 📋 Backup Reports & Audit Logs
- Immutable audit trail of every stock change, login, export, import, and backup event.
- Filter by module (Auth, Inventory, Stock, Backup, Users, Settings) with Excel export.

### 7. ⚙️ Profile & System Settings
- Personal profile info & custom avatar.
- Primary contact email (`amankamran2004@outlook.com`).
- Light Mode / Dark Mode / System Theme switcher with persistence.
- Company name & currency symbol customization (`PKR` / `Rs.`).

---

## 🚀 How to Run Locally

```bash
# 1. Install dependencies
pnpm install
# or
npm install

# 2. Run the development server
pnpm dev
# or
npm run dev

# 3. Open browser
http://localhost:3000
```

---

## 🚢 Deploying to Vercel via GitHub

1. **Commit & Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete Snug N Play VIP inventory management system"
   git push origin main
   ```
2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com) -> **Add New Project**.
   - Select your GitHub repository `snug-n-play-inventory-system`.
   - Click **Deploy** (No environment variables required for preview mode!).
