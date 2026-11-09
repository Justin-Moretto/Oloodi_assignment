-- Live staffing schema.
-- Participation and attendance are independent. Accepted workers count as
-- filled whether or not they have checked in. Writes from the browser go
-- through the functions below; anon has no direct table write privilege.

create type public.participation_status as enum (
  'uninvited',
  'invited',
  'accepted',
  'declined',
  'cancelled'
);

create type public.attendance_status as enum (
  'not_started',
  'checked_in',
  'checked_out'
);

create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  location text not null,
  required_workers integer not null,
  constraint shifts_required_workers_positive check (required_workers > 0),
  constraint shifts_end_after_start check (end_time > start_time)
);

create table public.workers (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null references public.shifts (id) on delete cascade,
  worker_id uuid not null references public.workers (id) on delete restrict,
  participation_status public.participation_status not null default 'uninvited',
  attendance_status public.attendance_status not null default 'not_started',
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  updated_at timestamptz not null default clock_timestamp(),
  constraint assignments_shift_worker_unique unique (shift_id, worker_id),
  constraint assignments_timestamps_match_attendance check (
    (
      attendance_status = 'not_started'
      and checked_in_at is null
      and checked_out_at is null
    )
    or (
      attendance_status = 'checked_in'
      and checked_in_at is not null
      and checked_out_at is null
    )
    or (
      attendance_status = 'checked_out'
      and checked_in_at is not null
      and checked_out_at is not null
      and checked_out_at >= checked_in_at
    )
  ),
  constraint assignments_attendance_requires_acceptance check (
    attendance_status = 'not_started'
    or participation_status = 'accepted'
  )
);

create index assignments_shift_id_idx on public.assignments (shift_id);

create or replace function public.set_assignment_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = clock_timestamp();
  return new;
end;
$$;

create trigger assignments_set_updated_at
before update on public.assignments
for each row
execute function public.set_assignment_updated_at();

create or replace function public.mutation_result(
  p_ok boolean,
  p_code text,
  p_message text
)
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    'ok', p_ok,
    'code', p_code,
    'message', p_message
  );
$$;

