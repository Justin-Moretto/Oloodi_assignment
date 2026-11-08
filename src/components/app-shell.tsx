import { NavLink, Outlet } from 'react-router'

import { cn } from '@/lib/utils'

const links = [
  { to: '/manager', label: 'Manager' },
  { to: '/worker', label: 'Worker' },
] as const

export function AppShell() {
  return (
    <div className="min-h-svh bg-muted/40">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Oloodi
            </p>
            <p className="text-sm font-semibold text-foreground">Live Staffing</p>
          </div>
          <nav aria-label="Primary" className="flex rounded-lg bg-muted p-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors',
                    isActive && 'bg-card text-foreground shadow-sm',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
