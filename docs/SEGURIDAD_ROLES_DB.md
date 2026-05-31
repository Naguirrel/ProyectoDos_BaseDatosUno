# Seguridad a nivel de base de datos

## Objetivo

Este módulo define seguridad directamente en PostgreSQL para Proyecto 3. Los permisos se asignan mediante roles del DBMS usando `CREATE ROLE`, `GRANT` y `REVOKE`.

Script reproducible:

```txt
database/security_roles.sql
```

## Roles definidos

El script crea exactamente estos roles:

- `administrador`
- `gerente`
- `vendedor`
- `bodeguero`
- `analista`

Los roles se crean como `NOLOGIN`. Más adelante se pueden asociar a usuarios de base de datos o usarse como roles agrupadores para los usuarios reales.

## Matriz de permisos

| Rol | Responsabilidad | Tablas / vistas | Operaciones |
|---|---|---|---|
| `administrador` | Administración total del sistema | Todas las tablas, secuencias y funciones del esquema `public` | `ALL PRIVILEGES` |
| `gerente` | Supervisión comercial y operativa | `cliente`, `empleado`, `producto`, `categoria`, `proveedor`, `venta`, `detalle_venta`, `vista_productos_detalle` | `SELECT` |
| `vendedor` | Gestión de ventas | `venta`, `detalle_venta` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| `vendedor` | Consulta necesaria para vender | `cliente`, `empleado`, `producto`, `categoria`, `proveedor` | `SELECT` |
| `vendedor` | Descuento de inventario al vender | columna `producto.stock` | `UPDATE (stock)` |
| `bodeguero` | Gestión de inventario | `producto` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| `bodeguero` | Consulta de catálogo base | `categoria`, `proveedor` | `SELECT` |
| `bodeguero` | Gestión de compras/inventario entrante | `compra`, `detalle_compra` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| `analista` | Consulta de reportes | `cliente`, `empleado`, `producto`, `categoria`, `proveedor`, `venta`, `detalle_venta`, `vista_productos_detalle` | `SELECT` |

## Secuencias

Los roles que insertan registros reciben permisos sobre secuencias:

| Rol | Secuencias |
|---|---|
| `administrador` | Todas |
| `vendedor` | `venta_id_venta_seq`, `detalle_venta_id_detalle_seq` |
| `bodeguero` | `producto_id_producto_seq`, `compra_id_compra_seq`, `detalle_compra_id_detalle_seq` |

## Reglas de seguridad aplicadas

El script primero revoca permisos amplios:

```sql
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM administrador, gerente, vendedor, bodeguero, analista;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM administrador, gerente, vendedor, bodeguero, analista;
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM administrador, gerente, vendedor, bodeguero, analista;
```

Luego asigna permisos explícitos con `GRANT`.

## Notas importantes

- Este cambio no modifica login ni frontend.
- Este cambio no crea usuarios de aplicación por rol.
- Este cambio no implementa todavía protección de rutas por rol.
- Este cambio no implementa stored procedures.
- El rol `analista` tiene acceso de solo lectura a las fuentes actuales de reportes porque los reportes existentes consultan tablas directamente.
- El permiso sobre `vista_productos_detalle` se aplica de forma condicional: si la vista ya existe, `gerente` y `analista` reciben `SELECT`; si aun no existe, el script no falla y puede ejecutarse de nuevo despues de crear la vista.

## Ejecución

Con Docker levantado:

```bash
docker exec -i brickland_db psql -U proy2 -d brickland < database/security_roles.sql
```

O desde una consola con `psql` disponible:

```bash
psql -U proy2 -d brickland -f database/security_roles.sql
```
