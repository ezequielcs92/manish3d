-- Nueva línea de productos: juegos de mesa, rol, wargames y sus accesorios.
--
-- Postgres no permite usar un valor de enum en la misma transacción en que se
-- agrega, así que este ALTER queda aislado antes de cargar productos Juegos.

alter type public.product_line add value if not exists 'juegos';
