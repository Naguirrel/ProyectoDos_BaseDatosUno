# Preparacion tecnica para Proyecto 3

## Alcance de esta preparacion

Esta revision deja el proyecto listo para iniciar Proyecto 3 con Prisma ORM instalado y operativo, sin reemplazar consultas actuales, sin implementar roles y sin implementar stored procedures.

Se mantiene el comportamiento actual:

- Frontend estatico servido por Nginx.
- Backend Express con controladores existentes.
- PostgreSQL 15 como base de datos.
- Autenticacion actual por sesion.
- CRUDs y reportes actuales sin cambios funcionales.
- Transaccion real de venta conservada en el flujo de ventas.

## Estado actual del backend

El backend usa Node.js, Express y `pg`.

Puntos activos:

| Area | Archivo principal | Estado |
|---|---|---|
| Conexion PostgreSQL | `backend/src/db/connection.js` | Usa `pg.Pool` con variables `DB_*` |
| App Express | `backend/src/app.js` | Registra auth, productos, entidades y reportes |
| Productos | `backend/src/controllers/productos.controller.js` | SQL directo |
| Entidades | `backend/src/controllers/entidades.controller.js` | SQL directo y transaccion de ventas |
| Reportes | `backend/src/controllers/reportes.controller.js` | SQL directo para consultas academicas |
| Auth/usuarios | `backend/src/controllers/auth.controller.js` | SQL directo y sesiones en memoria |

## Preparacion ORM / Prisma

Se creo la carpeta:

```txt
backend/src/orm/
```

Con subcarpetas placeholder:

```txt
config/
models/
repositories/
migrations/
seeders/
```

Estas carpetas no se importan ni ejecutan todavia. Solo preparan el lugar natural para introducir repositorios o servicios alrededor de Prisma en una etapa posterior.

Prisma quedo configurado en:

```txt
backend/prisma/schema.prisma
backend/src/prisma/client.js
```

Los controladores actuales no importan Prisma. Siguen usando SQL directo con `pg`.

## Compatibilidad PostgreSQL

El esquema actual usa caracteristicas compatibles con PostgreSQL y con ORMs comunes:

- `SERIAL PRIMARY KEY`
- `VARCHAR`, `TEXT`, `DATE`, `BOOLEAN`
- `NUMERIC(10,2)`
- `CHECK`
- `UNIQUE`
- `FOREIGN KEY`
- `ON DELETE CASCADE` en tablas detalle
- indices explicitos con `CREATE INDEX`

Consideraciones para ORM:

- Mapear `NUMERIC(10,2)` con cuidado, porque muchos ORMs lo devuelven como string.
- Mantener `detalle_venta` y `detalle_compra` como modelos propios, no como arreglos embebidos.
- No usar sincronizacion automatica destructiva sobre una base con datos.
- Migrar primero entidades simples y dejar reportes SQL complejos al final.

## Docker

`docker-compose.yml` mantiene tres servicios:

| Servicio | Funcion | Puerto |
|---|---|---|
| `db` | PostgreSQL 15 | `5432` |
| `backend` | API Express | `3000` |
| `frontend` | Nginx estatico | `5500` |

Observaciones:

- `db` incluye healthcheck con `pg_isready`.
- `backend` espera a que `db` este saludable.
- `frontend` depende de `backend`.
- El frontend copia `nginx.conf` a `/etc/nginx/conf.d/default.conf`.
- La raiz de Nginx es `/usr/share/nginx/html`.
- `login.html` sigue siendo el index por defecto.

No se modifico Docker porque la configuracion actual es compatible con la preparacion ORM.

## Variables de entorno

Variables activas actuales:

| Variable | Uso |
|---|---|
| `DB_USER` | Usuario PostgreSQL |
| `DB_PASSWORD` | Password PostgreSQL |
| `DB_NAME` | Base de datos |
| `DB_HOST` | Host de PostgreSQL |
| `DB_PORT` | Puerto de PostgreSQL |
| `PORT` | Puerto del backend |

Variables documentadas para Proyecto 3:

| Variable | Proposito futuro |
|---|---|
| `ORM_DIALECT` | Motor esperado del ORM, por ahora `postgres` |
| `ORM_LOGGING` | Encender/apagar logs SQL del ORM |
| `ORM_SYNC` | Mantener en `false`; no usar sync automatico destructivo |
| `DB_SSL` | Preparar despliegues futuros con SSL si fuera necesario |

Estas variables nuevas solo quedan documentadas en `.env.example`; no cambian el runtime.

## Modulos afectados en siguientes etapas

| Modulo | Impacto esperado |
|---|---|
| Conexion DB | Agregar configuracion ORM junto a `pg` durante transicion |
| Productos | Primer candidato para migrar a modelo/repositorio ORM |
| Clientes | Migracion directa a modelo ORM |
| Proveedores | Migracion directa a modelo ORM |
| Empleados | Migracion directa, cuidando relacion con usuario |
| Ventas | Migracion mas delicada por transaccion y detalle de venta |
| Usuarios/Auth | Requiere cuidado por sesiones y credenciales |
| Reportes | Conviene mantener SQL directo o usar consultas raw del ORM |
| Docker/env | Agregar variables reales cuando se elija ORM |

## Verificacion ejecutada

Comandos y validaciones ejecutadas durante esta preparacion:

| Validacion | Resultado |
|---|---|
| `docker compose config` | Correcto |
| `node --check` en archivos principales del backend | Correcto |
| `docker compose up -d --build` | Correcto |
| PostgreSQL | `PostgreSQL 15.17` |
| Tablas publicas | Tablas principales y `vista_productos_detalle` disponibles |
| Frontend `/` | `200` |
| Backend `/` | `200` |
| Login `proy2 / secret` | Correcto |
| Endpoints CRUD de lectura | `productos`, `clientes`, `ventas`, `empleados`, `proveedores`, `usuarios` responden `200` |
| Reportes | Todos los reportes de negocio responden `200` |
| Paginas frontend principales | Login, dashboard, CRUDs y reportes responden `200` |

No se ejecutaron operaciones de escritura para esta preparacion, para conservar los datos exactamente como estaban.

## Recomendacion de orden para Proyecto 3

1. Elegir ORM y agregar dependencia.
2. Configurar conexion ORM sin reemplazar `pg` todavia.
3. Crear modelos basicos.
4. Migrar productos como prueba piloto.
5. Migrar clientes/proveedores/empleados.
6. Migrar ventas manteniendo transaccion explicita.
7. Revisar reportes como SQL raw dentro del ORM o mantener `pg`.
8. Agregar roles solo cuando auth y modelos esten estables.
9. Agregar stored procedures al final, con endpoints claramente documentados.
