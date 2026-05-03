const express = require('express');
const router = express.Router();

const { productosMasVendidos } = require('../controllers/reportes.controller');

router.get('/productos-mas-vendidos', productosMasVendidos);

module.exports = router;