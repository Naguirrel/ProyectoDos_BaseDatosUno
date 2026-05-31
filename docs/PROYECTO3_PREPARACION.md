# Estado tecnico Proyecto 3

## Alcance

Este documento resume el estado tecnico actual despues de la preparacion y migraciones de Proyecto 3. El sistema conserva su comportamiento funcional, pero ahora incluye ORM, roles, autorizacion, stored procedures y transaccion real de ventas.

## Backend

| Area | Archivo principal | Estado |
|---|---|---|
| Conexion PostgreSQL | `backend/src/db/connection.js` | Usa `pg.Pool` con variables `DB_*` |
| Prisma Client | `backend/src/prisma/client.js` | Operativo |
| Esquema Prisma | `backend/prisma/schema.prisma` | Introspectado desde PostgreSQL |
| Productos | `backend/src/controllers/productos.controller.js` | CRUD con Prisma y procedures para creacion/stock |
| Clientes | `backend/src/controllers/entidades.controller.js` | CRUD con Prisma y `registrar_cliente` |
| Empleados | `backend/src/controllers/entidades.controller.js` | CRUD con Prisma |
| Ventas | `backend/src/controllers/entidades.controller.js` | Usa `registrar_venta` |
| Reportes | `backend/src/controllers/reportes.controller.js` | SQL directo y procedures para evidencia academica |
| Auth/usuarios | `backend/src/controllers/auth.controller.js` | Sesion con rol de usuario |
| Autorizacion | `backend/src/middleware/roles.middleware.js` | Middleware RBAC reutilizable |

## Base de datos

El esquema usa caracteristicas compatibles con PostgreSQL y Prisma:

- `SERIAL PRIMARY KEY`
- `VARCHAR`, `TEXT`, `DATE`, `BOOLEAN`
- `NUMERIC(10,2)`
- `CHECK`
- `UNIQUE`
- `FOREIGN KEY`
- `ON DELETE CASCADE`
- `CREATE INDEX`
- `VIEW`
- `CREATE PROCEDURE`
- Roles del DBMS con `CREATE ROLE`, `GRANT` y `REVOKE`

## Docker

`docker-compose.yml` levanta tres servicios:

| Servicio | Funcion | Puerto |
|---|---|---|
| `db` | PostgreSQL 15 | `5432` |
| `backend` | API Express | `3000` |
| `frontend` | Nginx estatico | `5500` |

Scripts ejecutados al inicializar una base nueva:

| Orden | Archivo |
|---|---|
| 01 | `database/brickland_ddl.sql` |
| 02 | `database/auth_test_users.sql` |
| 03 | `database/stored_procedures.sql` |
| 04 | `database/security_roles.sql` |

## Variables de entorno

| Variable | Uso |
|---|---|
| `DB_USER` | Usuario PostgreSQL usado por `pg` |
| `DB_PASSWORD` | Password PostgreSQL usado por `pg` |
| `DB_NAME` | Base de datos |
| `DB_HOST` | Host de PostgreSQL |
| `DB_PORT` | Puerto de PostgreSQL |
| `DATABASE_URL` | Conexion Prisma |
| `PORT` | Puerto del backend |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Inicializacion de contenedor PostgreSQL |

## Modulos afectados

| Modulo | Estado Proyecto 3 |
|---|---|
| Productos | Migrado parcialmente a Prisma y procedures |
| Clientes | Migrado parcialmente a Prisma y procedures |
| Empleados | Migrado a Prisma |
| Ventas | Usa stored procedure transaccional |
| Usuarios/Auth | Expone rol en sesion |
| Reportes | Conserva SQL visible |
| Docker/env | Inicializacion completa documentada |
| Seguridad | Roles PostgreSQL + autorizacion backend/frontend |

## Verificacion recomendada

```bash
docker compose config
docker compose down -v
docker compose up -d --build
docker compose ps
docker compose exec backend npx prisma validate
```

Ver tambien:

- `docs/PROYECTO3_AUDITORIA_FINAL.md`
- `docs/PROYECTO3_CHECKLIST.md`
- `docs/SEGURIDAD_ROLES_DB.md`
- `docs/STORED_PROCEDURES.md`
- `docs/PRISMA_MODELOS_DETECTADOS.md`
