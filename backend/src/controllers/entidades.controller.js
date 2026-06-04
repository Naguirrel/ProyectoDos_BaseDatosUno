const pool = require('../db/connection');
const prisma = require('../prisma/client');

const getClientes = async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      select: {
        id_cliente: true,
        nombre: true,
        apellido: true,
        telefono: true,
        email: true,
        nit: true,
        fecha_registro: true
      },
      orderBy: {
        id_cliente: 'asc'
      }
    });

    res.json(clientes);
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
      `CALL registrar_cliente($1, $2, $3, $4, $5, $6, NULL)`,
      [
        nombre,
        apellido || null,
        telefono || null,
        email || null,
        nit || null,
        fecha_registro
      ]
    );

    const cliente = result.rows[0].resultado;

    res.status(201).json(cliente);
  } catch (error) {
    if (error.message && error.message.includes('Ya existe un cliente')) {
      return res.status(400).json({ error: 'Ya existe un cliente con ese email o NIT' });
    }

    console.error(error);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
};

const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, telefono, email, nit, fecha_registro } = req.body;

    const cliente = await prisma.cliente.update({
      where: {
        id_cliente: Number(id)
      },
      data: {
        nombre,
        apellido: apellido || null,
        telefono: telefono || null,
        email: email || null,
        nit: nit || null,
        fecha_registro: new Date(fecha_registro)
      }
    });

    res.json(cliente);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Ya existe un cliente con ese email o NIT' });
    }

    console.error(error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};

const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const idCliente = Number(id);

    const cliente = await prisma.cliente.findUnique({
      where: {
        id_cliente: idCliente
      },
      select: {
        id_cliente: true
      }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    await prisma.$transaction(async (tx) => {
      const ventas = await tx.venta.findMany({
        where: {
          id_cliente: idCliente
        },
        select: {
          id_venta: true
        }
      });

      const ventaIds = ventas.map((venta) => venta.id_venta);

      if (ventaIds.length > 0) {
        await tx.detalle_venta.deleteMany({
          where: {
            id_venta: {
              in: ventaIds
            }
          }
        });
      }

      await tx.venta.deleteMany({
        where: {
          id_cliente: idCliente
        }
      });

      await tx.cliente.delete({
        where: {
          id_cliente: idCliente
        }
      });
    });

    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
};

const getEmpleados = async (req, res) => {
  try {
    const empleados = await prisma.empleado.findMany({
      where: {
        activo: true
      },
      select: {
        id_empleado: true,
        nombre: true,
        apellido: true,
        cargo: true,
        telefono: true,
        email: true,
        fecha_contratacion: true,
        activo: true
      },
      orderBy: {
        id_empleado: 'asc'
      }
    });

    res.json(empleados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
};

const createVenta = async (req, res) => {
  try {
    const { fecha, estado, id_cliente, id_empleado, detalles } = req.body;

    if (!fecha || !id_cliente || !id_empleado || !Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const result = await pool.query(
      `CALL registrar_venta($1, $2, $3, $4, $5::jsonb, NULL)`,
      [
        fecha,
        estado || 'COMPLETADA',
        Number(id_cliente),
        Number(id_empleado),
        JSON.stringify(detalles)
      ]
    );

    const procedureResult = result.rows[0].resultado;

    if (!procedureResult.ok) {
      const { status, message, error, ok, ...details } = procedureResult;
      return res.status(status || 500).json({
        error: error || message || 'Error al registrar venta',
        ...details
      });
    }

    const { ok, status, ...venta } = procedureResult;
    res.status(201).json(venta);
  } catch (error) {
    if (error.message && error.message.includes('Stock insuficiente')) {
      return res.status(409).json({ error: 'Stock insuficiente para completar la venta' });
    }

    if (error.message && error.message.includes('Cliente inexistente')) {
      return res.status(404).json({ error: 'Cliente inexistente' });
    }

    if (error.message && error.message.includes('Empleado inexistente')) {
      return res.status(404).json({ error: 'Empleado inexistente o inactivo' });
    }

    if (error.message && error.message.includes('Producto inexistente')) {
      return res.status(404).json({ error: 'Producto inexistente' });
    }

    if (error.message && error.message.includes('Producto o cantidad invalida')) {
      return res.status(400).json({ error: 'Producto o cantidad invalida' });
    }

    console.error(error);
    res.status(500).json({ error: 'Error de base de datos al registrar la venta' });
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

    const empleado = await prisma.empleado.create({
      data: {
        nombre,
        apellido,
        cargo: cargo || null,
        telefono: telefono || null,
        email: email || null,
        fecha_contratacion: new Date(fecha_contratacion),
        activo: activo !== false
      }
    });

    res.status(201).json(empleado);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Ya existe un empleado con ese email' });
    }

    console.error(error);
    res.status(500).json({ error: 'Error al crear empleado' });
  }
};

const updateEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, cargo, telefono, email, fecha_contratacion, activo } = req.body;

    const empleado = await prisma.empleado.update({
      where: {
        id_empleado: Number(id)
      },
      data: {
        nombre,
        apellido,
        cargo: cargo || null,
        telefono: telefono || null,
        email: email || null,
        fecha_contratacion: new Date(fecha_contratacion),
        activo: activo !== false
      }
    });

    res.json(empleado);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Ya existe un empleado con ese email' });
    }

    console.error(error);
    res.status(500).json({ error: 'Error al actualizar empleado' });
  }
};

const deleteEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const idEmpleado = Number(id);

    const empleado = await prisma.empleado.findUnique({
      where: {
        id_empleado: idEmpleado
      },
      select: {
        id_empleado: true
      }
    });

    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    try {
      await prisma.$transaction([
        prisma.usuario.deleteMany({
          where: {
            id_empleado: idEmpleado
          }
        }),
        prisma.empleado.delete({
          where: {
            id_empleado: idEmpleado
          }
        })
      ]);

      return res.json({ message: 'Empleado eliminado correctamente' });
    } catch (error) {
      if (error.code !== 'P2003') {
        throw error;
      }

      await prisma.$transaction([
        prisma.usuario.deleteMany({
          where: {
            id_empleado: idEmpleado
          }
        }),
        prisma.empleado.update({
          where: {
            id_empleado: idEmpleado
          },
          data: {
            activo: false
          }
        })
      ]);

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
