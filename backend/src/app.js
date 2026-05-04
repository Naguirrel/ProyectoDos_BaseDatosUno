require('dotenv').config();
const express = require('express');
const productosRoutes = require('./routes/productos.routes');
const reportesRoutes = require('./routes/reportes.routes');

const app = express();
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
