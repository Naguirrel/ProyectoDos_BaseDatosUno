# Prisma ORM - Modelos detectados

## Estado de instalacion

Prisma quedo instalado y operativo en el backend sin reemplazar las consultas actuales.

Versiones instaladas:

| Paquete | Version |
|---|---|
| `prisma` | `6.19.0` |
| `@prisma/client` | `6.19.0` |

Se fijo Prisma 6.19 para mantener compatibilidad directa con el backend actual en CommonJS. Prisma 7 requiere configuracion ESM y driver adapter para PostgreSQL, lo cual implicaria cambiar la estructura runtime del proyecto.

## Archivos agregados

| Archivo | Proposito |
|---|---|
| `backend/prisma/schema.prisma` | Esquema Prisma introspectado desde PostgreSQL |
| `backend/src/prisma/client.js` | Cliente Prisma preparado para uso futuro |
| `backend/package.json` | Scripts `prisma:pull`, `prisma:generate`, `prisma:validate` |
| `backend/Dockerfile` | Genera Prisma Client durante el build del contenedor |
| `.env.example` | `DATABASE_URL` documentada |
| `backend/.env.example` | `DATABASE_URL` documentada para backend |
| `docker-compose.yml` | `DATABASE_URL` disponible dentro del contenedor backend |

## Modelos detectados automaticamente

Prisma introspecto 10 modelos desde la base de datos existente:

| Modelo Prisma | Tabla PostgreSQL | Observaciones |
|---|---|---|
| `categoria` | `categoria` | Relacion uno a muchos con `producto` |
| `cliente` | `cliente` | Indice `idx_cliente_email`, relacion con `venta` |
| `compra` | `compra` | Tiene `CHECK` en `total` no representado completamente por Prisma Client |
| `detalle_compra` | `detalle_compra` | Detalle con `ON DELETE CASCADE` hacia `compra` |
| `detalle_venta` | `detalle_venta` | Detalle con `ON DELETE CASCADE` hacia `venta` |
| `empleado` | `empleado` | Relacion con `venta`, `compra` y `usuario` |
| `producto` | `producto` | Indices en `nombre` y `id_categoria` |
| `proveedor` | `proveedor` | Relacion con `producto` y `compra` |
| `usuario` | `usuario` | Relacion opcional uno a uno con `empleado` |
| `venta` | `venta` | Indice `idx_venta_fecha`, relacion con `cliente`, `empleado` y `detalle_venta` |

## Vista existente

La base contiene la vista:

```txt
vista_productos_detalle
```

Prisma no la genero como modelo en esta introspeccion. Los reportes actuales pueden seguir consultandola con SQL directo o, en una etapa posterior, mediante raw queries de Prisma.

## Advertencias de introspeccion

Prisma detecto `CHECK constraints` en estas tablas:

- `compra`
- `detalle_compra`
- `detalle_venta`
- `producto`
- `venta`

La base de datos conserva esos constraints. La advertencia significa que Prisma Client no los representa por completo en el modelo generado; por eso deben seguir validandose en PostgreSQL y/o en la capa de servicio.

## Comandos ejecutados

```bash
npm install @prisma/client@6.19.0
npm install -D prisma@6.19.0
npx prisma db pull
npx prisma generate
npx prisma validate
```

Tambien se valido `docker compose up -d --build backend`; el contenedor genera Prisma Client correctamente durante el build.

Validacion de conexion ejecutada con Prisma Client:

```sql
SELECT 1 AS ok;
```

Resultado:

```json
[{"ok":1}]
```

Conteos validados mediante Prisma Client:

```json
{"categoria":25,"cliente":25,"producto":25,"venta":25}
```

Validacion dentro del contenedor backend:

```json
[{"ok":1}]
```

## Restricciones respetadas

- No se reemplazaron consultas actuales.
- No se modificaron controladores existentes.
- No se implementaron roles.
- No se implementaron stored procedures.
- No se cambio el flujo funcional actual de la aplicacion.
