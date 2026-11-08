import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'

import type { StaffAssignment, StaffingDashboard } from '@/features/staffing/api'
import { formatTimestamp } from '@/features/staffing/format'
import { ShiftCard } from '@/features/staffing/shift-card'
import { StaffingGate } from '@/features/staffing/staffing-gate'
import { AttendanceBadge, ParticipationBadge } from '@/features/staffing/status-badge'
import { useAssignmentAction } from '@/features/staffing/use-staffing'

export function ManagerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Manager dashboard"
        description="Invite workers and watch participation and attendance update live."
      />
      <StaffingGate>{(dashboard) => <ManagerDashboard dashboard={dashboard} />}</StaffingGate>
    </div>
  )
}

function ManagerDashboard({ dashboard }: { dashboard: StaffingDashboard }) {
  const action = useAssignmentAction()
  const { shift, assignments, counts } = dashboard
  const pendingId = action.isPending ? action.variables?.assignmentId : undefined

  const stats = [
    { label: 'Filled', value: counts.filled, hint: 'Accepted workers' },
    { label: 'Remaining', value: counts.remaining, hint: 'Open positions' },
    { label: 'Checked in', value: counts.checkedIn, hint: 'On site now' },
    { label: 'Checked out', value: counts.checkedOut, hint: 'Finished' },
  ] as const

  return (
    <>
      <ShiftCard shift={shift} counts={counts} />

      {shift ? (
        <section aria-label="Staffing summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} size="sm">
              <CardHeader>
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-2xl tabular-nums">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">{stat.hint}</CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      {shift ? (
        <Card>
          <CardHeader>
            <CardTitle>Workers</CardTitle>
            <CardDescription>
              Invite uninvited or declined workers. Cancelled workers accept again themselves.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No workers are on this shift.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Participation</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <WorkerRow
                      key={assignment.id}
                      assignment={assignment}
                      pending={pendingId === assignment.id}
                      onInvite={() =>
                        action.mutate({ type: 'invite', assignmentId: assignment.id })
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : null}
    </>
  )
}

function WorkerRow({
  assignment,
  pending,
  onInvite,
}: {
  assignment: StaffAssignment
  pending: boolean
  onInvite: () => void
}) {
  const canInvite =
    assignment.participation_status === 'uninvited' ||
    assignment.participation_status === 'declined'

  return (
    <TableRow>
      <TableCell className="font-medium">{assignment.workerName}</TableCell>
      <TableCell>
        <ParticipationBadge status={assignment.participation_status} />
      </TableCell>
      <TableCell>
        <AttendanceBadge status={assignment.attendance_status} />
      </TableCell>
      <TableCell>
        {canInvite ? (
          <Button
            size="sm"
            className="bg-zinc-900 text-white hover:bg-zinc-700"
            disabled={pending}
            onClick={onInvite}
          >
            Invite
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">{managerNote(assignment)}</span>
        )}
      </TableCell>
    </TableRow>
  )
}

function managerNote(assignment: StaffAssignment): string {
  if (assignment.participation_status === 'invited') return 'Awaiting response'
  if (assignment.participation_status === 'cancelled') return 'Worker can accept again'
  if (assignment.checked_in_at && assignment.attendance_status === 'checked_in') {
    return `Checked in ${formatTimestamp(assignment.checked_in_at)}`
  }
  if (assignment.checked_out_at && assignment.attendance_status === 'checked_out') {
    return `Checked out ${formatTimestamp(assignment.checked_out_at)}`
  }
  return 'Not checked in'
}
