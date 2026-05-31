const prisma = require('../prisma/client');

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

    const producto = await prisma.producto.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        precio_unitario,
        stock: Number(stock),
        stock_minimo: Number(stock_minimo),
        id_categoria: Number(id_categoria),
        id_proveedor: Number(id_proveedor)
      }
    });

    res.status(201).json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio_unitario, stock } = req.body;

    const producto = await prisma.producto.update({
      where: {
        id_producto: Number(id)
      },
      data: {
        nombre,
        precio_unitario,
        stock: Number(stock)
      }
    });

    res.json(producto);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    console.error(error);
    res.status(500).json({ error: 'Error al actualizar producto' });
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
