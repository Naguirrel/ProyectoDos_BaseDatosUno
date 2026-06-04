# Seguridad a nivel de base de datos

## Objetivo

Proyecto 3 implementa seguridad directamente en PostgreSQL mediante roles del DBMS. El script reproducible utiliza `CREATE ROLE`, `GRANT` y `REVOKE`.

Script:

```txt
database/security_roles.sql
```

Docker lo ejecuta automaticamente en una base nueva como:

```txt
/docker-entrypoint-initdb.d/04-security-roles.sql
```

## Roles PostgreSQL definidos

El script crea exactamente estos roles:

- `administrador`
- `gerente`
- `vendedor`
- `bodeguero`
- `analista`

Los roles se crean como `NOLOGIN`. Funcionan como roles agrupadores de permisos a nivel de base de datos. Los usuarios de aplicacion se guardan en la tabla `usuario` y su rol se usa para autenticacion/autorizacion web.

## Matriz de permisos

| Rol | Responsabilidad | Tablas / vistas | Operaciones |
|---|---|---|---|
| `administrador` | Acceso total | Todas las tablas, secuencias y funciones del esquema `public` | `ALL PRIVILEGES` |
| `gerente` | Supervision comercial | `cliente`, `empleado`, `producto`, `categoria`, `proveedor`, `venta`, `detalle_venta`, `vista_productos_detalle` | `SELECT` |
| `vendedor` | Gestion de ventas | `venta`, `detalle_venta` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| `vendedor` | Consulta necesaria para vender | `cliente`, `empleado`, `producto`, `categoria`, `proveedor` | `SELECT` |
| `vendedor` | Descuento de inventario al vender | columna `producto.stock` | `UPDATE (stock)` |
| `bodeguero` | Gestion de inventario | `producto` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| `bodeguero` | Catalogos necesarios | `categoria`, `proveedor` | `SELECT` |
| `bodeguero` | Compras e inventario entrante | `compra`, `detalle_compra` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| `analista` | Reporteria | `cliente`, `empleado`, `producto`, `categoria`, `proveedor`, `venta`, `detalle_venta`, `vista_productos_detalle` | `SELECT` |

## Secuencias

| Rol | Secuencias |
|---|---|
| `administrador` | Todas |
| `vendedor` | `venta_id_venta_seq`, `detalle_venta_id_detalle_seq` |
| `bodeguero` | `producto_id_producto_seq`, `compra_id_compra_seq`, `detalle_compra_id_detalle_seq` |

## Uso de REVOKE

El script revoca permisos amplios antes de conceder permisos especificos:

```sql
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public
  FROM administrador, gerente, vendedor, bodeguero, analista;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public
  FROM administrador, gerente, vendedor, bodeguero, analista;
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public
  FROM administrador, gerente, vendedor, bodeguero, analista;
```

## Uso de GRANT

Despues de los `REVOKE`, el script asigna permisos granulares segun responsabilidad de negocio:

- `administrador`: acceso total.
- `gerente`: lectura operativa y reporteria.
- `vendedor`: ventas, detalle de venta, lectura de clientes/productos y actualizacion de stock.
- `bodeguero`: inventario, compras y catalogos necesarios.
- `analista`: lectura para reportes.

El permiso sobre `vista_productos_detalle` se aplica de forma condicional para que el script sea re-ejecutable.

## Usuarios de prueba por rol

Los usuarios de aplicacion se crean en:

```txt
database/auth_test_users.sql
```

| Usuario | Password | Rol de aplicacion |
|---|---|---|
| `proy3` | `secret` | `administrador` |
| `admin_test` | `secret` | `administrador` |
| `gerente_test` | `secret` | `gerente` |
| `vendedor_test` | `secret` | `vendedor` |
| `bodeguero_test` | `secret` | `bodeguero` |
| `analista_test` | `secret` | `analista` |

## Autorizacion en backend y frontend

La seguridad de aplicacion complementa los permisos de PostgreSQL:

| Capa | Evidencia |
|---|---|
| Sesion y rol expuesto | `backend/src/controllers/auth.controller.js` |
| Middleware reutilizable | `backend/src/middleware/roles.middleware.js` |
| Rutas protegidas | `backend/src/routes/*.routes.js` |
| UI por rol | `frontend/js/auth.js` y `frontend/js/ui.js` |

Las rutas protegidas responden `403 Forbidden` cuando el usuario autenticado no tiene permiso para el modulo.

## Validacion sugerida

Ver roles:

```bash
docker compose exec db psql -U proy2 -d brickland -c "SELECT rolname FROM pg_roles WHERE rolname IN ('administrador','gerente','vendedor','bodeguero','analista') ORDER BY rolname;"
```

Ver usuarios de prueba:

```bash
docker compose exec db psql -U proy2 -d brickland -c "SELECT username, rol, activo FROM usuario WHERE username IN ('proy3','admin_test','gerente_test','vendedor_test','bodeguero_test','analista_test') ORDER BY username;"
```

Reejecutar script manualmente si fuera necesario:

```bash
docker exec -i brickland_db psql -U proy2 -d brickland < database/security_roles.sql
```
