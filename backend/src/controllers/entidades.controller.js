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
      ORDER BY id_empleado;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener empleados' });
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
  getProveedores
};
