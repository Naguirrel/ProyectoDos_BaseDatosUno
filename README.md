# BrickLand Store

BrickLand Store es un sistema web de gestion empresarial para una tienda de productos tipo bricks/LEGO. La aplicacion permite administrar inventario, clientes, ventas, empleados, proveedores, usuarios del sistema y reportes SQL ejecutados desde una interfaz web.

El proyecto esta pensado para simular un panel operativo real: un usuario inicia sesion, navega entre modulos administrativos, realiza operaciones CRUD y consulta reportes construidos sobre una base de datos PostgreSQL.

## Objetivo

El objetivo del sistema es centralizar la operacion de una tienda mediante:

- Gestion de productos e inventario.
- Administracion de clientes, ventas, empleados y proveedores.
- Autenticacion de usuarios con sesion.
- Reportes de negocio con consultas SQL visibles como soporte academico.
- Base de datos relacional inicializada con datos de prueba.
- Ejecucion completa con Docker Compose.

## Usuarios objetivo

La aplicacion esta dirigida a:

- Administradores de tienda.
- Personal operativo encargado de ventas e inventario.
- Usuarios academicos que desean revisar consultas SQL integradas a una aplicacion web.
- Evaluadores que necesitan validar base de datos, backend, frontend y despliegue local.

## Tecnologias utilizadas

| Capa | Tecnologia |
|---|---|
| Frontend | HTML, CSS y JavaScript puro |
| Backend | Node.js, Express |
| Base de datos | PostgreSQL 15 |
| Contenedores | Docker, Docker Compose |
| Servidor frontend | Nginx |
| Autenticacion | Sesion con cookie HTTP-only |
| SQL | JOIN, subqueries, GROUP BY, HAVING, CTE, VIEW y transacciones |

## Estructura del proyecto

