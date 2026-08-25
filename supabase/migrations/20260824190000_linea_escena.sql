-- Nueva línea de productos: escena (props, escenografía y utilería).
--
-- Postgres no permite usar un valor de enum en la misma transacción en que se
-- agrega, así que este ALTER va solo, antes de cargar productos con esa línea.

alter type public.product_line add value if not exists 'escena';
