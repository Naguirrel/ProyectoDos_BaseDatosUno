const express = require('express');
const router = express.Router();

const {
  getClientes,
  getVentas,
  getEmpleados,
  getProveedores,
  createCliente,
  updateCliente,
  deleteCliente,
  createVenta,
  updateVenta,
  deleteVenta,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
  createProveedor,
  updateProveedor,
  deleteProveedor
} = require('../controllers/entidades.controller');

router.get('/clientes', getClientes);
router.post('/clientes', createCliente);
router.put('/clientes/:id', updateCliente);
router.delete('/clientes/:id', deleteCliente);
router.get('/ventas', getVentas);
router.post('/ventas', createVenta);
router.put('/ventas/:id', updateVenta);
router.delete('/ventas/:id', deleteVenta);
router.get('/empleados', getEmpleados);
router.post('/empleados', createEmpleado);
router.put('/empleados/:id', updateEmpleado);
router.delete('/empleados/:id', deleteEmpleado);
router.get('/proveedores', getProveedores);
router.post('/proveedores', createProveedor);
router.put('/proveedores/:id', updateProveedor);
router.delete('/proveedores/:id', deleteProveedor);

module.exports = router;
