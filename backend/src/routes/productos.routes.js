const express = require('express');
const router = express.Router();

const { getProductos, createProducto, updateProducto, deleteProducto } = require('../controllers/productos.controller');
const { requireRoles, roles } = require('../middleware/roles.middleware');

router.get('/', requireRoles(
  roles.ADMINISTRADOR,
  roles.GERENTE,
  roles.VENDEDOR,
  roles.BODEGUERO
), getProductos);

router.post('/', requireRoles(
  roles.ADMINISTRADOR,
  roles.BODEGUERO
), createProducto);

router.put('/:id', requireRoles(
  roles.ADMINISTRADOR,
  roles.BODEGUERO
), updateProducto);

router.delete('/:id', requireRoles(
  roles.ADMINISTRADOR,
  roles.BODEGUERO
), deleteProducto);

module.exports = router;
