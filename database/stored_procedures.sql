-- ============================================================
-- BrickLand Store - Stored Procedures PostgreSQL
-- ============================================================
-- Procedimientos consumidos desde el backend de la aplicacion.

DROP PROCEDURE IF EXISTS registrar_venta(date, varchar, integer, integer, jsonb, INOUT jsonb);
DROP PROCEDURE IF EXISTS actualizar_stock(integer, integer, varchar, INOUT jsonb);
DROP PROCEDURE IF EXISTS crear_producto(varchar, text, numeric, integer, integer, integer, integer, INOUT jsonb);
DROP PROCEDURE IF EXISTS registrar_cliente(varchar, varchar, varchar, varchar, varchar, date, INOUT jsonb);
DROP PROCEDURE IF EXISTS generar_resumen_ventas(INOUT jsonb);

CREATE PROCEDURE actualizar_stock(
  IN p_id_producto integer,
  IN p_cantidad integer,
  IN p_modo varchar,
  INOUT resultado jsonb
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_producto producto%ROWTYPE;
  v_nuevo_stock integer;
BEGIN
  IF p_id_producto IS NULL OR p_cantidad IS NULL THEN
    RAISE EXCEPTION 'Producto y cantidad son obligatorios';
  END IF;

  SELECT *
  INTO v_producto
  FROM producto
  WHERE id_producto = p_id_producto
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Producto inexistente';
  END IF;

  IF UPPER(COALESCE(p_modo, 'SET')) = 'ADD' THEN
    v_nuevo_stock := v_producto.stock + p_cantidad;
  ELSE
    v_nuevo_stock := p_cantidad;
  END IF;

  IF v_nuevo_stock < 0 THEN
    RAISE EXCEPTION 'Stock insuficiente para completar la venta';
  END IF;

  UPDATE producto
  SET stock = v_nuevo_stock
  WHERE id_producto = p_id_producto
  RETURNING *
  INTO v_producto;

  resultado := to_jsonb(v_producto);
END;
$$;

CREATE PROCEDURE crear_producto(
  IN p_nombre varchar,
  IN p_descripcion text,
  IN p_precio_unitario numeric,
  IN p_stock integer,
  IN p_stock_minimo integer,
  IN p_id_categoria integer,
  IN p_id_proveedor integer,
  INOUT resultado jsonb
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_producto producto%ROWTYPE;
BEGIN
  IF p_nombre IS NULL OR TRIM(p_nombre) = ''
     OR p_precio_unitario IS NULL
     OR p_id_categoria IS NULL
     OR p_id_proveedor IS NULL THEN
    RAISE EXCEPTION 'Faltan campos obligatorios';
  END IF;

  INSERT INTO producto (
    nombre,
    descripcion,
    precio_unitario,
    stock,
    stock_minimo,
    id_categoria,
    id_proveedor
  )
  VALUES (
    p_nombre,
    NULLIF(p_descripcion, ''),
    p_precio_unitario,
    COALESCE(p_stock, 0),
    COALESCE(p_stock_minimo, 0),
    p_id_categoria,
    p_id_proveedor
  )
  RETURNING *
  INTO v_producto;

  resultado := to_jsonb(v_producto);
END;
$$;

CREATE PROCEDURE registrar_cliente(
  IN p_nombre varchar,
  IN p_apellido varchar,
  IN p_telefono varchar,
  IN p_email varchar,
  IN p_nit varchar,
  IN p_fecha_registro date,
  INOUT resultado jsonb
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_cliente cliente%ROWTYPE;
BEGIN
  IF p_nombre IS NULL OR TRIM(p_nombre) = '' OR p_fecha_registro IS NULL THEN
    RAISE EXCEPTION 'Faltan campos obligatorios';
  END IF;

  INSERT INTO cliente (
    nombre,
    apellido,
    telefono,
    email,
    nit,
    fecha_registro
  )
  VALUES (
    p_nombre,
    NULLIF(p_apellido, ''),
    NULLIF(p_telefono, ''),
    NULLIF(p_email, ''),
    NULLIF(p_nit, ''),
    p_fecha_registro
  )
  RETURNING *
  INTO v_cliente;

  resultado := to_jsonb(v_cliente);
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Ya existe un cliente con ese email o NIT';
END;
$$;

CREATE PROCEDURE registrar_venta(
  IN p_fecha date,
  IN p_estado varchar,
  IN p_id_cliente integer,
  IN p_id_empleado integer,
  IN p_detalles jsonb,
  INOUT resultado jsonb
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_cliente_existe integer;
  v_empleado_existe integer;
  v_venta venta%ROWTYPE;
  v_producto record;
  v_detalle record;
  v_total numeric(10,2) := 0;
  v_detalles_resultado jsonb := '[]'::jsonb;
  v_stock_resultado jsonb;
BEGIN
  IF p_fecha IS NULL OR p_id_cliente IS NULL OR p_id_empleado IS NULL
     OR p_detalles IS NULL OR jsonb_typeof(p_detalles) <> 'array'
     OR jsonb_array_length(p_detalles) = 0 THEN
    RAISE EXCEPTION 'Faltan campos obligatorios';
  END IF;

  SELECT 1 INTO v_cliente_existe
  FROM cliente
  WHERE id_cliente = p_id_cliente;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cliente inexistente';
  END IF;

  SELECT 1 INTO v_empleado_existe
  FROM empleado
  WHERE id_empleado = p_id_empleado
    AND activo = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Empleado inexistente o inactivo';
  END IF;

  CREATE TEMP TABLE tmp_detalles_venta (
    id_producto integer,
    cantidad integer
  ) ON COMMIT DROP;

  INSERT INTO tmp_detalles_venta (id_producto, cantidad)
  SELECT id_producto, SUM(cantidad)::integer
  FROM jsonb_to_recordset(p_detalles) AS detalle(id_producto integer, cantidad integer)
  WHERE id_producto IS NOT NULL
    AND cantidad IS NOT NULL
    AND cantidad > 0
  GROUP BY id_producto;

  IF NOT EXISTS (SELECT 1 FROM tmp_detalles_venta) THEN
    RAISE EXCEPTION 'Producto o cantidad invalida';
  END IF;

  FOR v_detalle IN
    SELECT id_producto, cantidad
    FROM tmp_detalles_venta
    ORDER BY id_producto
  LOOP
    SELECT id_producto, nombre, stock, precio_unitario
    INTO v_producto
    FROM producto
    WHERE id_producto = v_detalle.id_producto
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Producto inexistente';
    END IF;

    IF v_detalle.cantidad > v_producto.stock THEN
      RAISE EXCEPTION 'Stock insuficiente para completar la venta';
    END IF;

    v_total := v_total + (v_producto.precio_unitario * v_detalle.cantidad);
  END LOOP;

  INSERT INTO venta (fecha, total, estado, id_cliente, id_empleado)
  VALUES (p_fecha, v_total, COALESCE(NULLIF(p_estado, ''), 'COMPLETADA'), p_id_cliente, p_id_empleado)
  RETURNING *
  INTO v_venta;

  FOR v_detalle IN
    SELECT id_producto, cantidad
    FROM tmp_detalles_venta
    ORDER BY id_producto
  LOOP
    SELECT id_producto, nombre, stock, precio_unitario
    INTO v_producto
    FROM producto
    WHERE id_producto = v_detalle.id_producto
    FOR UPDATE;

    v_stock_resultado := NULL;
    CALL actualizar_stock(v_detalle.id_producto, -v_detalle.cantidad, 'ADD', v_stock_resultado);

    INSERT INTO detalle_venta (
      id_venta,
      id_producto,
      cantidad,
      precio_unitario,
      subtotal
    )
    VALUES (
      v_venta.id_venta,
      v_detalle.id_producto,
      v_detalle.cantidad,
      v_producto.precio_unitario,
      v_producto.precio_unitario * v_detalle.cantidad
    );

    v_detalles_resultado := v_detalles_resultado || jsonb_build_array(
      jsonb_build_object(
        'id_producto', v_detalle.id_producto,
        'cantidad', v_detalle.cantidad,
        'precio_unitario', v_producto.precio_unitario,
        'subtotal', v_producto.precio_unitario * v_detalle.cantidad
      )
    );
  END LOOP;

  resultado := to_jsonb(v_venta)
    || jsonb_build_object(
      'detalles', v_detalles_resultado,
      'message', 'Venta registrada correctamente'
    );
END;
$$;

CREATE PROCEDURE generar_resumen_ventas(INOUT resultado jsonb)
LANGUAGE plpgsql
AS $$
BEGIN
  SELECT COALESCE(jsonb_agg(to_jsonb(resumen) ORDER BY resumen.fecha), '[]'::jsonb)
  INTO resultado
  FROM (
    SELECT
      fecha,
      SUM(total) AS ingresos
    FROM venta
    GROUP BY fecha
  ) resumen;
END;
$$;
