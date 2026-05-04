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
    proveedores: () => request("/proveedores")
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
