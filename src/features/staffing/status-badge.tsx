import { Badge } from '@/components/ui/badge'
import type { AttendanceStatus, ParticipationStatus } from '@/types/database'

const participationLabel: Record<ParticipationStatus, string> = {
  uninvited: 'Uninvited',
  invited: 'Invited',
  accepted: 'Accepted',
  declined: 'Declined',
  cancelled: 'Cancelled',
}

const attendanceLabel: Record<AttendanceStatus, string> = {
  not_started: 'Not started',
  checked_in: 'Checked in',
  checked_out: 'Checked out',
}

const toneClass = {
  grey: 'border-transparent bg-zinc-100 text-zinc-600',
  yellow: 'border-transparent bg-yellow-100 text-yellow-800',
  green: 'border-transparent bg-green-100 text-green-800',
  red: 'border-transparent bg-red-100 text-red-700',
  blue: 'border-transparent bg-blue-100 text-blue-800',
} as const

const participationTone = {
  uninvited: 'grey',
  invited: 'yellow',
  accepted: 'green',
  declined: 'red',
  cancelled: 'red',
} as const satisfies Record<ParticipationStatus, keyof typeof toneClass>

const attendanceTone = {
  not_started: 'grey',
  checked_in: 'green',
  checked_out: 'blue',
} as const satisfies Record<AttendanceStatus, keyof typeof toneClass>

export function ParticipationBadge({ status }: { status: ParticipationStatus }) {
  return (
    <Badge variant="outline" className={toneClass[participationTone[status]]}>
      {participationLabel[status]}
    </Badge>
  )
}

export function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  return (
    <Badge variant="outline" className={toneClass[attendanceTone[status]]}>
      {attendanceLabel[status]}
    </Badge>
  )
}
