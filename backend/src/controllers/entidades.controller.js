const pool = require('../db/connection');

const getClientes = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_cliente, nombre, apellido, telefono, email, nit, fecha_registro
      FROM cliente
      ORDER BY id_cliente;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

const getVentas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        v.id_venta,
        v.fecha,
        v.total,
        v.estado,
        v.id_cliente,
        v.id_empleado,
        CONCAT(c.nombre, ' ', COALESCE(c.apellido, '')) AS cliente,
        CONCAT(e.nombre, ' ', e.apellido) AS empleado
      FROM venta v
      JOIN cliente c ON v.id_cliente = c.id_cliente
      JOIN empleado e ON v.id_empleado = e.id_empleado
      ORDER BY v.id_venta;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
};

const createCliente = async (req, res) => {
  try {
    const { nombre, apellido, telefono, email, nit, fecha_registro } = req.body;

    if (!nombre || !fecha_registro) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const result = await pool.query(
      `INSERT INTO cliente (nombre, apellido, telefono, email, nit, fecha_registro)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nombre, apellido || null, telefono || null, email || null, nit || null, fecha_registro]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
};

const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, telefono, email, nit, fecha_registro } = req.body;

    const result = await pool.query(
      `UPDATE cliente
       SET nombre = $1, apellido = $2, telefono = $3, email = $4, nit = $5, fecha_registro = $6
       WHERE id_cliente = $7
       RETURNING *`,
      [nombre, apellido || null, telefono || null, email || null, nit || null, fecha_registro, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};

const deleteCliente = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query('BEGIN');
    await client.query(`
      DELETE FROM detalle_venta
      WHERE id_venta IN (SELECT id_venta FROM venta WHERE id_cliente = $1)
    `, [id]);
    await client.query(`DELETE FROM venta WHERE id_cliente = $1`, [id]);

    const result = await client.query(
      `DELETE FROM cliente WHERE id_cliente = $1 RETURNING id_cliente`,
      [id]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    await client.query('COMMIT');
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  } finally {
    client.release();
  }
};

const getEmpleados = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_empleado, nombre, apellido, cargo, telefono, email, fecha_contratacion, activo
      FROM empleado
      WHERE activo = TRUE
      ORDER BY id_empleado;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
};

const createVenta = async (req, res) => {
  try {
    const { fecha, total, estado, id_cliente, id_empleado } = req.body;

    if (!fecha || total === undefined || !id_cliente || !id_empleado) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const result = await pool.query(
      `INSERT INTO venta (fecha, total, estado, id_cliente, id_empleado)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [fecha, total, estado || 'COMPLETADA', id_cliente, id_empleado]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear venta' });
  }
};

const updateVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, total, estado, id_cliente, id_empleado } = req.body;

    const result = await pool.query(
      `UPDATE venta
       SET fecha = $1, total = $2, estado = $3, id_cliente = $4, id_empleado = $5
       WHERE id_venta = $6
       RETURNING *`,
      [fecha, total, estado, id_cliente, id_empleado, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar venta' });
  }
};

const deleteVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM venta WHERE id_venta = $1 RETURNING id_venta`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.json({ message: 'Venta eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar venta' });
  }
};

const createEmpleado = async (req, res) => {
  try {
    const { nombre, apellido, cargo, telefono, email, fecha_contratacion, activo } = req.body;

    if (!nombre || !apellido || !fecha_contratacion) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const result = await pool.query(
      `INSERT INTO empleado (nombre, apellido, cargo, telefono, email, fecha_contratacion, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [nombre, apellido, cargo || null, telefono || null, email || null, fecha_contratacion, activo !== false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear empleado' });
  }
};

const updateEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, cargo, telefono, email, fecha_contratacion, activo } = req.body;

    const result = await pool.query(
      `UPDATE empleado
       SET nombre = $1, apellido = $2, cargo = $3, telefono = $4, email = $5, fecha_contratacion = $6, activo = $7
       WHERE id_empleado = $8
       RETURNING *`,
      [nombre, apellido, cargo || null, telefono || null, email || null, fecha_contratacion, activo !== false, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar empleado' });
  }
};

const deleteEmpleado = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(`DELETE FROM usuario WHERE id_empleado = $1`, [id]);

    try {
      const result = await pool.query(
        `DELETE FROM empleado WHERE id_empleado = $1 RETURNING id_empleado`,
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Empleado no encontrado' });
      }

      return res.json({ message: 'Empleado eliminado correctamente' });
    } catch (error) {
      if (error.code !== '23503') {
        throw error;
      }

      const result = await pool.query(
        `UPDATE empleado SET activo = FALSE WHERE id_empleado = $1 RETURNING id_empleado`,
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Empleado no encontrado' });
      }

      return res.json({ message: 'Empleado desactivado por tener registros asociados' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar empleado' });
  }
};

const getProveedores = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_proveedor, nombre, contacto, telefono, email, direccion
      FROM proveedor
      ORDER BY id_proveedor;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

const createProveedor = async (req, res) => {
  try {
    const { nombre, contacto, telefono, email, direccion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const result = await pool.query(
      `INSERT INTO proveedor (nombre, contacto, telefono, email, direccion)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nombre, contacto || null, telefono || null, email || null, direccion || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear proveedor' });
  }
};

const updateProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, contacto, telefono, email, direccion } = req.body;

    const result = await pool.query(
      `UPDATE proveedor
       SET nombre = $1, contacto = $2, telefono = $3, email = $4, direccion = $5
       WHERE id_proveedor = $6
       RETURNING *`,
      [nombre, contacto || null, telefono || null, email || null, direccion || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar proveedor' });
  }
};

const deleteProveedor = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query('BEGIN');
    await client.query(`DELETE FROM detalle_compra WHERE id_compra IN (SELECT id_compra FROM compra WHERE id_proveedor = $1)`, [id]);
    await client.query(`DELETE FROM compra WHERE id_proveedor = $1`, [id]);
    await client.query(`DELETE FROM detalle_venta WHERE id_producto IN (SELECT id_producto FROM producto WHERE id_proveedor = $1)`, [id]);
    await client.query(`DELETE FROM detalle_compra WHERE id_producto IN (SELECT id_producto FROM producto WHERE id_proveedor = $1)`, [id]);
    await client.query(`DELETE FROM producto WHERE id_proveedor = $1`, [id]);

    const result = await client.query(
      `DELETE FROM proveedor WHERE id_proveedor = $1 RETURNING id_proveedor`,
      [id]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    await client.query('COMMIT');
    res.json({ message: 'Proveedor eliminado correctamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar proveedor' });
  } finally {
    client.release();
  }
};

module.exports = {
  getClientes,
  getVentas,
  getEmpleados,
  getProveedores,
  createVenta,
  updateVenta,
  deleteVenta,
  createCliente,
  updateCliente,
  deleteCliente,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
  createProveedor,
  updateProveedor,
  deleteProveedor
};
