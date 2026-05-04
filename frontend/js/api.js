const API_BASE_URL = "http://localhost:3000";

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  };

  if (config.body && typeof config.body !== "string") {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new Error(data && data.error ? data.error : "Error al procesar la solicitud");
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("No se pudo conectar con la API en http://localhost:3000");
    }

    throw error;
  }
}

const BrickLandAPI = {
  getProductos: () => request("/productos"),
  createProducto: (producto) => request("/productos", { method: "POST", body: producto }),
  updateProducto: (id, producto) => request(`/productos/${id}`, { method: "PUT", body: producto }),
  deleteProducto: (id) => request(`/productos/${id}`, { method: "DELETE" }),
  getClientes: () => request("/clientes"),
  getVentas: () => request("/ventas"),
  getEmpleados: () => request("/empleados"),
  getProveedores: () => request("/proveedores"),
  createCliente: (cliente) => request("/clientes", { method: "POST", body: cliente }),
  updateCliente: (id, cliente) => request(`/clientes/${id}`, { method: "PUT", body: cliente }),
  deleteCliente: (id) => request(`/clientes/${id}`, { method: "DELETE" }),
  createVenta: (venta) => request("/ventas", { method: "POST", body: venta }),
  updateVenta: (id, venta) => request(`/ventas/${id}`, { method: "PUT", body: venta }),
  deleteVenta: (id) => request(`/ventas/${id}`, { method: "DELETE" }),
  createEmpleado: (empleado) => request("/empleados", { method: "POST", body: empleado }),
  updateEmpleado: (id, empleado) => request(`/empleados/${id}`, { method: "PUT", body: empleado }),
  deleteEmpleado: (id) => request(`/empleados/${id}`, { method: "DELETE" }),
  createProveedor: (proveedor) => request("/proveedores", { method: "POST", body: proveedor }),
  updateProveedor: (id, proveedor) => request(`/proveedores/${id}`, { method: "PUT", body: proveedor }),
  deleteProveedor: (id) => request(`/proveedores/${id}`, { method: "DELETE" }),
  getReportes: (endpoint) => request(`/reportes/${endpoint.replace(/^\/?reportes\/?/, "").replace(/^\//, "")}`),
  productos: {
    list: () => request("/productos"),
    create: (producto) => request("/productos", { method: "POST", body: producto }),
    update: (id, producto) => request(`/productos/${id}`, { method: "PUT", body: producto }),
    remove: (id) => request(`/productos/${id}`, { method: "DELETE" })
  },
  entidades: {
    clientes: () => request("/clientes"),
    ventas: () => request("/ventas"),
    empleados: () => request("/empleados"),
    proveedores: () => request("/proveedores"),
    createCliente: (cliente) => request("/clientes", { method: "POST", body: cliente }),
    updateCliente: (id, cliente) => request(`/clientes/${id}`, { method: "PUT", body: cliente }),
    deleteCliente: (id) => request(`/clientes/${id}`, { method: "DELETE" }),
    createVenta: (venta) => request("/ventas", { method: "POST", body: venta }),
    updateVenta: (id, venta) => request(`/ventas/${id}`, { method: "PUT", body: venta }),
    deleteVenta: (id) => request(`/ventas/${id}`, { method: "DELETE" }),
    createEmpleado: (empleado) => request("/empleados", { method: "POST", body: empleado }),
    updateEmpleado: (id, empleado) => request(`/empleados/${id}`, { method: "PUT", body: empleado }),
    deleteEmpleado: (id) => request(`/empleados/${id}`, { method: "DELETE" }),
    createProveedor: (proveedor) => request("/proveedores", { method: "POST", body: proveedor }),
    updateProveedor: (id, proveedor) => request(`/proveedores/${id}`, { method: "PUT", body: proveedor }),
    deleteProveedor: (id) => request(`/proveedores/${id}`, { method: "DELETE" })
  },
  reportes: {
    clientesCompras: () => request("/reportes/clientes-compras"),
    vistaProductos: () => request("/reportes/vista-productos"),
    transaccion: () => request("/reportes/transaccion"),
    productosMasVendidos: () => request("/reportes/productos-mas-vendidos"),
    ingresos: () => request("/reportes/ingresos"),
    productosCaros: () => request("/reportes/productos-caros"),
    ventasCte: () => request("/reportes/ventas-cte")
  }
};

function formatCurrency(value) {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-GT", { year: "numeric", month: "short", day: "2-digit" }).format(date);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderTable(rows, columns) {
  if (!rows || rows.length === 0) {
    return `<p class="empty">No hay datos disponibles</p>`;
  }

  const headers = columns.map((column) => `<th>${column.label}</th>`).join("");
  const body = rows.map((row) => `
    <tr>
      ${columns.map((column) => `<td>${formatCell(row[column.key], column)}</td>`).join("")}
    </tr>
  `).join("");

  return `<table><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table>`;
}

function formatCell(value, column) {
  if (column.type === "currency") return formatCurrency(value);
  if (column.type === "date") return formatDate(value);
  if (column.type === "boolean") return value ? "Activo" : "Inactivo";
  if (column.type === "badge") return `<span class="badge">${escapeHtml(value)}</span>`;
  return escapeHtml(value ?? "Sin dato");
}

window.BrickLandAPI = BrickLandAPI;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.escapeHtml = escapeHtml;
window.renderTable = renderTable;
