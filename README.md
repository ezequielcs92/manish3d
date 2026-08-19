# Manish 3D

Plataforma Next.js para tienda pública, checkout y panel de administración de Manish 3D.

## Fase 1

Incluye:

- Next.js App Router con TypeScript y Tailwind CSS.
- Supabase Auth configurado desde clientes browser, server y middleware.
- Rutas base `/login`, `/registro` y `/admin`.
- Middleware que bloquea `/admin/*` si no hay sesión o si el rol no es interno.
- Migración inicial con tablas, enums, triggers, índices y Row Level Security.

## Fase 2

Incluye MVP interno:

- Layout de panel administrativo con navegación por rol.
- Dashboard con facturación del mes, pedidos activos, productos activos y últimos pedidos.
- CRUD mínimo de productos: creación y listado.
- Gestión básica de pedidos: creación manual por canal y cambio de estado.
- Vista de clientes y ventas invitadas.
- Producción: cola activa y stock de materiales.
- Finanzas: movimientos operativos e indicadores básicos.

Permisos del panel:

- `superadmin`: acceso completo.
- `admin_operativo`: productos, pedidos, clientes, producción y finanzas operativas.
- `vendedor`: dashboard, pedidos y clientes; sin productos, stock ni finanzas.

## Fase 3

Incluye MVP de tienda pública:

- Home pública con catálogo filtrable por línea.
- Detalle de producto en `/producto/[slug]`.
- Carrito en `/carrito` persistido en `localStorage`.
- Checkout en `/checkout` con datos de contacto y entrega.
- API `/api/checkout` que valida productos, crea pedido, items y preferencia MercadoPago.
- Webhook `/api/webhook/mercadopago` con validación de firma antes de actualizar pagos.
- Seguimiento público de pedido en `/pedido/[id]`.

Si `MERCADOPAGO_ACCESS_TOKEN` no está configurado, el checkout crea el pedido y redirige al seguimiento para poder probar el flujo localmente sin pagos reales.

## Configuración Local

1. Instalá dependencias:

```bash
npm install
```

2. Copiá `.env.local.example` a `.env.local` y completá Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Aplicá la migración `supabase/migrations/20260630165000_initial_schema.sql` en Supabase.

Podés usar el SQL Editor de Supabase o el Supabase CLI si lo configurás para el proyecto.

4. Levantá el servidor:

```bash
npm run dev
```

## Roles

Las cuentas creadas desde `/registro` nacen como `cliente` por seguridad. Para habilitar acceso al panel, cambiá el rol en `public.users` desde Supabase a uno de estos valores:

- `superadmin`
- `admin_operativo`
- `vendedor`

## Activar El Catálogo Real

1. Configurá `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`.
2. Ejecutá la migración inicial en el SQL Editor de Supabase.
3. Creá una cuenta en `/registro` y asignale el rol `superadmin` desde la tabla `public.users` en Supabase.
4. Ingresá a `/admin/productos` y cargá los productos. Al existir configuración de Supabase, `/tienda` deja de usar los productos demo y muestra solo los productos activos de la base de datos.
5. Las imágenes son opcionales. Pegá URLs públicas HTTPS, una por línea, desde Supabase Storage u otro host público; la primera se usa como imagen de portada.

Para que el checkout público cree pedidos reales, las tres variables de Supabase anteriores deben estar presentes. MercadoPago se puede configurar después: sin `MERCADOPAGO_ACCESS_TOKEN`, el pedido se crea y el cliente se redirige a su seguimiento.

## Scripts

```bash
npm run dev
npm run lint
npm run build
```