```txt
.
|-- backend/
|   |-- Dockerfile
|   |-- package.json
|   `-- src/
|       |-- app.js
|       |-- controllers/
|       |-- db/
|       `-- routes/
|-- database/
|   `-- brickland_ddl.sql
|-- frontend/
|   |-- Dockerfile
|   |-- nginx.conf
|   |-- index.html
|   |-- login.html
|   |-- usuarios.html
|   |-- productos.html
|   |-- clientes.html
|   |-- ventas.html
|   |-- empleados.html
|   |-- proveedores.html
|   |-- reportes/
|   |-- css/
|   `-- js/
`-- docker-compose.yml
```

## Inicio rapido con Docker

Requisitos:

- Docker instalado.
- Docker Compose disponible.

El repositorio incluye archivos de ejemplo para variables de entorno:

```txt
.env.example
backend/.env.example
```

Para ejecucion local sin Docker, se puede copiar `backend/.env.example` como `backend/.env` y ajustar los valores si fuera necesario.

Levantar todo el proyecto:

```bash
docker compose up --build
```

Servicios disponibles:

| Servicio | URL / Puerto |
|---|---|
| Frontend | http://localhost:5500 |
| Backend API | http://localhost:3000 |
| PostgreSQL | localhost:5432 |

La base de datos se inicializa automaticamente con:

```txt
database/brickland_ddl.sql
```

Si ya existe un volumen viejo de PostgreSQL y se necesita reiniciar la base desde cero:

```bash
docker compose down -v
docker compose up --build
```

## Login principal

Al abrir el frontend, el sistema muestra la pantalla de login.

Credenciales principales:

```txt
Usuario: proy2
Password: secret
```

El usuario principal se crea automaticamente en la tabla `usuario` si no existe.

## Modulos principales

| Modulo | Descripcion |
|---|---|
| Dashboard | Vista ejecutiva con metricas generales y actividad reciente. |
| Productos | CRUD de productos e inventario. |
| Clientes | CRUD de clientes. |
| Ventas | CRUD de ventas. |
| Empleados | CRUD de empleados. |
| Proveedores | CRUD de proveedores. |
| Usuarios | CRUD de usuarios persistidos en la base de datos. |
| Reportes | Indicadores de negocio con SQL visible como soporte academico. |

## Reportes disponibles

Todas las consultas se ejecutan desde la aplicacion web y muestran:

1. Titulo del reporte.
2. Resultado en tabla.
3. Consulta SQL disponible en un desplegable de soporte academico.

| Reporte | Tipo SQL | Pantalla |
|---|---|---|
| Clientes y compras acumuladas | JOIN, GROUP BY, agregaciones | `frontend/reportes/join.html` |
| Ventas por empleado | JOIN entre multiples tablas | `frontend/reportes/join-ventas-empleados.html` |
| Inventario por proveedor | JOIN, GROUP BY, agregaciones | `frontend/reportes/join-proveedores-inventario.html` |
| Productos sobre el promedio de precio | Subquery con AVG | `frontend/reportes/productos-caros.html` |
| Clientes frecuentes | Subquery con IN | `frontend/reportes/subquery-clientes.html` |
| Categorias con mayor rotacion | GROUP BY, HAVING, COUNT, SUM | `frontend/reportes/group-having.html` |
| Productos mas vendidos | JOIN, GROUP BY, SUM | `frontend/reportes/productos-mas-vendidos.html` |
| Ingresos por fecha | GROUP BY, SUM | `frontend/reportes/ingresos.html` |
| Analisis de ventas avanzadas | CTE con WITH | `frontend/reportes/ventas-cte.html` |
| Inventario detallado de productos | VIEW utilizada por backend | `frontend/reportes/vista.html` |

La transaccion explicita ya no se presenta como reporte artificial. Se ejecuta al registrar una venta real desde `frontend/ventas.html`, con `BEGIN`, `COMMIT` y `ROLLBACK` visibles en la seccion "Informacion tecnica".

## Cumplimiento de requisitos

### I. Diseno de base de datos

| Requisito | Estado |
|---|---|
| Diagrama ER con entidades, atributos, relaciones y cardinalidades | Completo en documentacion del proyecto |
| Modelo relacional documentado | Completo en documentacion del proyecto |
| Normalizacion justificada hasta 3FN | Completo en documentacion del proyecto |
| DDL completo con PRIMARY KEY, FOREIGN KEY y NOT NULL | Implementado en `database/brickland_ddl.sql` |
| Script de datos de prueba con al menos 25 registros por tabla | Implementado en `database/brickland_ddl.sql` |
| Indices definidos explicitamente con CREATE INDEX | Implementado en `database/brickland_ddl.sql` |

### II. SQL

| Requisito | Implementacion |
|---|---|
| 3 consultas con JOIN entre multiples tablas, visibles en la UI | Clientes/compras, ventas/clientes/empleados, proveedores/inventario |
| 2 consultas con subquery, visibles en la UI | Productos caros, clientes frecuentes |
| Consultas con GROUP BY, HAVING y funciones de agregacion, visibles en la UI | Categorias con mayor rotacion |
| Al menos 1 consulta usando CTE (WITH), visible en la UI | Analisis de ventas avanzadas |
| Al menos 1 VIEW utilizado por backend para alimentar la UI | Inventario detallado de productos |
| Al menos 1 transaccion explicita con manejo de error y ROLLBACK | Registro real de venta con validacion de stock |

### III. Aplicacion web

| Requisito | Implementacion |
|---|---|
| CRUD completo de al menos 2 entidades en la interfaz | Productos, clientes, ventas, empleados, proveedores y usuarios |
| Al menos 1 reporte visible en la UI con datos reales de la base de datos | Centro de reportes de negocio con multiples consultas |
| Manejo visible de errores para el usuario | Mensajes de error y estados de carga en la UI |
| README con instrucciones funcionales y ejemplo de docker compose up | Este documento |

### IV. Avanzado

| Requisito | Implementacion |
|---|---|
| Autenticacion de usuarios con login/logout y sesion | Implementado con cookie HTTP-only |

## Comandos utiles

Levantar servicios:

```bash
docker compose up --build
```

Apagar servicios:

```bash
docker compose down
```

Reiniciar base de datos desde cero:

```bash
docker compose down -v
docker compose up --build
```

## Preparacion Proyecto 3

La preparacion tecnica para Proyecto 3 esta documentada en:

- `docs/PROYECTO3_PREPARACION.md`
- `docs/PROYECTO3_CHECKLIST.md`
- `backend/src/orm/README.md`

Esta preparacion solo deja estructura, variables documentadas y checklist. No implementa ORM, roles ni stored procedures.

Ver logs:

```bash
docker compose logs -f
```

## Notas de uso

- El frontend corre en `http://localhost:5500`.
- El backend corre en `http://localhost:3000`.
- La API requiere sesion activa para acceder a los modulos protegidos.
- Los usuarios nuevos creados desde la pantalla `Usuarios` se guardan en PostgreSQL y permanecen despues de reiniciar los contenedores, mientras no se elimine el volumen de Docker.
- Si se hacen cambios en frontend o backend, usar `docker compose up --build` para reconstruir imagenes.
