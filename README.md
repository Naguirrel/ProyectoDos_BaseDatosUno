# BrickLand Store

BrickLand Store es un sistema web de gestion empresarial para una tienda de inventario y ventas tipo bricks/LEGO. La aplicacion centraliza productos, clientes, ventas, empleados, proveedores, usuarios, reportes de negocio y evidencia tecnica de base de datos en una interfaz administrativa.

El sistema esta orientado a operacion real: cada usuario inicia sesion, trabaja segun su rol, consulta reportes de negocio y ejecuta operaciones sobre una base PostgreSQL inicializada con datos de prueba.

## Objetivo del producto

- Administrar inventario, clientes, ventas, empleados, proveedores y usuarios.
- Registrar ventas con validacion de stock y transaccion atomica.
- Mostrar reportes de negocio con SQL visible para revision academica.
- Aplicar autenticacion, autorizacion por roles y seguridad a nivel PostgreSQL.
- Levantar frontend, backend y base de datos con `docker compose up`.

## Tecnologias

| Capa | Tecnologia |
|---|---|
| Frontend | HTML, CSS y JavaScript puro |
| Backend | Node.js, Express |
| ORM | Prisma Client |
| SQL directo | `pg` Pool para reportes, auth y procedimientos |
| Base de datos | PostgreSQL 15 |
| Contenedores | Docker, Docker Compose |
| Frontend web | Nginx |
| Autenticacion | Sesion con cookie HTTP-only |
| Seguridad | Roles PostgreSQL, `GRANT`, `REVOKE` y middleware RBAC |

## Estructura principal

