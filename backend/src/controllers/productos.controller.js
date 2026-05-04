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

const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio_unitario, stock } = req.body;

    const result = await pool.query(
      `UPDATE producto 
       SET nombre = $1, precio_unitario = $2, stock = $3
       WHERE id_producto = $4
       RETURNING *`,
      [nombre, precio_unitario, stock, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

const deleteProducto = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    await client.query('BEGIN');
    await client.query(`DELETE FROM detalle_venta WHERE id_producto = $1`, [id]);
    await client.query(`DELETE FROM detalle_compra WHERE id_producto = $1`, [id]);

    const result = await client.query(
      `DELETE FROM producto WHERE id_producto = $1 RETURNING id_producto`,
      [id]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await client.query('COMMIT');
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  } finally {
    client.release();
  }
};

module.exports = { getProductos, createProducto, updateProducto, deleteProducto };
