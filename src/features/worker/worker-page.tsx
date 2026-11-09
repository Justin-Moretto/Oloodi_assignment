import { Navigate, useSearchParams } from 'react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'

import type { StaffAssignment, StaffingData } from '@/features/staffing/api'
import { formatTimestamp } from '@/features/staffing/format'
import { ShiftCard } from '@/features/staffing/shift-card'
import { StaffingGate } from '@/features/staffing/staffing-gate'
import { AttendanceBadge, ParticipationBadge } from '@/features/staffing/status-badge'
import { useAssignmentAction } from '@/features/staffing/use-staffing'

export function WorkerPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <StaffingGate>{(data) => <WorkerView data={data} />}</StaffingGate>
    </div>
  )
}

function WorkerView({ data }: { data: StaffingData }) {
  const [params] = useSearchParams()
  const selectedId = params.get('worker')
  const selected =
    data.assignments.find((assignment) => assignment.worker_id === selectedId) ?? null

  if (!selected) return <Navigate to="/" replace />

  return (
    <>
      <PageHeader
        title={selected.workerName}
        description="Respond to an invitation, then check in and out."
      />
      <ShiftCard shift={data.shift} />

      <Card>
        <CardHeader>
          <CardTitle>Your assignment</CardTitle>
          <CardDescription>Invitation and attendance for this worker.</CardDescription>
        </CardHeader>
        <CardContent>
          <AssignmentDetails assignment={selected} />
        </CardContent>
      </Card>
    </>
  )
}

function AssignmentDetails({ assignment }: { assignment: StaffAssignment }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <ParticipationBadge status={assignment.participation_status} />
        <AttendanceBadge status={assignment.attendance_status} />
      </div>
      <AssignmentTimes assignment={assignment} />
      <WorkerActions assignment={assignment} />
    </div>
  )
}

function AssignmentTimes({ assignment }: { assignment: StaffAssignment }) {
  if (!assignment.checked_in_at && !assignment.checked_out_at) return null

  return (
    <dl className="grid gap-1 text-sm text-muted-foreground">
      {assignment.checked_in_at ? (
        <div className="flex justify-between gap-4">
          <dt>Checked in</dt>
          <dd className="text-foreground">{formatTimestamp(assignment.checked_in_at)}</dd>
        </div>
      ) : null}
      {assignment.checked_out_at ? (
        <div className="flex justify-between gap-4">
          <dt>Checked out</dt>
          <dd className="text-foreground">{formatTimestamp(assignment.checked_out_at)}</dd>
        </div>
      ) : null}
    </dl>
  )
}

function WorkerActions({ assignment }: { assignment: StaffAssignment }) {
  const action = useAssignmentAction()
  const busy = action.isPending && action.variables?.assignmentId === assignment.id
  const run = (type: 'accept' | 'decline' | 'cancel' | 'check_in' | 'check_out') => {
    action.mutate({ type, assignmentId: assignment.id })
  }

  if (assignment.participation_status === 'uninvited') {
    return <p className="text-sm text-muted-foreground">Waiting for an invitation.</p>
  }

  if (assignment.participation_status === 'invited') {
    return (
      <div className="flex gap-2">
        <Button disabled={busy} onClick={() => run('accept')}>
          Accept
        </Button>
        <Button variant="outline" disabled={busy} onClick={() => run('decline')}>
          Decline
        </Button>
      </div>
    )
  }

  if (assignment.participation_status === 'declined') {
    return <p className="text-sm text-muted-foreground">You declined this invitation.</p>
  }

  if (assignment.participation_status === 'cancelled') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          You cancelled. You can accept again if a spot is open.
        </p>
        <Button disabled={busy} onClick={() => run('accept')}>
          Accept again
        </Button>
      </div>
    )
  }

  if (assignment.attendance_status === 'not_started') {
    return (
      <div className="flex gap-2">
        <Button disabled={busy} onClick={() => run('check_in')}>
          Check in
        </Button>
        <Button variant="outline" disabled={busy} onClick={() => run('cancel')}>
          Cancel
        </Button>
      </div>
    )
  }

  if (assignment.attendance_status === 'checked_in') {
    return (
      <Button disabled={busy} onClick={() => run('check_out')}>
        Check out
      </Button>
    )
  }

  return <p className="text-sm text-muted-foreground">This shift is finished for you.</p>
}
