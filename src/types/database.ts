export type ParticipationStatus =
  | 'uninvited'
  | 'invited'
  | 'accepted'
  | 'declined'
  | 'cancelled'

export type AttendanceStatus = 'not_started' | 'checked_in' | 'checked_out'

export type MutationCode =
  | 'invited'
  | 'already_invited'
  | 'accepted'
  | 'already_accepted'
  | 'declined'
  | 'already_declined'
  | 'cancelled'
  | 'already_cancelled'
  | 'checked_in'
  | 'already_checked_in'
  | 'checked_out'
  | 'already_checked_out'
  | 'illegal_transition'
  | 'shift_full'
  | 'not_found'

export interface MutationResult {
  ok: boolean
  code: MutationCode
  message: string
}

export interface ShiftRow {
  id: string
  title: string
  date: string
  start_time: string
  end_time: string
  location: string
  required_workers: number
}

export interface WorkerRow {
  id: string
  name: string
}

export interface AssignmentRow {
  id: string
  shift_id: string
  worker_id: string
  participation_status: ParticipationStatus
  attendance_status: AttendanceStatus
  checked_in_at: string | null
  checked_out_at: string | null
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      shifts: {
        Row: ShiftRow
        Insert: Omit<ShiftRow, 'id'> & { id?: string }
        Update: Partial<ShiftRow>
        Relationships: []
      }
      workers: {
        Row: WorkerRow
        Insert: Omit<WorkerRow, 'id'> & { id?: string }
        Update: Partial<WorkerRow>
        Relationships: []
      }
      assignments: {
        Row: AssignmentRow
        Insert: Omit<AssignmentRow, 'id' | 'updated_at'> & {
          id?: string
          updated_at?: string
        }
        Update: Partial<AssignmentRow>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      invite_worker: {
        Args: { p_assignment_id: string }
        Returns: MutationResult
      }
      respond_to_invitation: {
        Args: { p_assignment_id: string; p_response: 'accept' | 'decline' }
        Returns: MutationResult
      }
      cancel_assignment: {
        Args: { p_assignment_id: string }
        Returns: MutationResult
      }
      check_in_worker: {
        Args: { p_assignment_id: string }
        Returns: MutationResult
      }
      check_out_worker: {
        Args: { p_assignment_id: string }
        Returns: MutationResult
      }
    }
    Enums: {
      participation_status: ParticipationStatus
      attendance_status: AttendanceStatus
    }
    CompositeTypes: Record<string, never>
  }
}
