const express = require('express');
const router = express.Router();

const {
  getClientes,
  getVentas,
  getEmpleados,
  getProveedores
} = require('../controllers/entidades.controller');

router.get('/clientes', getClientes);
router.get('/ventas', getVentas);
router.get('/empleados', getEmpleados);
router.get('/proveedores', getProveedores);

module.exports = router;
