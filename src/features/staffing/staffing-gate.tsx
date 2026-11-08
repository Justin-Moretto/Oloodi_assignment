import type { ReactNode } from 'react'

import { SetupNotice } from '@/components/setup-notice'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { isSupabaseConfigured } from '@/lib/env'

import type { StaffingDashboard } from '@/features/staffing/api'
import { useStaffingQuery } from '@/features/staffing/use-staffing'

export function StaffingGate({
  children,
}: {
  children: (dashboard: StaffingDashboard) => ReactNode
}) {
  const query = useStaffingQuery()

  if (!isSupabaseConfigured) return <SetupNotice />

  if (query.isPending) {
    return <p className="text-sm text-muted-foreground">Loading shift…</p>
  }

  if (query.isError || !query.data) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load the shift</AlertTitle>
        <AlertDescription>
          {query.error instanceof Error ? query.error.message : 'Try again.'}
        </AlertDescription>
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
            Retry
          </Button>
        </div>
      </Alert>
    )
  }

  return children(query.data)
}
