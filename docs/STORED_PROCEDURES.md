# Stored procedures

El proyecto define procedimientos almacenados en PostgreSQL para operaciones centrales de negocio. El script reproducible esta en:

```txt
database/stored_procedures.sql
```

Docker lo monta como `03-stored-procedures.sql`, por lo que una base nueva lo ejecuta automaticamente antes de aplicar los roles PostgreSQL.

## Procedimientos creados

| Procedimiento | Uso de negocio | Ejecutado desde backend |
|---|---|---|
| `registrar_venta` | Registra una venta, valida stock, descuenta inventario e inserta detalle | `POST /ventas` |
| `actualizar_stock` | Actualiza stock en modo `SET` o `ADD`; impide inventario negativo | `PUT /productos/:id` y operaciones de inventario |
| `crear_producto` | Crea productos con validaciones base | `POST /productos` |
| `registrar_cliente` | Crea clientes con validacion de datos unicos | `POST /clientes` |
| `generar_resumen_ventas` | Genera resumen de ingresos agrupado por fecha | `GET /reportes/ingresos` |

## Formato de consumo

Los procedimientos retornan un parametro `INOUT resultado jsonb`. El backend los ejecuta con `CALL` y transforma ese JSON a la misma respuesta que consume el frontend.

Ejemplo:

```sql
CALL crear_producto(..., NULL);
```

## Procedimiento principal: registrar_venta

`registrar_venta` concentra toda la logica de negocio de una venta:

- Recibe fecha, estado, cliente, empleado y detalles de productos.
- Valida que cliente y empleado existan.
- Agrupa cantidades por producto.
- Bloquea productos con `FOR UPDATE`.
- Valida stock antes de insertar la venta.
- Si falta stock, ejecuta `ROLLBACK` y retorna JSON con `status: 409`.
- Si todo es valido, actualiza inventario, inserta `venta`, inserta `detalle_venta` y ejecuta `COMMIT`.
- Si ocurre una excepcion, retorna JSON de error y ejecuta `ROLLBACK`.

La operacion es atomica: no se descuenta inventario ni se insertan detalles si la venta no puede completarse.

## Evidencia tecnica de transaccion

PostgreSQL no permite iniciar una transaccion nueva dentro de PL/pgSQL con `START TRANSACTION` cuando el `CALL` ya corre en contexto transaccional. Por eso el procedimiento documenta el inicio logico de la operacion y controla el cierre con:

```sql
COMMIT;
ROLLBACK;
```

El frontend muestra esta informacion en el modulo de ventas como evidencia academica de transaccion explicita.

## Compatibilidad

- No se cambiaron rutas publicas de la API.
- No se cambio la estructura esperada por el frontend.
- Los errores de negocio devuelven mensajes amigables.
- Los reportes SQL se conservan como consultas visibles en la UI.
- Prisma convive con los procedures: algunos CRUDs usan Prisma y las operaciones centrales usan `CALL`.

## Validacion sugerida

Ver procedures instalados:

```bash
docker compose exec db psql -U proy2 -d brickland -c "SELECT proname FROM pg_proc WHERE proname IN ('registrar_venta','actualizar_stock','crear_producto','registrar_cliente','generar_resumen_ventas') ORDER BY proname;"
```

Probar rollback por stock insuficiente desde la API:

```bash
curl -i -X POST http://localhost:3000/ventas \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{\"id_cliente\":1,\"id_empleado\":1,\"detalle\":[{\"id_producto\":1,\"cantidad\":999999}]}"
```
