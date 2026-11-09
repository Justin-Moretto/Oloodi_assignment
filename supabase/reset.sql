-- Put the seeded shift back to the starting state.
-- Safe to re-run. Does not delete workers or the shift.
-- Attendance timestamps are cleared so the row still satisfies the
-- timestamp check constraint.

update public.assignments
set
  participation_status = 'uninvited',
  attendance_status = 'not_started',
  checked_in_at = null,
  checked_out_at = null
where shift_id = '11111111-1111-4111-8111-111111111111';
