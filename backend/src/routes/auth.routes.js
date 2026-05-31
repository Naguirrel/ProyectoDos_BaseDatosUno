const express = require('express');
const router = express.Router();

const {
  login,
  logout,
  getSession,
  requireAuth,
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario
} = require('../controllers/auth.controller');
const { requireRoles, roles } = require('../middleware/roles.middleware');

router.post('/login', login);
router.post('/logout', logout);
router.get('/session', getSession);
router.get('/usuarios', requireAuth, requireRoles(roles.ADMINISTRADOR), getUsuarios);
router.post('/usuarios', requireAuth, requireRoles(roles.ADMINISTRADOR), createUsuario);
router.put('/usuarios/:id', requireAuth, requireRoles(roles.ADMINISTRADOR), updateUsuario);
router.delete('/usuarios/:id', requireAuth, requireRoles(roles.ADMINISTRADOR), deleteUsuario);

module.exports = router;
