# Stored procedures

El proyecto define procedimientos almacenados en PostgreSQL para operaciones centrales de negocio. El script reproducible está en:

```txt
database/stored_procedures.sql
```

Docker lo monta como `02-stored-procedures.sql`, por lo que una base nueva lo ejecuta automáticamente al inicializarse.

## Procedimientos creados

| Procedimiento | Uso de negocio | Ejecutado desde backend |
|---|---|---|
| `registrar_venta` | Registra una venta, valida cliente/empleado/productos, descuenta inventario e inserta detalle de venta | `POST /ventas` |
| `actualizar_stock` | Actualiza stock en modo `SET` o `ADD`; impide inventario negativo | `PUT /productos/:id` y desde `registrar_venta` |
| `crear_producto` | Crea productos con validaciones base | `POST /productos` |
| `registrar_cliente` | Crea clientes con validación de datos únicos | `POST /clientes` |
| `generar_resumen_ventas` | Genera el resumen de ingresos agrupado por fecha | `GET /reportes/ingresos` |

## Formato de consumo

Los procedimientos retornan un parámetro `INOUT resultado jsonb`. El backend los ejecuta con `CALL` y transforma ese JSON a la misma respuesta que ya consumía el frontend.

Ejemplo interno:

```sql
CALL crear_producto(..., NULL);
```

## Compatibilidad

- No se cambian rutas públicas de la API.
- No se cambia la estructura esperada por la interfaz.
- Los errores de negocio siguen devolviendo mensajes amigables.
- La venta sigue siendo atómica: si el procedimiento lanza error por stock insuficiente, producto inexistente o datos inválidos, PostgreSQL revierte el `CALL`.
