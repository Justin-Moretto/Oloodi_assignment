-- Rules for participation, attendance, repeated actions, and capacity.
-- Run the whole script in the Supabase SQL editor. It inserts a throwaway
-- shift, checks the functions, then rolls the transaction back. The seeded
-- demo rows are not changed. If a check fails, the script stops with an
-- error; run `rollback;` if the editor leaves the transaction open.

begin;

do $$
declare
  v_shift uuid := gen_random_uuid();
  v_worker_a uuid := gen_random_uuid();
  v_worker_b uuid := gen_random_uuid();
  v_worker_c uuid := gen_random_uuid();
  v_a uuid := gen_random_uuid();
  v_b uuid := gen_random_uuid();
  v_c uuid := gen_random_uuid();
  v_missing uuid := '00000000-0000-4000-8000-000000000099';
  v_result jsonb;
  v_checked_in timestamptz;
  v_checked_out timestamptz;
  v_filled integer;
  v_rows integer;
  v_read integer;
begin
  insert into public.shifts (id, title, date, start_time, end_time, location, required_workers)
  values (v_shift, 'Rule check', current_date, '09:00', '17:00', 'Test hall', 2);

  insert into public.workers (id, name)
  values
    (v_worker_a, 'Rule check A'),
    (v_worker_b, 'Rule check B'),
    (v_worker_c, 'Rule check C');

  insert into public.assignments (id, shift_id, worker_id)
  values
    (v_a, v_shift, v_worker_a),
    (v_b, v_shift, v_worker_b),
    (v_c, v_shift, v_worker_c);

  v_result := public.invite_worker(v_missing);
  if v_result->>'code' is distinct from 'not_found' or (v_result->>'ok')::boolean then
    raise exception 'missing assignment should not be found: %', v_result;
  end if;

  v_result := public.respond_to_invitation(v_a, 'maybe');
  if v_result->>'code' is distinct from 'illegal_transition' or (v_result->>'ok')::boolean then
    raise exception 'unknown response should be rejected: %', v_result;
  end if;

  v_result := public.respond_to_invitation(v_a, 'decline');
  if v_result->>'code' is distinct from 'illegal_transition' or (v_result->>'ok')::boolean then
    raise exception 'uninvited worker should not decline: %', v_result;
  end if;

  v_result := public.respond_to_invitation(v_a, 'accept');
  if v_result->>'code' is distinct from 'illegal_transition' or (v_result->>'ok')::boolean then
    raise exception 'uninvited worker should not accept: %', v_result;
  end if;

  v_result := public.cancel_assignment(v_a);
  if v_result->>'code' is distinct from 'illegal_transition' or (v_result->>'ok')::boolean then
    raise exception 'uninvited worker should not cancel: %', v_result;
  end if;

  v_result := public.check_in_worker(v_a);
  if v_result->>'code' is distinct from 'illegal_transition' or (v_result->>'ok')::boolean then
    raise exception 'uninvited worker should not check in: %', v_result;
  end if;

  v_result := public.invite_worker(v_a);
  if v_result->>'code' is distinct from 'invited' or not (v_result->>'ok')::boolean then
    raise exception 'invite should succeed: %', v_result;
  end if;

  v_result := public.invite_worker(v_a);
  if v_result->>'code' is distinct from 'already_invited' or not (v_result->>'ok')::boolean then
    raise exception 'second invite should keep the existing invitation: %', v_result;
  end if;

  select count(*) into v_rows from public.assignments where worker_id = v_worker_a;
  if v_rows <> 1 then
    raise exception 'repeated invite created % assignment rows', v_rows;
  end if;

  v_result := public.check_out_worker(v_a);
  if v_result->>'code' is distinct from 'illegal_transition' or (v_result->>'ok')::boolean then
    raise exception 'invited worker should not check out: %', v_result;
  end if;

  v_result := public.respond_to_invitation(v_a, 'decline');
  if v_result->>'code' is distinct from 'declined' or not (v_result->>'ok')::boolean then
    raise exception 'decline should succeed: %', v_result;
  end if;

  v_result := public.respond_to_invitation(v_a, 'decline');
  if v_result->>'code' is distinct from 'already_declined' or not (v_result->>'ok')::boolean then
    raise exception 'second decline should be a no-op: %', v_result;
  end if;

  v_result := public.respond_to_invitation(v_a, 'accept');
  if v_result->>'code' is distinct from 'illegal_transition' or (v_result->>'ok')::boolean then
    raise exception 'declined worker should not accept without a new invite: %', v_result;
  end if;

  v_result := public.invite_worker(v_a);
  if v_result->>'code' is distinct from 'invited' then
    raise exception 'declined worker should be invitable again: %', v_result;
  end if;

  v_result := public.respond_to_invitation(v_a, 'accept');
  if v_result->>'code' is distinct from 'accepted' or not (v_result->>'ok')::boolean then
    raise exception 'accept should succeed: %', v_result;
  end if;

  v_result := public.respond_to_invitation(v_a, 'decline');
  if v_result->>'code' is distinct from 'illegal_transition' or (v_result->>'ok')::boolean then
    raise exception 'accepted worker should cancel, not decline: %', v_result;
  end if;

  v_result := public.invite_worker(v_a);
  if v_result->>'code' is distinct from 'illegal_transition' or (v_result->>'ok')::boolean then
    raise exception 'accepted worker should not be invited again: %', v_result;
  end if;

  v_result := public.check_out_worker(v_a);
  if v_result->>'code' is distinct from 'illegal_transition' or (v_result->>'ok')::boolean then
    raise exception 'worker who has not checked in should not check out: %', v_result;
  end if;

  v_result := public.cancel_assignment(v_a);
  if v_result->>'code' is distinct from 'cancelled' or not (v_result->>'ok')::boolean then
    raise exception 'accepted worker should be able to cancel before check-in: %', v_result;
  end if;

  v_result := public.cancel_assignment(v_a);
  if v_result->>'code' is distinct from 'already_cancelled' or not (v_result->>'ok')::boolean then
    raise exception 'second cancel should be a no-op: %', v_result;
  end if;

  v_result := public.invite_worker(v_a);
  if v_result->>'code' is distinct from 'illegal_transition' or (v_result->>'ok')::boolean then
    raise exception 'cancelled worker should accept again, not be re-invited: %', v_result;
  end if;

  v_result := public.check_in_worker(v_a);
  if v_result->>'code' is distinct from 'illegal_transition' or (v_result->>'ok')::boolean then
    raise exception 'cancelled worker should not check in: %', v_result;
  end if;

  v_result := public.respond_to_invitation(v_a, 'accept');
  if v_result->>'code' is distinct from 'accepted' or not (v_result->>'ok')::boolean then
    raise exception 'cancelled worker should accept again: %', v_result;
  end if;

  v_result := public.check_in_worker(v_a);
  if v_result->>'code' is distinct from 'checked_in' or not (v_result->>'ok')::boolean then
    raise exception 'check-in should succeed: %', v_result;
  end if;

  select checked_in_at
  into v_checked_in
  from public.assignments
  where id = v_a
    and participation_status = 'accepted'
    and attendance_status = 'checked_in';

  if v_checked_in is null then
    raise exception 'check-in should record a timestamp and keep participation accepted';
  end if;

  v_result := public.check_in_worker(v_a);
  if v_result->>'code' is distinct from 'already_checked_in' or not (v_result->>'ok')::boolean then
    raise exception 'repeated check-in should keep the original time: %', v_result;
  end if;

  perform 1
  from public.assignments
  where id = v_a
    and checked_in_at = v_checked_in;
  if not found then
    raise exception 'repeated check-in changed checked_in_at';
  end if;

  v_result := public.cancel_assignment(v_a);
  if v_result->>'code' is distinct from 'illegal_transition' or (v_result->>'ok')::boolean then
    raise exception 'checked-in worker should not cancel: %', v_result;
  end if;

  v_result := public.check_out_worker(v_a);
  if v_result->>'code' is distinct from 'checked_out' or not (v_result->>'ok')::boolean then
    raise exception 'check-out should succeed: %', v_result;
  end if;

  select checked_out_at
  into v_checked_out
  from public.assignments
  where id = v_a
    and participation_status = 'accepted'
    and attendance_status = 'checked_out'
    and checked_in_at = v_checked_in;

  if v_checked_out is null then
    raise exception 'check-out should keep the check-in time and record a check-out time';
  end if;

  v_result := public.check_out_worker(v_a);
  if v_result->>'code' is distinct from 'already_checked_out' or not (v_result->>'ok')::boolean then
    raise exception 'repeated check-out should keep the original time: %', v_result;
  end if;

  perform 1
  from public.assignments
  where id = v_a
    and checked_in_at = v_checked_in
    and checked_out_at = v_checked_out;
  if not found then
    raise exception 'repeated check-out changed a timestamp';
  end if;

  v_result := public.check_in_worker(v_a);
  if v_result->>'code' is distinct from 'illegal_transition' or (v_result->>'ok')::boolean then
    raise exception 'checked-out worker should not check in again: %', v_result;
  end if;

  v_result := public.cancel_assignment(v_a);
  if v_result->>'code' is distinct from 'illegal_transition' or (v_result->>'ok')::boolean then
    raise exception 'checked-out worker should not cancel: %', v_result;
  end if;

  -- A is still accepted after checking out, so one spot is taken.
  v_result := public.invite_worker(v_b);
  if v_result->>'code' is distinct from 'invited' then
    raise exception 'second worker should be invitable: %', v_result;
  end if;

  v_result := public.respond_to_invitation(v_b, 'accept');
  if v_result->>'code' is distinct from 'accepted' then
    raise exception 'second accept should fill the shift: %', v_result;
  end if;

  v_result := public.invite_worker(v_c);
  if v_result->>'code' is distinct from 'invited' then
    raise exception 'third worker should be invitable: %', v_result;
  end if;

  v_result := public.respond_to_invitation(v_c, 'accept');
  if v_result->>'code' is distinct from 'shift_full' or (v_result->>'ok')::boolean then
    raise exception 'accept past capacity should fail: %', v_result;
  end if;

  select count(*) into v_filled
  from public.assignments
  where shift_id = v_shift
    and participation_status = 'accepted';
  if v_filled <> 2 then
    raise exception 'filled count should stay at capacity, got %', v_filled;
  end if;

  perform 1
  from public.assignments
  where id = v_c
    and participation_status = 'invited';
  if not found then
    raise exception 'rejected accept should leave the worker invited';
  end if;

  select count(*) into v_rows from public.assignments where shift_id = v_shift;
  if v_rows <> 3 then
    raise exception 'actions should not insert extra assignment rows, got %', v_rows;
  end if;

  set local role anon;

  select count(*) into v_read from public.assignments where shift_id = v_shift;
  if v_read <> 3 then
    raise exception 'anon should be able to read assignments';
  end if;

  begin
    update public.assignments
    set participation_status = 'declined'
    where id = v_c;
    raise exception 'anon update should have been rejected';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

rollback;
