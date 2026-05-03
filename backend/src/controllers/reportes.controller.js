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

module.exports = { productosMasVendidos, ingresosPorFecha };