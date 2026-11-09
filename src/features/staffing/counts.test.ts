import { describe, expect, it } from 'vitest'

import { deriveCounts } from '@/features/staffing/counts'
import type { AttendanceStatus, ParticipationStatus } from '@/types/database'

function row(participation: ParticipationStatus, attendance: AttendanceStatus) {
  return { participation_status: participation, attendance_status: attendance }
}

describe('deriveCounts', () => {
  it('counts every accepted worker as filled, including checked in and checked out', () => {
    const counts = deriveCounts(3, [
      row('accepted', 'not_started'),
      row('accepted', 'checked_in'),
      row('accepted', 'checked_out'),
      row('invited', 'not_started'),
      row('declined', 'not_started'),
      row('cancelled', 'not_started'),
      row('uninvited', 'not_started'),
    ])

    expect(counts).toEqual({
      filled: 3,
      remaining: 0,
      checkedIn: 1,
      checkedOut: 1,
    })
  })

  it('ignores workers who have not accepted', () => {
    const counts = deriveCounts(3, [
      row('uninvited', 'not_started'),
      row('invited', 'not_started'),
      row('declined', 'not_started'),
      row('cancelled', 'not_started'),
    ])

    expect(counts).toEqual({
      filled: 0,
      remaining: 3,
      checkedIn: 0,
      checkedOut: 0,
    })
  })

  it('does not let remaining drop below zero', () => {
    const counts = deriveCounts(1, [
      row('accepted', 'checked_in'),
      row('accepted', 'checked_out'),
    ])

    expect(counts.filled).toBe(2)
    expect(counts.remaining).toBe(0)
  })
})
