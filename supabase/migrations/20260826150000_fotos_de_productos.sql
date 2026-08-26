-- Almacenamiento de fotos de productos.
--
-- Hasta ahora el panel pedía URLs pegadas a mano, lo que obligaba a hostear las
-- fotos en otro lado antes de poder cargar un producto.

insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

-- Las fotos del catálogo son públicas por definición: las ve cualquiera que
-- entre a la tienda, sin sesión.
create policy "Fotos de productos visibles para todos"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'productos');

-- Subir y borrar, solo el equipo.
create policy "El equipo sube fotos de productos"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'productos' and public.is_staff());

create policy "El equipo borra fotos de productos"
on storage.objects
for delete
to authenticated
using (bucket_id = 'productos' and public.is_staff());
