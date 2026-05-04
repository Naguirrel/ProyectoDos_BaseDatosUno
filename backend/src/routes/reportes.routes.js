const express = require('express');
const router = express.Router();

const {
  ingresosPorFecha,
  productosCaros,
  ventasCTE,
  productosMasVendidos,
  clientesCompras,
  ventasClientesEmpleados,
  proveedoresInventario,
  clientesFrecuentesSubquery,
  categoriasAltaRotacion,
  vistaProductos,
  transaccionVenta
} = require('../controllers/reportes.controller');

// rutas
router.get('/ingresos', ingresosPorFecha);
router.get('/productos-caros', productosCaros);
router.get('/ventas-cte', ventasCTE);
router.get('/productos-mas-vendidos', productosMasVendidos);
router.get('/clientes-compras', clientesCompras);
router.get('/ventas-clientes-empleados', ventasClientesEmpleados);
router.get('/proveedores-inventario', proveedoresInventario);
router.get('/clientes-frecuentes', clientesFrecuentesSubquery);
router.get('/categorias-alta-rotacion', categoriasAltaRotacion);
router.get('/vista-productos', vistaProductos);
router.get('/transaccion', transaccionVenta);


router.get('/', (req, res) => {
    res.send('Reportes funcionando');
  });

// exportar
module.exports = router;
