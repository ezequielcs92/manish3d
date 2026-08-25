-- Reembolsos y contracargos.
--
-- Hasta ahora un pago devuelto caía en "pendiente": el pedido seguía en la cola
-- de producción, el stock no volvía y el ingreso quedaba sumado en la caja.

alter type public.payment_status add value if not exists 'reembolsado';
alter type public.transaction_type add value if not exists 'reembolso';
