create extension if not exists pgcrypto;

do $$
begin
  create type public.app_role as enum ('superadmin', 'admin_operativo', 'vendedor', 'cliente');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.product_line as enum ('calma', 'lectura', 'servicio');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.order_channel as enum ('tienda', 'instagram', 'whatsapp', 'mercadolibre', 'feria');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.order_status as enum ('pendiente', 'produccion', 'listo', 'enviado', 'entregado', 'cancelado');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_status as enum ('pendiente', 'pagado', 'fallido');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.client_type as enum ('regular', 'recurrente', 'b2b');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.transaction_type as enum ('ingreso', 'costo_material', 'gasto_operativo');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.material_type as enum ('PLA', 'PETG', 'TPU', 'otro');
exception
  when duplicate_object then null;
end $$;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role public.app_role not null default 'cliente',
  full_name text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  line public.product_line not null,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  cost numeric(12, 2) not null default 0 check (cost >= 0),
  stock integer check (stock is null or stock >= 0),
  images text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.users(id) on delete set null,
  client_name text not null,
  client_phone text,
  client_email text,
  channel public.order_channel not null default 'tienda',
  status public.order_status not null default 'pendiente',
  total numeric(12, 2) not null default 0 check (total >= 0),
  shipping_address jsonb,
  payment_status public.payment_status not null default 'pendiente',
  payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  name text not null,
  phone text,
  email text,
  zone text,
  client_type public.client_type not null default 'regular',
  total_spent numeric(12, 2) not null default 0 check (total_spent >= 0),
  created_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  type public.transaction_type not null,
  amount numeric(12, 2) not null check (amount >= 0),
  description text,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.material_type not null default 'PLA',
  color text,
  stock_grams numeric(12, 2) not null default 0 check (stock_grams >= 0),
  cost_per_kg numeric(12, 2) not null default 0 check (cost_per_kg >= 0),
  low_stock_threshold numeric(12, 2) not null default 0 check (low_stock_threshold >= 0)
);

create index products_active_line_idx on public.products (active, line);
create index orders_client_id_idx on public.orders (client_id);
create index orders_status_created_at_idx on public.orders (status, created_at desc);
create index order_items_order_id_idx on public.order_items (order_id);
create index clients_user_id_idx on public.clients (user_id);
create index transactions_order_id_idx on public.transactions (order_id);

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = (select auth.uid())
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('superadmin', 'admin_operativo', 'vendedor')
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    'cliente'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.clients enable row level security;
alter table public.transactions enable row level security;
alter table public.materials enable row level security;

create policy "Users can read own profile"
on public.users for select
to authenticated
using ((select auth.uid()) = id);

create policy "Staff can read users"
on public.users for select
to authenticated
using (public.is_staff());

create policy "Superadmins can update users"
on public.users for update
to authenticated
using (public.current_user_role() = 'superadmin')
with check (public.current_user_role() = 'superadmin');

create policy "Public can read active products"
on public.products for select
to anon, authenticated
using (active = true);

create policy "Product admins can manage products"
on public.products for all
to authenticated
using (public.current_user_role() in ('superadmin', 'admin_operativo'))
with check (public.current_user_role() in ('superadmin', 'admin_operativo'));

create policy "Clients can read own orders"
on public.orders for select
to authenticated
using (client_id = (select auth.uid()));

create policy "Clients can create own orders"
on public.orders for insert
to authenticated
with check (client_id = (select auth.uid()));

create policy "Staff can manage orders"
on public.orders for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Clients can read own order items"
on public.order_items for select
to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and orders.client_id = (select auth.uid())
  )
);

create policy "Clients can create own order items"
on public.order_items for insert
to authenticated
with check (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and orders.client_id = (select auth.uid())
  )
);

create policy "Staff can manage order items"
on public.order_items for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Clients can read own client record"
on public.clients for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Clients can create own client record"
on public.clients for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "Staff can manage clients"
on public.clients for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Finance admins can manage transactions"
on public.transactions for all
to authenticated
using (public.current_user_role() in ('superadmin', 'admin_operativo'))
with check (public.current_user_role() in ('superadmin', 'admin_operativo'));

create policy "Production staff can read materials"
on public.materials for select
to authenticated
using (public.is_staff());

create policy "Material admins can manage materials"
on public.materials for all
to authenticated
using (public.current_user_role() in ('superadmin', 'admin_operativo'))
with check (public.current_user_role() in ('superadmin', 'admin_operativo'));

grant usage on schema public to anon, authenticated;
grant select on public.products to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_staff() to authenticated;
