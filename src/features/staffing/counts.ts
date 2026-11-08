import type { AssignmentRow } from '@/types/database'

export interface StaffingCounts {
  filled: number
  remaining: number
  checkedIn: number
  checkedOut: number
}

export function deriveCounts(
  requiredWorkers: number,
  assignments: Pick<AssignmentRow, 'participation_status' | 'attendance_status'>[],
): StaffingCounts {
  const filled = assignments.filter(
    (assignment) => assignment.participation_status === 'accepted',
  ).length
  const checkedIn = assignments.filter(
    (assignment) => assignment.attendance_status === 'checked_in',
  ).length
  const checkedOut = assignments.filter(
    (assignment) => assignment.attendance_status === 'checked_out',
  ).length

  return {
    filled,
    remaining: Math.max(requiredWorkers - filled, 0),
    checkedIn,
    checkedOut,
  }
}
