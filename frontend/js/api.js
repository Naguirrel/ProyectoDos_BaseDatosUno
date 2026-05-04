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
      const message = data && data.error ? data.error : "Error al procesar la solicitud";
      throw new Error(message);
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
  createProducto: (producto) => request("/productos", {
    method: "POST",
    body: producto
  }),
  updateProducto: (id, producto) => request(`/productos/${id}`, {
    method: "PUT",
    body: producto
  }),
  deleteProducto: (id) => request(`/productos/${id}`, {
    method: "DELETE"
  }),
  getProductosMasVendidos: () => request("/reportes/productos-mas-vendidos"),
  getIngresos: () => request("/reportes/ingresos"),
  getProductosCaros: () => request("/reportes/productos-caros"),
  getVentasCte: () => request("/reportes/ventas-cte")
};

function formatCurrency(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2
  }).format(number);
}

function formatDate(value) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-GT", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(date);
}
