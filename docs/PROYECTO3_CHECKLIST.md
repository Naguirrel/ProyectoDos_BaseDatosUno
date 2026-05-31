# Checklist final Proyecto 3

Este checklist resume el estado actual del proyecto despues de la auditoria tecnica. No introduce funcionalidades nuevas; documenta y verifica lo que ya esta implementado.

## Base de datos y Docker

- [x] PostgreSQL 15 configurado en Docker.
- [x] `docker-compose.yml` levanta base de datos, backend y frontend.
- [x] Base inicializada desde cero con `database/brickland_ddl.sql`.
- [x] Usuarios de prueba inicializados con `database/auth_test_users.sql`.
- [x] Stored procedures inicializados con `database/stored_procedures.sql`.
- [x] Roles PostgreSQL inicializados con `database/security_roles.sql`.
- [x] Variables documentadas en `.env.example` y `backend/.env.example`.
- [x] Compatibilidad con PostgreSQL verificada.

## ORM

- [x] Prisma ORM instalado.
- [x] Prisma Client configurado.
- [x] `backend/prisma/schema.prisma` creado desde la base existente.
- [x] `DATABASE_URL` documentada.
- [x] `prisma generate` integrado al build del backend.
- [x] Modelos detectados documentados en `docs/PRISMA_MODELOS_DETECTADOS.md`.
- [x] CRUD de Productos migrado a Prisma.
- [x] CRUD de Clientes migrado a Prisma.
- [x] CRUD de Empleados migrado a Prisma.
- [x] Reportes SQL conservados sin migrar para mantener evidencia academica.
- [x] Autenticacion conservada compatible con el frontend.

## Seguridad y roles

- [x] Roles PostgreSQL creados con `CREATE ROLE`:
  - `administrador`
  - `gerente`
  - `vendedor`
  - `bodeguero`
  - `analista`
- [x] Permisos granulares asignados con `GRANT`.
- [x] Permisos amplios revocados con `REVOKE`.
- [x] Matriz de permisos documentada en `docs/SEGURIDAD_ROLES_DB.md`.
- [x] Usuarios de prueba por rol creados en la tabla `usuario`.
- [x] Login mantiene compatibilidad con `proy2 / secret`.
- [x] El rol se guarda en sesion y se expone al frontend.
- [x] Middleware reutilizable de autorizacion implementado.
- [x] Rutas devuelven `403 Forbidden` cuando el rol no tiene permiso.
- [x] Interfaz oculta enlaces y acciones no permitidas segun rol.

## Stored procedures y transacciones

- [x] Cinco stored procedures creados en PostgreSQL:
  - `registrar_venta`
  - `actualizar_stock`
  - `crear_producto`
  - `registrar_cliente`
  - `generar_resumen_ventas`
- [x] Procedures documentados en `docs/STORED_PROCEDURES.md`.
- [x] Backend ejecuta procedures con `CALL`.
- [x] `registrar_venta` concentra la logica de negocio de venta.
- [x] `registrar_venta` recibe parametros de entrada y salida.
- [x] `registrar_venta` valida stock con bloqueo de filas.
- [x] `registrar_venta` ejecuta `COMMIT` en exito.
- [x] `registrar_venta` ejecuta `ROLLBACK` ante stock insuficiente o excepcion.
- [x] La UI muestra evidencia tecnica de `BEGIN`, `COMMIT` y `ROLLBACK` en ventas.

## Reportes SQL

- [x] Reportes orientados a negocio, no a nombres academicos.
- [x] SQL visible en UI como soporte academico.
- [x] Al menos tres consultas con JOIN visibles en UI.
- [x] Al menos dos consultas con subquery visibles en UI.
- [x] Consulta con `GROUP BY`, `HAVING` y funciones de agregacion visible en UI.
- [x] Consulta con CTE (`WITH`) visible en UI.
- [x] VIEW consumida por backend para alimentar UI.
- [x] Reporte artificial de transaccion removido; la transaccion vive en ventas.

## Aplicacion web

- [x] CRUD completo de Productos.
- [x] CRUD completo de Clientes.
- [x] CRUD completo de Empleados.
- [x] CRUD de Ventas conservado con transaccion real.
- [x] CRUD de Proveedores conservado.
- [x] CRUD de Usuarios para administrador.
- [x] Manejo visible de errores y estados de carga.
- [x] Navegacion funcional por rol.
- [x] README actualizado con instrucciones Docker.

## Validacion final

- [x] `docker compose config`
- [x] `docker compose down -v`
- [x] `docker compose up -d --build`
- [x] Contenedores `brickland_db`, `brickland_api` y `brickland_frontend` levantan correctamente.
- [x] Login principal `proy2 / secret`.
- [x] Roles PostgreSQL presentes en la base.
- [x] Usuarios de prueba presentes en la base.
- [x] Stored procedures presentes en la base.
- [x] Prisma valida el esquema.
- [x] Ruta protegida devuelve `403 Forbidden` cuando corresponde.
- [x] Reportes responden con sesion autorizada.
- [x] Venta con stock insuficiente responde error y no modifica inventario.

## Modulos afectados en Proyecto 3

| Modulo | Cambios aplicados |
|---|---|
| Base de datos | Roles, permisos, usuarios semilla y procedures |
| Backend | Prisma en CRUDs seleccionados, middleware RBAC y consumo de procedures |
| Frontend | Visibilidad por rol y evidencia tecnica en reportes/ventas |
| Docker | Inicializacion completa desde cero |
| Documentacion | README, checklist, roles, procedures y Prisma |
