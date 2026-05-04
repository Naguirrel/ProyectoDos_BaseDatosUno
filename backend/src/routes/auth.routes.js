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

router.post('/login', login);
router.post('/logout', logout);
router.get('/session', getSession);
router.get('/usuarios', requireAuth, getUsuarios);
router.post('/usuarios', requireAuth, createUsuario);
router.put('/usuarios/:id', requireAuth, updateUsuario);
router.delete('/usuarios/:id', requireAuth, deleteUsuario);

module.exports = router;
