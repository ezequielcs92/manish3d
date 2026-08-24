-- Perfil de cliente: datos propios editables y pedidos asociados a la cuenta.

alter table public.users
  add column if not exists phone text,
  add column if not exists shipping_address jsonb;

-- El cliente puede editar su propia fila.
create policy "Users can update own profile"
on public.users
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Pero solo estas columnas: sin el recorte, la política de arriba le permitiría
-- escribir su propio role y auto-promoverse a superadmin. Los cambios de rol
-- siguen haciéndose con service_role, que ignora estos grants.
revoke update on public.users from authenticated;
grant update (full_name, phone, shipping_address) on public.users to authenticated;
