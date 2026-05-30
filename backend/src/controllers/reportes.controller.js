const pool = require('../db/connection');

const SQL_QUERIES = {
  productosMasVendidos: `
SELECT 
  p.nombre,
  SUM(dv.cantidad) AS total_vendido
FROM detalle_venta dv
JOIN producto p ON dv.id_producto = p.id_producto
GROUP BY p.nombre
ORDER BY total_vendido DESC;`,
  ingresosPorFecha: `
SELECT 
  fecha,
  SUM(total) AS ingresos
FROM venta
GROUP BY fecha
ORDER BY fecha;`,
  productosCaros: `
SELECT nombre, precio_unitario
FROM producto
WHERE precio_unitario > (
  SELECT AVG(precio_unitario) FROM producto
);`,
  ventasCTE: `
WITH ventas_totales AS (
  SELECT id_producto, SUM(cantidad) AS total
  FROM detalle_venta
  GROUP BY id_producto
)
SELECT p.nombre, vt.total
FROM ventas_totales vt
JOIN producto p ON vt.id_producto = p.id_producto
ORDER BY vt.total DESC;`,
  clientesCompras: `
SELECT
  c.id_cliente,
  CONCAT(c.nombre, ' ', COALESCE(c.apellido, '')) AS cliente,
  c.email,
  COUNT(v.id_venta) AS compras_realizadas,
  COALESCE(SUM(v.total), 0) AS total_comprado
FROM cliente c
LEFT JOIN venta v ON c.id_cliente = v.id_cliente
GROUP BY c.id_cliente, c.nombre, c.apellido, c.email
ORDER BY total_comprado DESC;`,
  ventasClientesEmpleados: `
SELECT
  v.id_venta,
  v.fecha,
  CONCAT(c.nombre, ' ', COALESCE(c.apellido, '')) AS cliente,
  CONCAT(e.nombre, ' ', e.apellido) AS empleado,
  v.estado,
  v.total
FROM venta v
JOIN cliente c ON v.id_cliente = c.id_cliente
JOIN empleado e ON v.id_empleado = e.id_empleado
ORDER BY v.fecha DESC, v.id_venta DESC;`,
  proveedoresInventario: `
SELECT
  pr.nombre AS proveedor,
  c.nombre AS categoria,
  COUNT(p.id_producto) AS productos_suministrados,
  SUM(p.stock) AS stock_total,
  ROUND(AVG(p.precio_unitario), 2) AS precio_promedio
FROM proveedor pr
JOIN producto p ON pr.id_proveedor = p.id_proveedor
JOIN categoria c ON p.id_categoria = c.id_categoria
GROUP BY pr.nombre, c.nombre
ORDER BY proveedor, categoria;`,
  clientesFrecuentesSubquery: `
SELECT
  c.id_cliente,
  CONCAT(c.nombre, ' ', COALESCE(c.apellido, '')) AS cliente,
  c.email,
  c.nit
FROM cliente c
WHERE c.id_cliente IN (
  SELECT v.id_cliente
  FROM venta v
  GROUP BY v.id_cliente
  HAVING COUNT(v.id_venta) >= 1
)
ORDER BY cliente;`,
  categoriasAltaRotacion: `
SELECT
  c.nombre AS categoria,
  COUNT(DISTINCT p.id_producto) AS productos,
  SUM(dv.cantidad) AS unidades_vendidas,
  SUM(dv.subtotal) AS ingresos_generados
FROM categoria c
JOIN producto p ON c.id_categoria = p.id_categoria
JOIN detalle_venta dv ON p.id_producto = dv.id_producto
GROUP BY c.nombre
HAVING SUM(dv.cantidad) >= 2
ORDER BY unidades_vendidas DESC;`,
  vistaProductosCreate: `
CREATE OR REPLACE VIEW vista_productos_detalle AS
SELECT
  p.id_producto,
  p.nombre AS producto,
  p.precio_unitario,
  p.stock,
  c.nombre AS categoria,
  pr.nombre AS proveedor
FROM producto p
JOIN categoria c ON p.id_categoria = c.id_categoria
JOIN proveedor pr ON p.id_proveedor = pr.id_proveedor;`,
  vistaProductosSelect: `
SELECT *
FROM vista_productos_detalle
ORDER BY id_producto;`
};

const productosMasVendidos = async (req, res) => {
  try {
    const result = await pool.query(SQL_QUERIES.productosMasVendidos);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en reporte productos más vendidos' });
  }
};

const ingresosPorFecha = async (req, res) => {
    try {
      const result = await pool.query(SQL_QUERIES.ingresosPorFecha);
  
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error en reporte ingresos' });
    }
  };

const productosCaros = async (req, res) => {
  try {
    const result = await pool.query(SQL_QUERIES.productosCaros);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en productos caros' });
  }
};

const ventasCTE = async (req, res) => {
  try {
    const result = await pool.query(SQL_QUERIES.ventasCTE);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en analisis de ventas avanzadas' });
  }
};

const clientesCompras = async (req, res) => {
  try {
    const result = await pool.query(SQL_QUERIES.clientesCompras);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en reporte clientes y compras' });
  }
};

const ventasClientesEmpleados = async (req, res) => {
  try {
    const result = await pool.query(SQL_QUERIES.ventasClientesEmpleados);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en reporte ventas, clientes y empleados' });
  }
};

const proveedoresInventario = async (req, res) => {
  try {
    const result = await pool.query(SQL_QUERIES.proveedoresInventario);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en reporte proveedores e inventario' });
  }
};

const clientesFrecuentesSubquery = async (req, res) => {
  try {
    const result = await pool.query(SQL_QUERIES.clientesFrecuentesSubquery);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en reporte clientes frecuentes' });
  }
};

const categoriasAltaRotacion = async (req, res) => {
  try {
    const result = await pool.query(SQL_QUERIES.categoriasAltaRotacion);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en reporte categorias de alta rotacion' });
  }
};

const vistaProductos = async (req, res) => {
  try {
    await pool.query(SQL_QUERIES.vistaProductosCreate);
    const result = await pool.query(SQL_QUERIES.vistaProductosSelect);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar vista de productos' });
  }
};

module.exports = {
  productosMasVendidos,
  ingresosPorFecha,
  productosCaros,
  ventasCTE,
  clientesCompras,
  ventasClientesEmpleados,
  proveedoresInventario,
  clientesFrecuentesSubquery,
  categoriasAltaRotacion,
  vistaProductos
};
