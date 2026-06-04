const prisma = require('../prisma/client');
const pool = require('../db/connection');

function formatProductoRow(producto) {
  return {
    id_producto: producto.id_producto,
    nombre: producto.nombre,
    precio_unitario: producto.precio_unitario,
    stock: producto.stock,
    categoria: producto.categoria?.nombre,
    proveedor: producto.proveedor?.nombre
  };
}

const getProductos = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      include: {
        categoria: true,
        proveedor: true
      },
      orderBy: {
        id_producto: 'asc'
      }
    });

    res.json(productos.map(formatProductoRow));
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
      `CALL crear_producto($1, $2, $3, $4, $5, $6, $7, NULL)`,
      [
        nombre,
        descripcion || null,
        precio_unitario,
        Number(stock || 0),
        Number(stock_minimo || 0),
        Number(id_categoria),
        Number(id_proveedor)
      ]
    );

    const producto = result.rows[0].resultado;

    res.status(201).json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

const updateProducto = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { nombre, precio_unitario, stock } = req.body;
    const idProducto = Number(id);

    await client.query('BEGIN');

    const updated = await client.query(
      `UPDATE producto
       SET nombre = $1, precio_unitario = $2
       WHERE id_producto = $3
       RETURNING id_producto`,
      [nombre, precio_unitario, idProducto]
    );

    if (updated.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const result = await client.query(
      `CALL actualizar_stock($1, $2, 'SET', NULL)`,
      [idProducto, Number(stock)]
    );

    await client.query('COMMIT');

    const producto = result.rows[0].resultado;

    res.json(producto);
  } catch (error) {
    await client.query('ROLLBACK');

    console.error(error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  } finally {
    client.release();
  }
};

const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const idProducto = Number(id);

    const producto = await prisma.producto.findUnique({
      where: {
        id_producto: idProducto
      },
      select: {
        id_producto: true
      }
    });

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await prisma.$transaction([
      prisma.detalle_venta.deleteMany({
        where: {
          id_producto: idProducto
        }
      }),
      prisma.detalle_compra.deleteMany({
        where: {
          id_producto: idProducto
        }
      }),
      prisma.producto.delete({
        where: {
          id_producto: idProducto
        }
      })
    ]);

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

module.exports = { getProductos, createProducto, updateProducto, deleteProducto };
