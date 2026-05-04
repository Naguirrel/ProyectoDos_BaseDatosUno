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
    res.status(500).json({ error: 'Error en CTE de ventas' });
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

const transaccionVenta = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const productoResult = await client.query(`
      SELECT id_producto, nombre, stock, precio_unitario
      FROM producto
      WHERE stock > 0
      ORDER BY id_producto
      LIMIT 1;
    `);

    if (productoResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.json([{
        operacion: 'ROLLBACK',
        estado: 'Sin productos disponibles',
        detalle: 'No se encontro inventario para simular la venta'
      }]);
    }

    const producto = productoResult.rows[0];

    await client.query(
      'UPDATE producto SET stock = stock - 1 WHERE id_producto = $1',
      [producto.id_producto]
    );

    const verificacion = await client.query(
      'SELECT stock FROM producto WHERE id_producto = $1',
      [producto.id_producto]
    );

    await client.query('ROLLBACK');

    res.json([{
      operacion: 'BEGIN / UPDATE / ROLLBACK',
      producto: producto.nombre,
      stock_inicial: producto.stock,
      stock_durante_transaccion: verificacion.rows[0].stock,
      estado: 'Transaccion simulada y revertida correctamente'
    }]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error en simulacion de transaccion' });
  } finally {
    client.release();
  }
};

module.exports = {
  productosMasVendidos,
  ingresosPorFecha,
  productosCaros,
  ventasCTE,
  clientesCompras,
  vistaProductos,
  transaccionVenta
};
