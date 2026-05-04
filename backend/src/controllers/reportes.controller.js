const pool = require('../db/connection');

const productosMasVendidos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.nombre,
        SUM(dv.cantidad) AS total_vendido
      FROM detalle_venta dv
      JOIN producto p ON dv.id_producto = p.id_producto
      GROUP BY p.nombre
      ORDER BY total_vendido DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en reporte productos más vendidos' });
  }
};

const ingresosPorFecha = async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          fecha,
          SUM(total) AS ingresos
        FROM venta
        GROUP BY fecha
        ORDER BY fecha;
      `);
  
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error en reporte ingresos' });
    }
  };

const productosCaros = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT nombre, precio_unitario
      FROM producto
      WHERE precio_unitario > (
        SELECT AVG(precio_unitario) FROM producto
      );
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en productos caros' });
  }
};

const ventasCTE = async (req, res) => {
  try {
    const result = await pool.query(`
      WITH ventas_totales AS (
        SELECT id_producto, SUM(cantidad) AS total
        FROM detalle_venta
        GROUP BY id_producto
      )
      SELECT p.nombre, vt.total
      FROM ventas_totales vt
      JOIN producto p ON vt.id_producto = p.id_producto
      ORDER BY vt.total DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en CTE de ventas' });
  }
};

module.exports = { productosMasVendidos, ingresosPorFecha, productosCaros, ventasCTE };