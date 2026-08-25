-- Peso del producto: Andreani cotiza por peso y volumen, así que sin este dato
-- no se le puede pedir una tarifa. Se carga en gramos desde el panel.
alter table public.products
  add column if not exists weight_grams integer check (weight_grams is null or weight_grams >= 0);

-- Descuento de stock al crear el pedido.
--
-- Va en una función y no en el código de la app porque el chequeo y el descuento
-- tienen que pasar en la misma sentencia: si se leyera el stock desde Node y
-- después se escribiera, dos compras simultáneas de la última unidad pasarían
-- ambas. El "where stock >= cantidad" resuelve la carrera dentro de Postgres.
--
-- Stock null significa "a pedido": no se descuenta ni limita la venta.

create or replace function public.reserve_stock(items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
  afectadas int;
begin
  for item in
    select (value ->> 'product_id')::uuid as product_id,
           (value ->> 'quantity')::int as quantity
    from jsonb_array_elements(items)
  loop
    if item.quantity is null or item.quantity < 1 then
      raise exception 'CANTIDAD_INVALIDA:%', item.product_id;
    end if;

    update public.products
       set stock = stock - item.quantity
     where id = item.product_id
       and stock is not null
       and stock >= item.quantity;

    get diagnostics afectadas = row_count;

    if afectadas = 0 then
      -- No descontó: o es a pedido (válido) o no alcanza el stock (error).
      if not exists (
        select 1 from public.products
        where id = item.product_id and stock is null
      ) then
        raise exception 'STOCK_INSUFICIENTE:%', item.product_id;
      end if;
    end if;
  end loop;
end;
$$;

-- Devuelve al stock lo reservado, para pagos rechazados o pedidos cancelados.
create or replace function public.restore_stock(items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
begin
  for item in
    select (value ->> 'product_id')::uuid as product_id,
           (value ->> 'quantity')::int as quantity
    from jsonb_array_elements(items)
  loop
    update public.products
       set stock = stock + item.quantity
     where id = item.product_id
       and stock is not null;
  end loop;
end;
$$;

-- Solo el backend con service_role las ejecuta; nadie las llama desde el cliente.
revoke execute on function public.reserve_stock(jsonb) from public, anon, authenticated;
revoke execute on function public.restore_stock(jsonb) from public, anon, authenticated;
