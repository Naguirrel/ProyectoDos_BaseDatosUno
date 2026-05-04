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

module.exports = {
  getClientes,
  getVentas,
  getEmpleados,
  getProveedores,
  createVenta,
  updateVenta,
  deleteVenta,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado
};
