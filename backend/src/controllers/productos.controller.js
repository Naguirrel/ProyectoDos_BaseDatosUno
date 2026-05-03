const pool = require('../db/connection');

const getProductos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id_producto, p.nombre, p.precio_unitario, p.stock,
             c.nombre AS categoria,
             pr.nombre AS proveedor
      FROM producto p
      JOIN categoria c ON p.id_categoria = c.id_categoria
      JOIN proveedor pr ON p.id_proveedor = pr.id_proveedor
      ORDER BY p.id_producto;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

const createProducto = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio_unitario,
      stock,
      stock_minimo,
      id_categoria,
      id_proveedor
    } = req.body;

    // Validación básica
    if (!nombre || !precio_unitario || !id_categoria || !id_proveedor) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const result = await pool.query(
      `INSERT INTO producto 
      (nombre, descripcion, precio_unitario, stock, stock_minimo, id_categoria, id_proveedor)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [nombre, descripcion, precio_unitario, stock, stock_minimo, id_categoria, id_proveedor]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

module.exports = { getProductos, createProducto };