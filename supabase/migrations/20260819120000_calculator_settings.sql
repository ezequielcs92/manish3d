-- Ajustes de la calculadora de precios: fuente única de verdad para valores
-- que cambian por afuera del código (tarifa eléctrica, valor hora, filamento).

create table public.calculator_settings (
  key text primary key,
  value numeric(14, 4) not null check (value >= 0),
  note text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.users(id) on delete set null
);

alter table public.calculator_settings enable row level security;

-- La calculadora pública necesita leer la tarifa vigente sin sesión.
create policy "Public can read calculator settings"
on public.calculator_settings
for select
using (true);

create policy "Staff can manage calculator settings"
on public.calculator_settings
for all
using (public.current_user_role() in ('superadmin', 'admin_operativo'))
with check (public.current_user_role() in ('superadmin', 'admin_operativo'));

insert into public.calculator_settings (key, value, note) values
  (
    'electricity_cost_per_kwh',
    115.28,
    'Edenor T1 residencial: costo variable por kWh (sin cargo fijo ni impuestos).'
  )
on conflict (key) do nothing;
