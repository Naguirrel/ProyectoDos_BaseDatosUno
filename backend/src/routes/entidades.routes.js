const express = require('express');
const router = express.Router();
const { requireRoles, roles } = require('../middleware/roles.middleware');

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

router.get('/clientes', requireRoles(
  roles.ADMINISTRADOR,
  roles.GERENTE,
  roles.VENDEDOR
), getClientes);

router.post('/clientes', requireRoles(
  roles.ADMINISTRADOR
), createCliente);

router.put('/clientes/:id', requireRoles(
  roles.ADMINISTRADOR
), updateCliente);

router.delete('/clientes/:id', requireRoles(
  roles.ADMINISTRADOR
), deleteCliente);

router.get('/ventas', requireRoles(
  roles.ADMINISTRADOR,
  roles.GERENTE,
  roles.VENDEDOR
), getVentas);

router.post('/ventas', requireRoles(
  roles.ADMINISTRADOR,
  roles.VENDEDOR
), createVenta);

router.put('/ventas/:id', requireRoles(
  roles.ADMINISTRADOR,
  roles.VENDEDOR
), updateVenta);

router.delete('/ventas/:id', requireRoles(
  roles.ADMINISTRADOR,
  roles.VENDEDOR
), deleteVenta);

router.get('/empleados', requireRoles(
  roles.ADMINISTRADOR,
  roles.GERENTE,
  roles.VENDEDOR
), getEmpleados);

router.post('/empleados', requireRoles(
  roles.ADMINISTRADOR
), createEmpleado);

router.put('/empleados/:id', requireRoles(
  roles.ADMINISTRADOR
), updateEmpleado);

router.delete('/empleados/:id', requireRoles(
  roles.ADMINISTRADOR
), deleteEmpleado);

router.get('/proveedores', requireRoles(
  roles.ADMINISTRADOR,
  roles.GERENTE,
  roles.BODEGUERO
), getProveedores);

router.post('/proveedores', requireRoles(
  roles.ADMINISTRADOR,
  roles.BODEGUERO
), createProveedor);

router.put('/proveedores/:id', requireRoles(
  roles.ADMINISTRADOR,
  roles.BODEGUERO
), updateProveedor);

router.delete('/proveedores/:id', requireRoles(
  roles.ADMINISTRADOR,
  roles.BODEGUERO
), deleteProveedor);

module.exports = router;
