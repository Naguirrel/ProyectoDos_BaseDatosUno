# ORM - Proyecto 3

Prisma ORM ya esta instalado y operativo en el backend:

```txt
backend/prisma/schema.prisma
backend/src/prisma/client.js
```

Esta carpeta queda como espacio tecnico para una posible capa futura de repositorios, migraciones o servicios alrededor de Prisma. No se importa automaticamente desde la aplicacion.

Estado actual:

- Prisma Client ya fue generado.
- Productos, Clientes y Empleados usan Prisma en sus CRUDs.
- Ventas usan stored procedure por atomicidad de negocio.
- Reportes se mantienen con SQL directo para conservar evidencia academica.
- No hay sincronizacion automatica destructiva del esquema.
- No se usan migraciones Prisma para crear la base; PostgreSQL se inicializa con scripts SQL versionados.

Estructura propuesta:

```txt
orm/
|-- config/        # Configuracion adicional si se crea capa ORM propia
|-- models/        # Documentacion o adaptadores futuros por modelo
|-- repositories/  # Repositorios futuros para aislar acceso a datos
|-- migrations/    # Migraciones futuras si se adopta Prisma Migrate
`-- seeders/       # Semillas futuras si dejan de usarse scripts SQL puros
```

Reglas de mantenimiento:

1. No activar sincronizacion automatica destructiva.
2. Mantener compatibilidad con PostgreSQL.
3. Migrar modulo por modulo.
4. Conservar SQL directo en reportes cuando sea evidencia academica.
5. Mantener el contrato JSON existente del frontend.
