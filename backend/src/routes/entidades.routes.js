const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/entidades.controller');

router.get('/clientes', getClientes);
router.get('/ventas', getVentas);
router.post('/ventas', createVenta);
router.put('/ventas/:id', updateVenta);
router.delete('/ventas/:id', deleteVenta);
router.get('/empleados', getEmpleados);
router.post('/empleados', createEmpleado);
router.put('/empleados/:id', updateEmpleado);
router.delete('/empleados/:id', deleteEmpleado);
router.get('/proveedores', getProveedores);

module.exports = router;
