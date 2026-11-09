-- One shift that needs three workers, all initially uninvited.
-- Fixed ids keep the app and the tests pointed at the same rows after every reset.

insert into public.shifts (
  id,
  title,
  date,
  start_time,
  end_time,
  location,
  required_workers
)
values (
  '11111111-1111-4111-8111-111111111111',
  'Riverfront product launch',
  '2026-11-14',
  '09:00',
  '17:00',
  'Riverfront Pavilion, Hall B',
  3
);

insert into public.workers (id, name)
values
  ('22222222-2222-4222-8222-222222222221', 'Maya Chen'),
  ('22222222-2222-4222-8222-222222222222', 'Jordan Ellis'),
  ('22222222-2222-4222-8222-222222222223', 'Sam Okonkwo');

insert into public.assignments (
  id,
  shift_id,
  worker_id,
  participation_status,
  attendance_status
)
values
  (
    '33333333-3333-4333-8333-333333333331',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222221',
    'uninvited',
    'not_started'
  ),
  (
    '33333333-3333-4333-8333-333333333332',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    'uninvited',
    'not_started'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222223',
    'uninvited',
    'not_started'
  );