-- Manager sends an invitation. Declined workers can be invited again.
-- Cancelled workers accept again themselves; they do not need a new invite.
create or replace function public.invite_worker(p_assignment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.assignments;
begin
  select *
  into v_row
  from public.assignments
  where id = p_assignment_id
  for update;

  if not found then
    return public.mutation_result(false, 'not_found', 'Assignment not found.');
  end if;

  if v_row.participation_status = 'invited' then
    return public.mutation_result(true, 'already_invited', 'This worker is already invited.');
  end if;

  if v_row.participation_status = 'accepted' then
    return public.mutation_result(false, 'illegal_transition', 'This worker has already accepted.');
  end if;

  if v_row.participation_status = 'cancelled' then
    return public.mutation_result(
      false,
      'illegal_transition',
      'A cancelled worker can accept again without a new invitation.'
    );
  end if;

  -- Only uninvited and declined are left.
  update public.assignments
  set participation_status = 'invited'
  where id = p_assignment_id;

  return public.mutation_result(true, 'invited', 'Invitation sent.');
end;
$$;

-- Worker accepts or declines an invitation, or accepts again after cancelling.
create or replace function public.respond_to_invitation(
  p_assignment_id uuid,
  p_response text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_required integer;
  v_filled integer;
  v_row public.assignments;
begin
  if p_response not in ('accept', 'decline') then
    return public.mutation_result(false, 'illegal_transition', 'Response must be accept or decline.');
  end if;

  -- An accept locks the shift row before the assignment row. Two accepts on
  -- the same shift then run one after the other, so the second one sees the
  -- first one's result in the capacity count below.
  if p_response = 'accept' then
    perform 1
    from public.shifts
    where id = (select shift_id from public.assignments where id = p_assignment_id)
    for update;
  end if;

  select *
  into v_row
  from public.assignments
  where id = p_assignment_id
  for update;

  if not found then
    return public.mutation_result(false, 'not_found', 'Assignment not found.');
  end if;

  if p_response = 'decline' then
    if v_row.participation_status = 'declined' then
      return public.mutation_result(true, 'already_declined', 'This invitation is already declined.');
    end if;

    if v_row.participation_status <> 'invited' then
      return public.mutation_result(
        false,
        'illegal_transition',
        'Only an invited worker can decline. An accepted worker can cancel before checking in.'
      );
    end if;

    update public.assignments
    set participation_status = 'declined'
    where id = p_assignment_id;

    return public.mutation_result(true, 'declined', 'Invitation declined.');
  end if;

  if v_row.participation_status = 'accepted' then
    return public.mutation_result(true, 'already_accepted', 'This assignment is already accepted.');
  end if;

  if v_row.participation_status not in ('invited', 'cancelled') then
    return public.mutation_result(
      false,
      'illegal_transition',
      'Accept is only available after an invitation, or again after a cancellation.'
    );
  end if;

  -- Invited and cancelled rows are always "not started": the
  -- assignments_attendance_requires_acceptance constraint guarantees it.

  select required_workers
  into v_required
  from public.shifts
  where id = v_row.shift_id;

  select count(*)
  into v_filled
  from public.assignments
  where shift_id = v_row.shift_id
    and participation_status = 'accepted';

  if v_filled >= v_required then
    return public.mutation_result(false, 'shift_full', 'This shift is already fully staffed.');
  end if;

  update public.assignments
  set participation_status = 'accepted'
  where id = p_assignment_id;

  return public.mutation_result(true, 'accepted', 'Assignment accepted.');
end;
$$;

create or replace function public.cancel_assignment(p_assignment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.assignments;
begin
  select *
  into v_row
  from public.assignments
  where id = p_assignment_id
  for update;

  if not found then
    return public.mutation_result(false, 'not_found', 'Assignment not found.');
  end if;

  if v_row.participation_status = 'cancelled' then
    return public.mutation_result(true, 'already_cancelled', 'This assignment is already cancelled.');
  end if;

  if v_row.participation_status <> 'accepted' or v_row.attendance_status <> 'not_started' then
    return public.mutation_result(
      false,
      'illegal_transition',
      'Only an accepted worker who has not checked in can cancel.'
    );
  end if;

  update public.assignments
  set participation_status = 'cancelled'
  where id = p_assignment_id;

  return public.mutation_result(true, 'cancelled', 'Assignment cancelled.');
end;
$$;

create or replace function public.check_in_worker(p_assignment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.assignments;
begin
  select *
  into v_row
  from public.assignments
  where id = p_assignment_id
  for update;

  if not found then
    return public.mutation_result(false, 'not_found', 'Assignment not found.');
  end if;

  if v_row.attendance_status = 'checked_in' then
    return public.mutation_result(
      true,
      'already_checked_in',
      'Already checked in. The original check-in time was kept.'
    );
  end if;

  if v_row.attendance_status = 'checked_out' then
    return public.mutation_result(false, 'illegal_transition', 'This worker has already checked out.');
  end if;

  if v_row.participation_status <> 'accepted' then
    return public.mutation_result(false, 'illegal_transition', 'Only an accepted worker can check in.');
  end if;

  update public.assignments
  set
    attendance_status = 'checked_in',
    checked_in_at = clock_timestamp()
  where id = p_assignment_id;

  return public.mutation_result(true, 'checked_in', 'Checked in.');
end;
$$;

create or replace function public.check_out_worker(p_assignment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.assignments;
begin
  select *
  into v_row
  from public.assignments
  where id = p_assignment_id
  for update;

  if not found then
    return public.mutation_result(false, 'not_found', 'Assignment not found.');
  end if;

  if v_row.attendance_status = 'checked_out' then
    return public.mutation_result(
      true,
      'already_checked_out',
      'Already checked out. The original check-out time was kept.'
    );
  end if;

  if v_row.attendance_status <> 'checked_in' or v_row.participation_status <> 'accepted' then
    return public.mutation_result(false, 'illegal_transition', 'Only a checked-in worker can check out.');
  end if;

  update public.assignments
  set
    attendance_status = 'checked_out',
    checked_out_at = clock_timestamp()
  where id = p_assignment_id;

  return public.mutation_result(true, 'checked_out', 'Checked out.');
end;
$$;

revoke all on function public.set_assignment_updated_at() from public;
revoke all on function public.mutation_result(boolean, text, text) from public;
revoke all on function public.invite_worker(uuid) from public;
revoke all on function public.respond_to_invitation(uuid, text) from public;
revoke all on function public.cancel_assignment(uuid) from public;
revoke all on function public.check_in_worker(uuid) from public;
revoke all on function public.check_out_worker(uuid) from public;

grant execute on function public.invite_worker(uuid) to anon, authenticated;
grant execute on function public.respond_to_invitation(uuid, text) to anon, authenticated;
grant execute on function public.cancel_assignment(uuid) to anon, authenticated;
grant execute on function public.check_in_worker(uuid) to anon, authenticated;
grant execute on function public.check_out_worker(uuid) to anon, authenticated;

alter table public.shifts enable row level security;
alter table public.workers enable row level security;
alter table public.assignments enable row level security;

revoke all on table public.shifts from anon, authenticated;
revoke all on table public.workers from anon, authenticated;
revoke all on table public.assignments from anon, authenticated;

grant select on table public.shifts to anon, authenticated;
grant select on table public.workers to anon, authenticated;
grant select on table public.assignments to anon, authenticated;

create policy shifts_select on public.shifts
for select to anon, authenticated
using (true);

create policy workers_select on public.workers
for select to anon, authenticated
using (true);

create policy assignments_select on public.assignments
for select to anon, authenticated
using (true);

alter publication supabase_realtime add table public.assignments;
