import { assertSupabaseConfigured, supabase } from '@/lib/supabase/client'
import type { AssignmentRow, MutationResult, ShiftRow } from '@/types/database'

import { deriveCounts, type StaffingCounts } from '@/features/staffing/counts'

export interface StaffAssignment extends AssignmentRow {
  workerName: string
}

export interface StaffingData {
  shift: ShiftRow | null
  assignments: StaffAssignment[]
  counts: StaffingCounts
}

export type AssignmentAction =
  | { type: 'invite'; assignmentId: string }
  | { type: 'accept'; assignmentId: string }
  | { type: 'decline'; assignmentId: string }
  | { type: 'cancel'; assignmentId: string }
  | { type: 'check_in'; assignmentId: string }
  | { type: 'check_out'; assignmentId: string }

export async function fetchStaffing(): Promise<StaffingData> {
  assertSupabaseConfigured()

  const [shiftResult, workerResult, assignmentResult] = await Promise.all([
    supabase.from('shifts').select('*').order('date'),
    supabase.from('workers').select('*'),
    supabase.from('assignments').select('*'),
  ])

  const error = shiftResult.error ?? workerResult.error ?? assignmentResult.error
  if (error) throw new Error(error.message)

  const shift = shiftResult.data?.[0] ?? null
  const names = new Map((workerResult.data ?? []).map((worker) => [worker.id, worker.name]))
  const assignments = (assignmentResult.data ?? [])
    .filter((assignment) => shift !== null && assignment.shift_id === shift.id)
    .map((assignment) => ({
      ...assignment,
      workerName: names.get(assignment.worker_id) ?? 'Unknown worker',
    }))
    .sort((left, right) => left.workerName.localeCompare(right.workerName))

  return {
    shift,
    assignments,
    counts: deriveCounts(shift?.required_workers ?? 0, assignments),
  }
}

export async function runAssignmentAction(action: AssignmentAction): Promise<MutationResult> {
  assertSupabaseConfigured()
  const assignmentId = action.assignmentId

  switch (action.type) {
    case 'invite':
      return unwrap(await supabase.rpc('invite_worker', { p_assignment_id: assignmentId }))
    case 'accept':
    case 'decline':
      return unwrap(
        await supabase.rpc('respond_to_invitation', {
          p_assignment_id: assignmentId,
          p_response: action.type === 'accept' ? 'accept' : 'decline',
        }),
      )
    case 'cancel':
      return unwrap(await supabase.rpc('cancel_assignment', { p_assignment_id: assignmentId }))
    case 'check_in':
      return unwrap(await supabase.rpc('check_in_worker', { p_assignment_id: assignmentId }))
    case 'check_out':
      return unwrap(await supabase.rpc('check_out_worker', { p_assignment_id: assignmentId }))
  }
}

// A transport error throws. A rule rejection comes back as { ok: false } and is
// shown to the user as a toast, not thrown.
function unwrap(result: { data: unknown; error: { message: string } | null }): MutationResult {
  if (result.error) throw new Error(result.error.message)
  if (!isMutationResult(result.data)) throw new Error('Unexpected response from the database.')
  return result.data
}

function isMutationResult(value: unknown): value is MutationResult {
  if (typeof value !== 'object' || value === null) return false
  return (
    'ok' in value &&
    typeof value.ok === 'boolean' &&
    'code' in value &&
    typeof value.code === 'string' &&
    'message' in value &&
    typeof value.message === 'string'
  )
}
