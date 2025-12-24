import { Outlet } from '@tanstack/react-router'
import { AppShell } from '@/components/layout'

/**
 * Root layout component that wraps all routes with the AppShell
 */
export function RootLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
