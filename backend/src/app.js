require('dotenv').config();
const express = require('express');
const cors = require('cors');

const productosRoutes = require('./routes/productos.routes');
const reportesRoutes = require('./routes/reportes.routes');
const entidadesRoutes = require('./routes/entidades.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.get('/', (req, res) => {
  res.send('API BrickLand funcionando');
});

// Configurar rutas
app.use('/productos', productosRoutes);
app.use('/reportes', reportesRoutes);
app.use('/', entidadesRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
