-- Solicitudes del botón de arrepentimiento (Resolución 424/2020).
--
-- La ley exige un mecanismo directo para pedir la cancelación dentro de los 10
-- días, sin obligar a tener cuenta. Por eso el formulario es público y las
-- solicitudes se guardan acá, donde el equipo las ve desde el panel.

create table if not exists public.retraction_requests (
  id uuid primary key default gen_random_uuid(),
  order_reference text,
  full_name text not null,
  email text not null,
  phone text,
  reason text,
  status text not null default 'pendiente' check (status in ('pendiente', 'resuelta')),
  created_at timestamptz not null default now()
);

create index if not exists retraction_requests_created_at_idx
  on public.retraction_requests (created_at desc);

alter table public.retraction_requests enable row level security;

-- Cualquiera puede dejar una solicitud, con o sin cuenta: es un derecho del
-- consumidor y condicionarlo a registrarse sería ponerle una traba.
create policy "Cualquiera puede pedir el arrepentimiento"
on public.retraction_requests
for insert
to anon, authenticated
with check (true);

-- Pero solo el equipo puede leerlas y marcarlas como resueltas.
create policy "El equipo lee las solicitudes"
on public.retraction_requests
for select
to authenticated
using (public.is_staff());

create policy "El equipo resuelve las solicitudes"
on public.retraction_requests
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());
