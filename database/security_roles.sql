-- ============================================================
-- BrickLand Store - Seguridad DBMS Proyecto 3
-- PostgreSQL roles y permisos granulares
-- ============================================================
--
-- Ejecutar conectado a la base de datos brickland con un usuario
-- propietario/superusuario, por ejemplo:
-- psql -U proy2 -d brickland -f database/security_roles.sql
--
-- Este script es reproducible: crea los roles si no existen,
-- revoca permisos previos sobre el esquema public y vuelve a
-- asignar permisos granulares por responsabilidad de negocio.

BEGIN;

-- ------------------------------------------------------------
-- 1. Crear exactamente los roles requeridos
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'administrador') THEN
    CREATE ROLE administrador NOLOGIN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gerente') THEN
    CREATE ROLE gerente NOLOGIN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'vendedor') THEN
    CREATE ROLE vendedor NOLOGIN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'bodeguero') THEN
    CREATE ROLE bodeguero NOLOGIN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'analista') THEN
    CREATE ROLE analista NOLOGIN;
  END IF;
END
$$;

-- ------------------------------------------------------------
-- 2. Revocar permisos amplios y limpiar permisos previos
-- ------------------------------------------------------------
REVOKE ALL ON SCHEMA public FROM PUBLIC;

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public
FROM administrador, gerente, vendedor, bodeguero, analista;

REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public
FROM administrador, gerente, vendedor, bodeguero, analista;

REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public
FROM administrador, gerente, vendedor, bodeguero, analista;

REVOKE ALL PRIVILEGES ON DATABASE brickland
FROM administrador, gerente, vendedor, bodeguero, analista;

-- Todos los roles necesitan conectarse a la base y usar el esquema.
GRANT CONNECT ON DATABASE brickland
TO administrador, gerente, vendedor, bodeguero, analista;

GRANT USAGE ON SCHEMA public
TO administrador, gerente, vendedor, bodeguero, analista;

-- ------------------------------------------------------------
-- 3. Administrador: acceso total
-- ------------------------------------------------------------
GRANT CREATE ON SCHEMA public TO administrador;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO administrador;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO administrador;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO administrador;

-- ------------------------------------------------------------
-- 4. Gerente: lectura operativa y reportes
-- ------------------------------------------------------------
GRANT SELECT ON
  cliente,
  empleado,
  producto,
  categoria,
  proveedor,
  venta,
  detalle_venta
TO gerente;

-- ------------------------------------------------------------
-- 5. Vendedor: gestion de ventas y lectura comercial
-- ------------------------------------------------------------
GRANT SELECT ON
  cliente,
  empleado,
  producto,
  categoria,
  proveedor
TO vendedor;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  venta,
  detalle_venta
TO vendedor;

-- La venta descuenta inventario; solo se permite actualizar stock.
GRANT UPDATE (stock) ON producto TO vendedor;

GRANT USAGE, SELECT ON SEQUENCE
  venta_id_venta_seq,
  detalle_venta_id_detalle_seq
TO vendedor;

-- ------------------------------------------------------------
-- 6. Bodeguero: gestion de inventario y compras
-- ------------------------------------------------------------
GRANT SELECT ON
  categoria,
  proveedor,
  producto
TO bodeguero;

GRANT INSERT, UPDATE, DELETE ON producto TO bodeguero;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  compra,
  detalle_compra
TO bodeguero;

GRANT USAGE, SELECT ON SEQUENCE
  producto_id_producto_seq,
  compra_id_compra_seq,
  detalle_compra_id_detalle_seq
TO bodeguero;

-- ------------------------------------------------------------
-- 7. Analista: solo lectura para reportes
-- ------------------------------------------------------------
GRANT SELECT ON
  cliente,
  empleado,
  producto,
  categoria,
  proveedor,
  venta,
  detalle_venta
TO analista;

-- La vista de reportes puede existir si ya se ejecuto el modulo
-- correspondiente. El grant es condicional para mantener el script
-- reproducible en bases recien inicializadas.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'vista_productos_detalle'
      AND c.relkind IN ('v', 'm')
  ) THEN
    GRANT SELECT ON vista_productos_detalle TO gerente, analista;
  END IF;
END
$$;

COMMIT;
