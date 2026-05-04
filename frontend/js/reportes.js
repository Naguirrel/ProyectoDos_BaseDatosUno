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
  "ventas-clientes-empleados": {
    title: "Ventas con clientes y empleados",
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
    title: "Proveedores e inventario",
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
    title: "Categorias de alta rotacion",
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
