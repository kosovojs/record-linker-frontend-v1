import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Database,
  FolderKanban,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { uiSelectors, uiActions } from '@/store/slices'

interface NavItem {
  label: string
  icon: ReactNode
  href: string
  active?: boolean
}

const navItems: NavItem[] = [
  { label: 'Datasets', icon: <Database className="h-4 w-4" />, href: '/datasets' },
  { label: 'Projects', icon: <FolderKanban className="h-4 w-4" />, href: '/projects' },
  { label: 'Properties', icon: <Settings className="h-4 w-4" />, href: '/properties' },
]

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const dispatch = useAppDispatch()
  const collapsed = useAppSelector(uiSelectors.sidebarCollapsed)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r bg-card transition-all duration-200',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center border-b px-4">
          {!collapsed && (
            <span className="font-semibold text-lg">Record Linker</span>
          )}
          {collapsed && <span className="font-bold text-lg">RL</span>}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={item.active ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3',
                  collapsed && 'justify-center px-2'
                )}
                asChild
              >
                <a href={item.href}>
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </a>
              </Button>
            ))}
          </nav>
        </ScrollArea>

        <Separator />

        {/* Collapse toggle */}
        <div className="p-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-full"
            onClick={() => dispatch(uiActions.toggleSidebar())}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="h-full">{children}</div>
      </main>
    </div>
  )
}
