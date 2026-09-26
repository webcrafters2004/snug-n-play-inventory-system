import { InventoryProvider } from '@/context/inventory-context'
import { InventoryApp } from '@/components/inventory-app'

export default function Page() {
  return (
    <InventoryProvider>
      <InventoryApp />
    </InventoryProvider>
  )
}