```txt
.
|-- backend/
|   |-- Dockerfile
|   |-- package.json
|   |-- prisma/
|   |   `-- schema.prisma
|   `-- src/
|       |-- app.js
|       |-- controllers/
|       |-- db/
|       |-- middleware/
|       |-- prisma/
|       `-- routes/
|-- database/
|   |-- brickland_ddl.sql
|   |-- auth_test_users.sql
|   |-- stored_procedures.sql
|   `-- security_roles.sql
|-- docs/
|   |-- PROYECTO3_AUDITORIA_FINAL.md
|   |-- PROYECTO3_CHECKLIST.md
|   |-- PRISMA_MODELOS_DETECTADOS.md
|   |-- SEGURIDAD_ROLES_DB.md
|   `-- STORED_PROCEDURES.md
|-- frontend/
|   |-- Dockerfile
|   |-- nginx.conf
|   |-- login.html
|   |-- index.html
|   |-- productos.html
|   |-- clientes.html
|   |-- ventas.html
|   |-- empleados.html
|   |-- proveedores.html
|   |-- usuarios.html
|   |-- reportes/
|   |-- css/
|   `-- js/
|-- .env.example
|-- docker-compose.yml
`-- README.md
```

## Inicio rapido con Docker

Requisitos:

- Docker instalado.
- Docker Compose disponible.

Levantar todo el proyecto:

```bash
docker compose up --build
```

Servicios:

| Servicio | URL / puerto |
|---|---|
| Frontend | http://localhost:5500 |
| Backend API | http://localhost:3000 |
| PostgreSQL | localhost:5432 |

Para reiniciar la base desde cero:

```bash
docker compose down -v
docker compose up --build
```

Docker inicializa PostgreSQL con estos scripts:

| Orden | Script | Proposito |
|---|---|---|
| 01 | `database/brickland_ddl.sql` | Tablas, constraints, indices, vista y datos de prueba |
| 02 | `database/auth_test_users.sql` | Usuarios de prueba por rol |
| 03 | `database/stored_procedures.sql` | Stored procedures de negocio |
| 04 | `database/security_roles.sql` | Roles PostgreSQL, `GRANT` y `REVOKE` |

## Variables de entorno

Archivos de referencia:

```txt
.env.example
backend/.env.example
```

Variables principales:

| Variable | Uso |
|---|---|
| `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST`, `DB_PORT` | Conexion `pg` del backend |
| `DATABASE_URL` | Conexion Prisma |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Inicializacion del contenedor PostgreSQL |
| `PORT`, `BACKEND_PORT`, `FRONTEND_PORT` | Puertos documentados para ejecucion local/Docker |

## Login y usuarios de prueba

Credencial principal:

```txt
Usuario: proy3
Password: secret
Rol: administrador
```

Usuarios de prueba de Proyecto 3:

| Usuario | Password | Rol |
|---|---|---|
| `proy3` | `secret` | administrador |
| `admin_test` | `secret` | administrador |
| `gerente_test` | `secret` | gerente |
| `vendedor_test` | `secret` | vendedor |
| `bodeguero_test` | `secret` | bodeguero |
| `analista_test` | `secret` | analista |

## Modulos

| Modulo | Descripcion |
|---|---|
| Dashboard | Metricas y accesos operativos segun rol |
| Productos | CRUD de inventario con Prisma y stored procedures para creacion/stock |
| Clientes | CRUD de clientes con Prisma y stored procedure de creacion |
| Ventas | Registro de ventas con transaccion explicita en PostgreSQL |
| Empleados | CRUD de empleados con Prisma |
| Proveedores | CRUD de proveedores |
| Usuarios | Administracion de usuarios persistidos en PostgreSQL |
| Reportes | Reportes de negocio con consulta SQL visible |

## Reportes SQL de negocio

Los reportes muestran primero el objetivo de negocio y dejan el SQL en una seccion desplegable para evidencia academica.

| Reporte | Evidencia SQL |
|---|---|
| Clientes y compras acumuladas | JOIN y agregacion |
| Ventas por empleado | JOIN entre multiples tablas |
| Inventario por proveedor | JOIN y agregacion |
| Productos mas vendidos | GROUP BY y SUM |
| Categorias con mayor rotacion | GROUP BY, HAVING y agregaciones |
| Ingresos por fecha | Stored procedure con agregacion |
| Clientes frecuentes | Subquery |
| Productos sobre el promedio de precio | Subquery con AVG |
| Analisis de ventas avanzadas | CTE con `WITH` |
| Inventario detallado de productos | VIEW consumida por backend |

## Evidencias Proyecto 3

| Requisito | Evidencia en el proyecto |
|---|---|
| Roles PostgreSQL | `database/security_roles.sql` crea `administrador`, `gerente`, `vendedor`, `bodeguero`, `analista` |
| `GRANT` | Permisos granulares por tablas, secuencias, esquema y vista en `database/security_roles.sql` |
| `REVOKE` | Revocacion inicial de permisos amplios en `database/security_roles.sql` |
| Usuarios de prueba | `database/auth_test_users.sql` y datos iniciales en `database/brickland_ddl.sql` |
| Proteccion de rutas | `backend/src/middleware/roles.middleware.js` y rutas protegidas en `backend/src/routes/` |
| Interfaz por rol | `frontend/js/auth.js` y `frontend/js/ui.js` ocultan modulos y acciones no permitidas |
| Stored Procedures | `database/stored_procedures.sql` define cinco procedimientos almacenados |
| ORM | Prisma configurado en `backend/prisma/schema.prisma` y `backend/src/prisma/client.js` |
| CRUD con ORM | Productos, clientes y empleados usan Prisma manteniendo las rutas existentes |
| Transacciones | `registrar_venta` valida stock y ejecuta `COMMIT` o `ROLLBACK` |
| Docker | `docker-compose.yml` levanta PostgreSQL, backend y frontend desde cero |

Documentacion tecnica:

- `docs/PROYECTO3_AUDITORIA_FINAL.md`
- `docs/PROYECTO3_CHECKLIST.md`
- `docs/SEGURIDAD_ROLES_DB.md`
- `docs/STORED_PROCEDURES.md`
- `docs/PRISMA_MODELOS_DETECTADOS.md`

## Checklist final

| Area | Estado |
|---|---|
| Docker levanta frontend/backend/db | Cumplido |
| PostgreSQL inicializa tablas, datos, vista, roles y procedures | Cumplido |
| Autenticacion login/logout con sesion | Cumplido |
| Usuarios de prueba por rol | Cumplido |
| Autorizacion backend por rol | Cumplido |
| UI adaptada por rol | Cumplido |
| Prisma Client operativo | Cumplido |
| CRUD Productos, Clientes y Empleados migrado a Prisma | Cumplido |
| Reportes SQL visibles desde UI | Cumplido |
| Stored procedures ejecutados desde backend | Cumplido |
| Venta atomica con rollback por stock insuficiente | Cumplido |
| README, variables y documentacion tecnica actualizadas | Cumplido |

## Comandos utiles

```bash
docker compose config
docker compose up -d --build
docker compose logs -f
docker compose down
docker compose down -v
```

Validar Prisma dentro del backend:

```bash
docker compose exec backend npx prisma validate
docker compose exec backend npx prisma generate
```

Validar roles en PostgreSQL:

```bash
docker compose exec db psql -U proy2 -d brickland -c "SELECT rolname FROM pg_roles WHERE rolname IN ('administrador','gerente','vendedor','bodeguero','analista');"
```

## Notas de operacion

- El frontend se abre en `http://localhost:5500`.
- La API corre en `http://localhost:3000`.
- La API requiere sesion activa para rutas protegidas.
- Los usuarios creados desde la pantalla Usuarios se mantienen mientras no se elimine el volumen de PostgreSQL.
- Para pruebas limpias de evaluacion, usar `docker compose down -v` antes de levantar nuevamente.
