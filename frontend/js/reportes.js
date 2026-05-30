const REPORT_CONFIG = {
  "clientes-compras": {
    title: "Clientes y compras acumuladas",
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
    title: "Inventario detallado de productos",
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
  "ventas-clientes-empleados": {
    title: "Ventas por empleado",
    loader: BrickLandAPI.reportes.ventasClientesEmpleados,
    columns: [
      { label: "Venta", key: "id_venta" },
      { label: "Fecha", key: "fecha", type: "date" },
      { label: "Cliente", key: "cliente" },
      { label: "Empleado", key: "empleado" },
      { label: "Estado", key: "estado", type: "badge" },
      { label: "Total", key: "total", type: "currency" }
    ],
    sql: `SELECT
  v.id_venta,
  v.fecha,
  CONCAT(c.nombre, ' ', COALESCE(c.apellido, '')) AS cliente,
  CONCAT(e.nombre, ' ', e.apellido) AS empleado,
  v.estado,
  v.total
FROM venta v
JOIN cliente c ON v.id_cliente = c.id_cliente
JOIN empleado e ON v.id_empleado = e.id_empleado
ORDER BY v.fecha DESC, v.id_venta DESC;`
  },
  "proveedores-inventario": {
    title: "Inventario por proveedor",
    loader: BrickLandAPI.reportes.proveedoresInventario,
    columns: [
      { label: "Proveedor", key: "proveedor" },
      { label: "Categoria", key: "categoria" },
      { label: "Productos", key: "productos_suministrados", type: "badge" },
      { label: "Stock total", key: "stock_total" },
      { label: "Precio promedio", key: "precio_promedio", type: "currency" }
    ],
    sql: `SELECT
  pr.nombre AS proveedor,
  c.nombre AS categoria,
  COUNT(p.id_producto) AS productos_suministrados,
  SUM(p.stock) AS stock_total,
  ROUND(AVG(p.precio_unitario), 2) AS precio_promedio
FROM proveedor pr
JOIN producto p ON pr.id_proveedor = p.id_proveedor
JOIN categoria c ON p.id_categoria = c.id_categoria
GROUP BY pr.nombre, c.nombre
ORDER BY proveedor, categoria;`
  },
  "clientes-frecuentes": {
    title: "Clientes frecuentes",
    loader: BrickLandAPI.reportes.clientesFrecuentes,
    columns: [
      { label: "ID", key: "id_cliente" },
      { label: "Cliente", key: "cliente" },
      { label: "Email", key: "email" },
      { label: "NIT", key: "nit" }
    ],
    sql: `SELECT
  c.id_cliente,
  CONCAT(c.nombre, ' ', COALESCE(c.apellido, '')) AS cliente,
  c.email,
  c.nit
FROM cliente c
WHERE c.id_cliente IN (
  SELECT v.id_cliente
  FROM venta v
  GROUP BY v.id_cliente
  HAVING COUNT(v.id_venta) >= 1
)
ORDER BY cliente;`
  },
  "categorias-alta-rotacion": {
    title: "Categorias con mayor rotacion",
    loader: BrickLandAPI.reportes.categoriasAltaRotacion,
    columns: [
      { label: "Categoria", key: "categoria" },
      { label: "Productos", key: "productos", type: "badge" },
      { label: "Unidades vendidas", key: "unidades_vendidas", type: "badge" },
      { label: "Ingresos generados", key: "ingresos_generados", type: "currency" }
    ],
    sql: `SELECT
  c.nombre AS categoria,
  COUNT(DISTINCT p.id_producto) AS productos,
  SUM(dv.cantidad) AS unidades_vendidas,
  SUM(dv.subtotal) AS ingresos_generados
FROM categoria c
JOIN producto p ON c.id_categoria = p.id_categoria
JOIN detalle_venta dv ON p.id_producto = dv.id_producto
GROUP BY c.nombre
HAVING SUM(dv.cantidad) >= 2
ORDER BY unidades_vendidas DESC;`
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
    title: "Productos sobre el promedio de precio",
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
    title: "Analisis de ventas avanzadas",
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
  if (!config) {
    window.location.href = "index.html";
    return;
  }

  prepareReportPage();

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

function prepareReportPage() {
  const mainEyebrow = document.querySelector(".topline .eyebrow");
  if (mainEyebrow) mainEyebrow.textContent = "Analisis de negocio";

  const sqlCard = document.querySelector(".sql-card");
  if (!sqlCard || sqlCard.querySelector("details")) return;

  sqlCard.innerHTML = `
    <details class="report-sql-details">
      <summary>Ver consulta SQL utilizada</summary>
      <pre class="sql-block" id="reportSql"></pre>
    </details>
  `;
}
