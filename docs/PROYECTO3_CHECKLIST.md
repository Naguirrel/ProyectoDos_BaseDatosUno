# Checklist interno Proyecto 3

## Preparacion actual

- [x] Proyecto analizado.
- [x] Docker revisado.
- [x] Variables de entorno revisadas.
- [x] Compatibilidad PostgreSQL revisada.
- [x] Estructura placeholder para ORM creada.
- [x] Prisma ORM instalado y operativo sin reemplazar consultas actuales.
- [x] Documentacion tecnica inicial creada.
- [x] Checklist interno creado.
- [x] Validacion de funcionamiento actual ejecutada con Docker.

## ORM

- [ ] Elegir ORM.
- [ ] Instalar dependencia ORM.
- [ ] Crear configuracion real de ORM.
- [ ] Crear modelos para tablas principales.
- [ ] Crear repositorios o capa de acceso a datos.
- [ ] Definir estrategia de migraciones.
- [ ] Evitar `sync: true` destructivo.
- [ ] Mantener compatibilidad con PostgreSQL.

## Migracion por modulos

- [ ] Migrar productos.
- [ ] Migrar clientes.
- [ ] Migrar proveedores.
- [ ] Migrar empleados.
- [ ] Migrar usuarios/auth.
- [ ] Migrar ventas y detalle de venta.
- [ ] Validar transaccion explicita de ventas despues de migrar.
- [ ] Revisar reportes como SQL raw o consultas ORM.

## Roles

- [ ] Definir roles requeridos.
- [ ] Definir permisos por modulo.
- [ ] Implementar middleware de autorizacion.
- [ ] Ajustar UI segun permisos.

Nota: roles no se implementan en esta preparacion.

## Stored procedures

- [ ] Identificar operaciones candidatas.
- [ ] Disenar procedimientos en PostgreSQL.
- [ ] Crear scripts SQL versionados.
- [ ] Exponer endpoints seguros.
- [ ] Documentar llamadas y errores.

Nota: stored procedures no se implementan en esta preparacion.

## Validacion

- [x] `docker compose config`
- [x] `docker compose up -d --build`
- [x] Login con `proy2 / secret`
- [x] Dashboard carga
- [x] CRUD productos responde
- [x] CRUD clientes responde
- [x] CRUD proveedores responde
- [x] CRUD empleados responde
- [ ] Registro de venta con detalle
- [ ] Rollback por stock insuficiente
- [x] Reportes de negocio responden 200
