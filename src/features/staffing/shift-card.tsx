import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ShiftRow } from '@/types/database'

import type { StaffingCounts } from '@/features/staffing/counts'
import { formatShiftSchedule } from '@/features/staffing/format'

export function ShiftCard({
  shift,
  counts,
}: {
  shift: ShiftRow | null
  counts?: StaffingCounts
}) {
  if (!shift) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No shift</CardTitle>
          <CardDescription>The database has no shift row yet.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{shift.title}</CardTitle>
        <CardDescription>
          {formatShiftSchedule(shift)} · {shift.location}
        </CardDescription>
      </CardHeader>
      {counts ? (
        <CardContent className="text-sm text-muted-foreground">
          {counts.filled} of {shift.required_workers} spots filled.
          {counts.remaining === 0 ? ' This shift is fully staffed.' : ''}
        </CardContent>
      ) : null}
    </Card>
  )
}
