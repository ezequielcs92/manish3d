-- Catálogo ampliado: líneas Hogar y Coleccionismo, y productos a consultar.
--
-- Parte del catálogo (escenografía, piezas lúdicas, coleccionables) se cotiza
-- caso por caso. Un precio nulo significa "a consultar": la tienda muestra el
-- botón de consulta en lugar del carrito y el checkout rechaza esos productos.
-- Cargarlos en $0 habría permitido comprarlos gratis.
--
-- Los ALTER TYPE van en sentencias propias: Postgres no deja usar un valor de
-- enum en la misma transacción en que se agrega.

alter type public.product_line add value if not exists 'hogar';
alter type public.product_line add value if not exists 'coleccion';

alter table public.products alter column price drop not null;
