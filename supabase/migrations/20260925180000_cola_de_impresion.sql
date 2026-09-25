-- Cola de impresión del taller.
--
-- Son trabajos internos: qué hay que imprimir, con qué material y en qué
-- estado está cada uno. No son productos ni se muestran en la tienda. Un
-- trabajo puede estar ligado a un pedido, pero no hace falta (reposición de
-- stock, pruebas, encargos que todavía no son pedido).

create table if not exists public.print_jobs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  material public.material_type not null,
  color text not null check (length(trim(color)) > 0),
  quantity integer not null check (quantity > 0),
  status text not null default 'en_cola'
    check (status in ('en_cola', 'imprimiendo', 'terminada', 'fallida', 'cancelada')),
  urgent boolean not null default false,
  estimated_hours numeric(6, 2) check (estimated_hours is null or estimated_hours > 0),
  estimated_grams numeric(10, 2) check (estimated_grams is null or estimated_grams > 0),
  notes text,
  order_id uuid references public.orders(id) on delete set null,
  created_by uuid references public.users(id) on delete set null default auth.uid(),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists print_jobs_status_created_at_idx
  on public.print_jobs (status, created_at);

create trigger print_jobs_set_updated_at
before update on public.print_jobs
for each row execute function public.set_updated_at();

alter table public.print_jobs enable row level security;

-- La base es compartida con otra app: los permisos se dan tabla por tabla.
-- Nadie sin sesión toca la cola.
revoke all on public.print_jobs from anon;
grant select, insert, update, delete on public.print_jobs to authenticated;

create policy "El equipo gestiona la cola de impresión"
on public.print_jobs
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());
