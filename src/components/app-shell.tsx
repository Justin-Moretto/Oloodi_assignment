import { Link, Outlet, useLocation } from 'react-router'

import { Button } from '@/components/ui/button'
import { ConnectionStatus } from '@/features/staffing/connection-status'
import { useAssignmentRealtime } from '@/features/staffing/use-staffing'

export function AppShell() {
  const connection = useAssignmentRealtime()
  const location = useLocation()
  const onRolePicker = location.pathname === '/'

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-slate-800/50 bg-header">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs font-medium tracking-wide text-primary uppercase">
              Oloodi
            </p>
            <p className="text-sm font-semibold text-foreground">Live Staffing</p>
          </div>
          <div className="flex items-center gap-4">
            <ConnectionStatus state={connection} />
            {onRolePicker ? null : (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-transparent hover:text-primary"
                asChild
              >
                <Link to="/">Switch user</Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
