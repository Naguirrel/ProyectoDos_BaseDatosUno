# Preparacion ORM - Proyecto 3

Esta carpeta queda preparada para introducir un ORM en Proyecto 3 sin modificar todavia el comportamiento actual del backend.

Estado actual:

- La aplicacion sigue usando `pg` directamente desde `backend/src/db/connection.js`.
- No hay modelos ORM activos.
- No hay migraciones ORM activas.
- No hay sincronizacion automatica de esquema.
- No hay cambios en rutas, controladores ni autenticacion.

Estructura propuesta:

```txt
orm/
|-- config/        # Configuracion futura del ORM y conexion por ambiente
|-- models/        # Modelos futuros: Producto, Cliente, Venta, DetalleVenta, etc.
|-- repositories/  # Capa futura de acceso a datos para aislar consultas
|-- migrations/    # Migraciones futuras versionadas
`-- seeders/       # Datos iniciales futuros, si el ORM elegido los soporta
```

Reglas para la siguiente etapa:

1. Elegir el ORM antes de agregar dependencias.
2. Mantener compatibilidad con PostgreSQL.
3. No activar `sync` automatico contra produccion.
4. Migrar modulo por modulo para evitar romper endpoints existentes.
5. Conservar consultas SQL complejas de reportes cuando tengan valor academico.
