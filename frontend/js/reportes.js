const alerta = document.getElementById("alerta");
const btnActualizarReportes = document.getElementById("btnActualizarReportes");

const reportes = {
  productosMasVendidos: {
    fetcher: BrickLandAPI.getProductosMasVendidos,
    columns: [
      { label: "Producto", key: "nombre" },
      { label: "Total vendido", key: "total_vendido" }
    ]
  },
  ingresos: {
    fetcher: BrickLandAPI.getIngresos,
    columns: [
      { label: "Fecha", key: "fecha", format: formatDate },
      { label: "Ingresos", key: "ingresos", format: formatCurrency }
    ]
  },
  productosCaros: {
    fetcher: BrickLandAPI.getProductosCaros,
    columns: [
      { label: "Producto", key: "nombre" },
      { label: "Precio unitario", key: "precio_unitario", format: formatCurrency }
    ]
  },
  ventasCte: {
    fetcher: BrickLandAPI.getVentasCte,
    columns: [
      { label: "Producto", key: "nombre" },
      { label: "Total vendido", key: "total" }
    ]
  }
};

document.addEventListener("DOMContentLoaded", cargarReportes);
btnActualizarReportes.addEventListener("click", cargarReportes);

async function cargarReportes() {
  btnActualizarReportes.disabled = true;
  const tareas = Object.entries(reportes).map(([key, config]) => cargarReporte(key, config));

  try {
    await Promise.all(tareas);
  } finally {
    btnActualizarReportes.disabled = false;
  }
}

async function cargarReporte(key, config) {
  const card = document.querySelector(`[data-report="${key}"]`);
  const loading = card.querySelector(".loading");
  const tableWrap = card.querySelector(".table-wrap");

  loading.classList.remove("hidden");
  loading.textContent = "Cargando...";
  tableWrap.innerHTML = "";

  try {
    const data = await config.fetcher();
    tableWrap.innerHTML = crearTabla(data, config.columns);
    loading.classList.add("hidden");
  } catch (error) {
    loading.textContent = "Error al cargar datos";
    mostrarAlerta(error.message || "Error al cargar datos", "error");
  }
}

function crearTabla(rows, columns) {
  if (!rows.length) {
    return `<p class="empty-state">No hay datos disponibles</p>`;
  }

  const headers = columns.map((column) => `<th>${column.label}</th>`).join("");
  const body = rows.map((row) => `
    <tr>
      ${columns.map((column) => `<td>${formatCell(row[column.key], column)}</td>`).join("")}
    </tr>
  `).join("");

  return `
    <table>
      <thead>
        <tr>${headers}</tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

function formatCell(value, column) {
  if (column.format) return column.format(value);
  return escapeHtml(value ?? "Sin dato");
}

function mostrarAlerta(mensaje, tipo = "success") {
  alerta.textContent = mensaje;
  alerta.className = `alert ${tipo}`;

  window.clearTimeout(mostrarAlerta.timeout);
  mostrarAlerta.timeout = window.setTimeout(() => {
    alerta.classList.add("hidden");
  }, 4200);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
