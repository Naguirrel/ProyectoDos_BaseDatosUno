const REPORT_CONFIG = {
  "clientes-compras": {
    title: "Clientes y sus compras",
    loader: BrickLandAPI.reportes.clientesCompras,
    columns: [
      { label: "ID cliente", key: "id_cliente" },
      { label: "Cliente", key: "cliente" },
      { label: "Email", key: "email" },
      { label: "Compras", key: "compras_realizadas", type: "badge" },
      { label: "Total comprado", key: "total_comprado", type: "currency" }
    ],
    sql: `SELECT
  c.id_cliente,
  CONCAT(c.nombre, ' ', COALESCE(c.apellido, '')) AS cliente,
  c.email,
  COUNT(v.id_venta) AS compras_realizadas,
  COALESCE(SUM(v.total), 0) AS total_comprado
FROM cliente c
LEFT JOIN venta v ON c.id_cliente = v.id_cliente
GROUP BY c.id_cliente, c.nombre, c.apellido, c.email
ORDER BY total_comprado DESC;`
  },
  "vista-productos": {
    title: "Vista de productos",
    loader: BrickLandAPI.reportes.vistaProductos,
    columns: [
      { label: "ID", key: "id_producto" },
      { label: "Producto", key: "producto" },
      { label: "Precio", key: "precio_unitario", type: "currency" },
      { label: "Stock", key: "stock", type: "badge" },
      { label: "Categoria", key: "categoria" },
      { label: "Proveedor", key: "proveedor" }
    ],
    sql: `CREATE OR REPLACE VIEW vista_productos_detalle AS
SELECT
  p.id_producto,
  p.nombre AS producto,
  p.precio_unitario,
  p.stock,
  c.nombre AS categoria,
  pr.nombre AS proveedor
FROM producto p
JOIN categoria c ON p.id_categoria = c.id_categoria
JOIN proveedor pr ON p.id_proveedor = pr.id_proveedor;

SELECT *
FROM vista_productos_detalle
ORDER BY id_producto;`
  },
  transaccion: {
    title: "Transaccion de venta simulada",
    loader: BrickLandAPI.reportes.transaccion,
    columns: [
      { label: "Operacion", key: "operacion" },
      { label: "Producto", key: "producto" },
      { label: "Stock inicial", key: "stock_inicial" },
      { label: "Stock transaccion", key: "stock_durante_transaccion" },
      { label: "Estado", key: "estado" }
    ],
    sql: `BEGIN;

SELECT id_producto, nombre, stock, precio_unitario
FROM producto
WHERE stock > 0
ORDER BY id_producto
LIMIT 1;

UPDATE producto
SET stock = stock - 1
WHERE id_producto = :id_producto;

ROLLBACK;`
  },
  "productos-mas-vendidos": {
    title: "Productos mas vendidos",
    loader: BrickLandAPI.reportes.productosMasVendidos,
    columns: [
      { label: "Producto", key: "nombre" },
      { label: "Total vendido", key: "total_vendido", type: "badge" }
    ],
    sql: `SELECT 
  p.nombre,
  SUM(dv.cantidad) AS total_vendido
FROM detalle_venta dv
JOIN producto p ON dv.id_producto = p.id_producto
GROUP BY p.nombre
ORDER BY total_vendido DESC;`
  },
  ingresos: {
    title: "Ingresos por fecha",
    loader: BrickLandAPI.reportes.ingresos,
    columns: [
      { label: "Fecha", key: "fecha", type: "date" },
      { label: "Ingresos", key: "ingresos", type: "currency" }
    ],
    sql: `SELECT 
  fecha,
  SUM(total) AS ingresos
FROM venta
GROUP BY fecha
ORDER BY fecha;`
  },
  "productos-caros": {
    title: "Productos sobre precio promedio",
    loader: BrickLandAPI.reportes.productosCaros,
    columns: [
      { label: "Producto", key: "nombre" },
      { label: "Precio unitario", key: "precio_unitario", type: "currency" }
    ],
    sql: `SELECT nombre, precio_unitario
FROM producto
WHERE precio_unitario > (
  SELECT AVG(precio_unitario) FROM producto
);`
  },
  "ventas-cte": {
    title: "Ventas con CTE",
    loader: BrickLandAPI.reportes.ventasCte,
    columns: [
      { label: "Producto", key: "nombre" },
      { label: "Total", key: "total", type: "badge" }
    ],
    sql: `WITH ventas_totales AS (
  SELECT id_producto, SUM(cantidad) AS total
  FROM detalle_venta
  GROUP BY id_producto
)
SELECT p.nombre, vt.total
FROM ventas_totales vt
JOIN producto p ON vt.id_producto = p.id_producto
ORDER BY vt.total DESC;`
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const reportKey = document.body.dataset.report;
  if (reportKey) loadReport(reportKey);
});

async function loadReport(reportKey) {
  const config = REPORT_CONFIG[reportKey];
  const result = document.getElementById("reportResult");
  const sql = document.getElementById("reportSql");

  document.getElementById("reportTitle").textContent = config.title;
  sql.textContent = config.sql;
  result.innerHTML = `<p class="loading">Cargando...</p>`;

  try {
    const rows = await config.loader();
    result.innerHTML = renderTable(rows, config.columns);
  } catch (error) {
    result.innerHTML = `<p class="empty">Error al cargar datos</p>`;
    const alert = document.getElementById("alerta");
    alert.textContent = error.message || "Error al cargar datos";
    alert.className = "alert error";
  }
}
