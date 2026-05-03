require('dotenv').config();
const express = require('express');
const productosRoutes = require('./routes/productos.routes');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API BrickLand funcionando');
});


// Configurar rutas
app.use('/productos', productosRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});