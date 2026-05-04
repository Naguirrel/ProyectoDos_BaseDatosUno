require('dotenv').config();
const express = require('express');
const cors = require('cors');

const productosRoutes = require('./routes/productos.routes');
const reportesRoutes = require('./routes/reportes.routes');
const entidadesRoutes = require('./routes/entidades.routes');
const authRoutes = require('./routes/auth.routes');
const { ensureDefaultUser, requireAuth } = require('./controllers/auth.controller');

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.get('/', (req, res) => {
  res.send('API BrickLand funcionando');
});

// Configurar rutas
app.use('/auth', authRoutes);
app.use(requireAuth);
app.use('/productos', productosRoutes);
app.use('/reportes', reportesRoutes);
app.use('/', entidadesRoutes);

const PORT = process.env.PORT || 3000;

ensureDefaultUser()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error preparando usuario inicial', error);
    process.exit(1);
  });
