const ENTITY_CONFIG = {
  clientes: {
    title: "Clientes registrados",
    loader: BrickLandAPI.entidades.clientes,
    columns: [
      { label: "ID", key: "id_cliente" },
      { label: "Nombre", key: "nombre" },
      { label: "Apellido", key: "apellido" },
      { label: "Telefono", key: "telefono" },
      { label: "Email", key: "email" },
      { label: "NIT", key: "nit" },
      { label: "Registro", key: "fecha_registro", type: "date" }
    ]
  },
  ventas: {
    title: "Ventas registradas",
    loader: BrickLandAPI.entidades.ventas,
    columns: [
      { label: "ID", key: "id_venta" },
      { label: "Fecha", key: "fecha", type: "date" },
      { label: "Total", key: "total", type: "currency" },
      { label: "Estado", key: "estado", type: "badge" },
      { label: "Cliente", key: "cliente" },
      { label: "Empleado", key: "empleado" }
    ]
  },
  empleados: {
    title: "Empleados",
    loader: BrickLandAPI.entidades.empleados,
    columns: [
      { label: "ID", key: "id_empleado" },
      { label: "Nombre", key: "nombre" },
      { label: "Apellido", key: "apellido" },
      { label: "Cargo", key: "cargo" },
      { label: "Telefono", key: "telefono" },
      { label: "Email", key: "email" },
      { label: "Contratacion", key: "fecha_contratacion", type: "date" },
      { label: "Estado", key: "activo", type: "boolean" }
    ]
  },
  proveedores: {
    title: "Proveedores",
    loader: BrickLandAPI.entidades.proveedores,
    columns: [
      { label: "ID", key: "id_proveedor" },
      { label: "Nombre", key: "nombre" },
      { label: "Contacto", key: "contacto" },
      { label: "Telefono", key: "telefono" },
      { label: "Email", key: "email" },
      { label: "Direccion", key: "direccion" }
    ]
  }
};

let productos = [];
let clientes = [];
let ventas = [];
let empleados = [];
let proveedores = [];

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();

  if (document.body.dataset.page === "dashboard") initDashboard();
  if (document.body.dataset.page === "productos") initProductos();
  if (document.body.dataset.page === "clientes") initClientes();
  if (document.body.dataset.page === "ventas") initVentas();
  if (document.body.dataset.page === "empleados") initEmpleados();
  if (document.body.dataset.page === "proveedores") initProveedores();
  if (document.body.dataset.entity) initEntityPage(document.body.dataset.entity);
});

function setActiveNav() {
  const current = document.body.dataset.nav;
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.nav === current);
  });
}

async function initDashboard() {
  const productosEl = document.getElementById("metricProductos");
  const ventasEl = document.getElementById("metricVentas");
  const clientesEl = document.getElementById("metricClientes");
  const actividadEl = document.getElementById("actividadReciente");

  try {
    const [productosData, ventasData, clientesData] = await Promise.all([
      BrickLandAPI.getProductos(),
      BrickLandAPI.entidades.ventas(),
      BrickLandAPI.entidades.clientes()
    ]);

    productosEl.textContent = productosData.length;
    clientesEl.textContent = clientesData.length;
    ventasEl.textContent = formatCurrency(ventasData.reduce((sum, venta) => sum + Number(venta.total || 0), 0));

    actividadEl.innerHTML = renderTable(ventasData.slice(0, 6), [
      { label: "Fecha", key: "fecha", type: "date" },
      { label: "Cliente", key: "cliente" },
      { label: "Total", key: "total", type: "currency" },
      { label: "Estado", key: "estado", type: "badge" }
    ]);
  } catch (error) {
    showAlert(error.message || "Error al cargar datos", "error");
  }
}

function initProductos() {
  document.getElementById("productoForm").addEventListener("submit", saveProducto);
  document.getElementById("btnCancelar").addEventListener("click", resetProductoForm);
  document.getElementById("btnRecargar").addEventListener("click", loadProductos);
  loadProductos();
}

function initVentas() {
  document.getElementById("ventaForm").addEventListener("submit", saveVenta);
  document.getElementById("btnCancelarVenta").addEventListener("click", resetVentaForm);
  document.getElementById("btnRecargar").addEventListener("click", loadVentas);
  loadVentas();
}

function initClientes() {
  document.getElementById("clienteForm").addEventListener("submit", saveCliente);
  document.getElementById("btnCancelarCliente").addEventListener("click", resetClienteForm);
  document.getElementById("btnRecargar").addEventListener("click", loadClientes);
  loadClientes();
}

function initEmpleados() {
  document.getElementById("empleadoForm").addEventListener("submit", saveEmpleado);
  document.getElementById("btnCancelarEmpleado").addEventListener("click", resetEmpleadoForm);
  document.getElementById("btnRecargar").addEventListener("click", loadEmpleados);
  loadEmpleados();
}

function initProveedores() {
  document.getElementById("proveedorForm").addEventListener("submit", saveProveedor);
  document.getElementById("btnCancelarProveedor").addEventListener("click", resetProveedorForm);
  document.getElementById("btnRecargar").addEventListener("click", loadProveedores);
  loadProveedores();
}

async function loadProductos() {
  const body = document.getElementById("productosBody");
  const counter = document.getElementById("contadorProductos");
  body.innerHTML = `<tr><td colspan="6" class="empty">Cargando...</td></tr>`;

  try {
    productos = await BrickLandAPI.getProductos();
    counter.textContent = `${productos.length} registros`;

    if (!productos.length) {
      body.innerHTML = `<tr><td colspan="6" class="empty">No hay productos registrados</td></tr>`;
      return;
    }

    body.innerHTML = productos.map((producto) => `
      <tr>
        <td><strong>${escapeHtml(producto.nombre)}</strong></td>
        <td>${formatCurrency(producto.precio_unitario)}</td>
        <td><span class="badge">${escapeHtml(producto.stock)}</span></td>
        <td>${escapeHtml(producto.categoria)}</td>
        <td>${escapeHtml(producto.proveedor)}</td>
        <td>
          <div class="row-actions">
            <button class="btn secondary" type="button" onclick="editProducto(${producto.id_producto})">Editar</button>
            <button class="btn danger" type="button" onclick="deleteProducto(${producto.id_producto})">Eliminar</button>
          </div>
        </td>
      </tr>
    `).join("");
  } catch (error) {
    body.innerHTML = `<tr><td colspan="6" class="empty">Error al cargar datos</td></tr>`;
    showAlert(error.message || "Error al cargar datos", "error");
  }
}

async function saveProducto(event) {
  event.preventDefault();

  const id = document.getElementById("productoId").value;
  const payload = {
    nombre: document.getElementById("nombre").value.trim(),
    descripcion: document.getElementById("descripcion").value.trim(),
    precio_unitario: Number(document.getElementById("precio_unitario").value),
    stock: Number(document.getElementById("stock").value || 0),
    stock_minimo: Number(document.getElementById("stock_minimo").value || 0),
    id_categoria: Number(document.getElementById("id_categoria").value),
    id_proveedor: Number(document.getElementById("id_proveedor").value)
  };

  try {
    if (id) {
      await BrickLandAPI.updateProducto(id, {
        nombre: payload.nombre,
        precio_unitario: payload.precio_unitario,
        stock: payload.stock
      });
      showAlert("Producto actualizado", "success");
    } else {
      await BrickLandAPI.createProducto(payload);
      showAlert("Producto creado", "success");
    }

    resetProductoForm();
    await loadProductos();
  } catch (error) {
    showAlert(error.message || "Error al guardar producto", "error");
  }
}

function editProducto(id) {
  const producto = productos.find((item) => Number(item.id_producto) === Number(id));
  if (!producto) return;

  document.getElementById("productoId").value = producto.id_producto;
  document.getElementById("nombre").value = producto.nombre || "";
  document.getElementById("descripcion").value = "";
  document.getElementById("precio_unitario").value = producto.precio_unitario || "";
  document.getElementById("stock").value = producto.stock || 0;
  document.getElementById("stock_minimo").value = "";
  document.getElementById("id_categoria").value = "";
  document.getElementById("id_proveedor").value = "";
  document.getElementById("formTitle").textContent = "Editar producto";
  document.getElementById("btnCancelar").classList.remove("hidden");
  setCreateOnlyFields(false);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteProducto(id) {
  const producto = productos.find((item) => Number(item.id_producto) === Number(id));
  if (!confirm(`Estas seguro de eliminar "${producto ? producto.nombre : "este producto"}"?`)) return;

  try {
    await BrickLandAPI.deleteProducto(id);
    showAlert("Producto eliminado", "success");
    await loadProductos();
  } catch (error) {
    showAlert(error.message || "Error al eliminar producto", "error");
  }
}

function resetProductoForm() {
  document.getElementById("productoForm").reset();
  document.getElementById("productoId").value = "";
  document.getElementById("formTitle").textContent = "Crear producto";
  document.getElementById("btnCancelar").classList.add("hidden");
  setCreateOnlyFields(true);
}

function setCreateOnlyFields(isCreateMode) {
  ["descripcion", "stock_minimo", "id_categoria", "id_proveedor"].forEach((fieldId) => {
    document.getElementById(fieldId).disabled = !isCreateMode;
  });

  document.getElementById("id_categoria").required = isCreateMode;
  document.getElementById("id_proveedor").required = isCreateMode;
}

async function initEntityPage(entityKey) {
  const config = ENTITY_CONFIG[entityKey];
  const table = document.getElementById("entityTable");
  const counter = document.getElementById("entityCounter");
  const reload = document.getElementById("btnRecargar");

  async function loadEntity() {
    table.innerHTML = `<p class="loading">Cargando...</p>`;

    try {
      const rows = await config.loader();
      counter.textContent = `${rows.length} registros`;
      table.innerHTML = renderTable(rows, config.columns);
    } catch (error) {
      table.innerHTML = `<p class="empty">Error al cargar datos</p>`;
      showAlert(error.message || "Error al cargar datos", "error");
    }
  }

  reload.addEventListener("click", loadEntity);
  loadEntity();
}

async function loadVentas() {
  const table = document.getElementById("ventasTable");
  const counter = document.getElementById("ventasCounter");
  table.innerHTML = `<p class="loading">Cargando...</p>`;

  try {
    ventas = await BrickLandAPI.getVentas();
    counter.textContent = `${ventas.length} registros`;
    table.innerHTML = renderTableWithActions(ventas, [
      { label: "ID", key: "id_venta" },
      { label: "Fecha", key: "fecha", type: "date" },
      { label: "Total", key: "total", type: "currency" },
      { label: "Estado", key: "estado", type: "badge" },
      { label: "Cliente", key: "cliente" },
      { label: "Empleado", key: "empleado" }
    ], "editVenta", "deleteVenta", "id_venta");
  } catch (error) {
    table.innerHTML = `<p class="empty">Error al cargar datos</p>`;
    showAlert(error.message || "Error al cargar ventas", "error");
  }
}

async function loadClientes() {
  const table = document.getElementById("clientesTable");
  const counter = document.getElementById("clientesCounter");
  table.innerHTML = `<p class="loading">Cargando...</p>`;

  try {
    clientes = await BrickLandAPI.getClientes();
    counter.textContent = `${clientes.length} registros`;
    table.innerHTML = renderTableWithActions(clientes, [
      { label: "ID", key: "id_cliente" },
      { label: "Nombre", key: "nombre" },
      { label: "Apellido", key: "apellido" },
      { label: "Telefono", key: "telefono" },
      { label: "Email", key: "email" },
      { label: "NIT", key: "nit" },
      { label: "Registro", key: "fecha_registro", type: "date" }
    ], "editCliente", "deleteCliente", "id_cliente");
  } catch (error) {
    table.innerHTML = `<p class="empty">Error al cargar datos</p>`;
    showAlert(error.message || "Error al cargar clientes", "error");
  }
}

async function saveCliente(event) {
  event.preventDefault();

  const id = document.getElementById("clienteId").value;
  const payload = {
    nombre: document.getElementById("clienteNombre").value.trim(),
    apellido: document.getElementById("clienteApellido").value.trim(),
    telefono: document.getElementById("clienteTelefono").value.trim(),
    email: document.getElementById("clienteEmail").value.trim(),
    nit: document.getElementById("clienteNit").value.trim(),
    fecha_registro: document.getElementById("clienteFecha").value
  };

  try {
    if (id) {
      await BrickLandAPI.updateCliente(id, payload);
      showAlert("Cliente actualizado", "success");
    } else {
      await BrickLandAPI.createCliente(payload);
      showAlert("Cliente creado", "success");
    }

    resetClienteForm();
    await loadClientes();
  } catch (error) {
    showAlert(error.message || "Error al guardar cliente", "error");
  }
}

function editCliente(id) {
  const cliente = clientes.find((item) => Number(item.id_cliente) === Number(id));
  if (!cliente) return;

  document.getElementById("clienteId").value = cliente.id_cliente;
  document.getElementById("clienteNombre").value = cliente.nombre || "";
  document.getElementById("clienteApellido").value = cliente.apellido || "";
  document.getElementById("clienteTelefono").value = cliente.telefono || "";
  document.getElementById("clienteEmail").value = cliente.email || "";
  document.getElementById("clienteNit").value = cliente.nit || "";
  document.getElementById("clienteFecha").value = toInputDate(cliente.fecha_registro);
  document.getElementById("clienteFormTitle").textContent = "Editar cliente";
  document.getElementById("btnCancelarCliente").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteCliente(id) {
  if (!confirm(`Estas seguro de eliminar el cliente #${id}? Se eliminaran sus ventas asociadas.`)) return;

  try {
    await BrickLandAPI.deleteCliente(id);
    showAlert("Cliente eliminado", "success");
    await loadClientes();
  } catch (error) {
    showAlert(error.message || "Error al eliminar cliente", "error");
  }
}

function resetClienteForm() {
  document.getElementById("clienteForm").reset();
  document.getElementById("clienteId").value = "";
  document.getElementById("clienteFormTitle").textContent = "Crear cliente";
  document.getElementById("btnCancelarCliente").classList.add("hidden");
}

async function saveVenta(event) {
  event.preventDefault();

  const id = document.getElementById("ventaId").value;
  const payload = {
    fecha: document.getElementById("ventaFecha").value,
    total: Number(document.getElementById("ventaTotal").value),
    estado: document.getElementById("ventaEstado").value.trim(),
    id_cliente: Number(document.getElementById("ventaCliente").value),
    id_empleado: Number(document.getElementById("ventaEmpleado").value)
  };

  try {
    if (id) {
      await BrickLandAPI.updateVenta(id, payload);
      showAlert("Venta actualizada", "success");
    } else {
      await BrickLandAPI.createVenta(payload);
      showAlert("Venta creada", "success");
    }

    resetVentaForm();
    await loadVentas();
  } catch (error) {
    showAlert(error.message || "Error al guardar venta", "error");
  }
}

function editVenta(id) {
  const venta = ventas.find((item) => Number(item.id_venta) === Number(id));
  if (!venta) return;

  document.getElementById("ventaId").value = venta.id_venta;
  document.getElementById("ventaFecha").value = toInputDate(venta.fecha);
  document.getElementById("ventaTotal").value = venta.total || 0;
  document.getElementById("ventaEstado").value = venta.estado || "COMPLETADA";
  document.getElementById("ventaCliente").value = venta.id_cliente || "";
  document.getElementById("ventaEmpleado").value = venta.id_empleado || "";
  document.getElementById("ventaFormTitle").textContent = "Editar venta";
  document.getElementById("btnCancelarVenta").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteVenta(id) {
  if (!confirm(`Estas seguro de eliminar la venta #${id}?`)) return;

  try {
    await BrickLandAPI.deleteVenta(id);
    showAlert("Venta eliminada", "success");
    await loadVentas();
  } catch (error) {
    showAlert(error.message || "Error al eliminar venta", "error");
  }
}

function resetVentaForm() {
  document.getElementById("ventaForm").reset();
  document.getElementById("ventaId").value = "";
  document.getElementById("ventaEstado").value = "COMPLETADA";
  document.getElementById("ventaFormTitle").textContent = "Crear venta";
  document.getElementById("btnCancelarVenta").classList.add("hidden");
}

async function loadEmpleados() {
  const table = document.getElementById("empleadosTable");
  const counter = document.getElementById("empleadosCounter");
  table.innerHTML = `<p class="loading">Cargando...</p>`;

  try {
    empleados = await BrickLandAPI.getEmpleados();
    counter.textContent = `${empleados.length} registros`;
    table.innerHTML = renderTableWithActions(empleados, [
      { label: "ID", key: "id_empleado" },
      { label: "Nombre", key: "nombre" },
      { label: "Apellido", key: "apellido" },
      { label: "Cargo", key: "cargo" },
      { label: "Telefono", key: "telefono" },
      { label: "Email", key: "email" },
      { label: "Contratacion", key: "fecha_contratacion", type: "date" }
    ], "editEmpleado", "deleteEmpleado", "id_empleado");
  } catch (error) {
    table.innerHTML = `<p class="empty">Error al cargar datos</p>`;
    showAlert(error.message || "Error al cargar empleados", "error");
  }
}

async function loadProveedores() {
  const table = document.getElementById("proveedoresTable");
  const counter = document.getElementById("proveedoresCounter");
  table.innerHTML = `<p class="loading">Cargando...</p>`;

  try {
    proveedores = await BrickLandAPI.getProveedores();
    counter.textContent = `${proveedores.length} registros`;
    table.innerHTML = renderTableWithActions(proveedores, [
      { label: "ID", key: "id_proveedor" },
      { label: "Nombre", key: "nombre" },
      { label: "Contacto", key: "contacto" },
      { label: "Telefono", key: "telefono" },
      { label: "Email", key: "email" },
      { label: "Direccion", key: "direccion" }
    ], "editProveedor", "deleteProveedor", "id_proveedor");
  } catch (error) {
    table.innerHTML = `<p class="empty">Error al cargar datos</p>`;
    showAlert(error.message || "Error al cargar proveedores", "error");
  }
}

async function saveProveedor(event) {
  event.preventDefault();

  const id = document.getElementById("proveedorId").value;
  const payload = {
    nombre: document.getElementById("proveedorNombre").value.trim(),
    contacto: document.getElementById("proveedorContacto").value.trim(),
    telefono: document.getElementById("proveedorTelefono").value.trim(),
    email: document.getElementById("proveedorEmail").value.trim(),
    direccion: document.getElementById("proveedorDireccion").value.trim()
  };

  try {
    if (id) {
      await BrickLandAPI.updateProveedor(id, payload);
      showAlert("Proveedor actualizado", "success");
    } else {
      await BrickLandAPI.createProveedor(payload);
      showAlert("Proveedor creado", "success");
    }

    resetProveedorForm();
    await loadProveedores();
  } catch (error) {
    showAlert(error.message || "Error al guardar proveedor", "error");
  }
}

function editProveedor(id) {
  const proveedor = proveedores.find((item) => Number(item.id_proveedor) === Number(id));
  if (!proveedor) return;

  document.getElementById("proveedorId").value = proveedor.id_proveedor;
  document.getElementById("proveedorNombre").value = proveedor.nombre || "";
  document.getElementById("proveedorContacto").value = proveedor.contacto || "";
  document.getElementById("proveedorTelefono").value = proveedor.telefono || "";
  document.getElementById("proveedorEmail").value = proveedor.email || "";
  document.getElementById("proveedorDireccion").value = proveedor.direccion || "";
  document.getElementById("proveedorFormTitle").textContent = "Editar proveedor";
  document.getElementById("btnCancelarProveedor").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteProveedor(id) {
  if (!confirm(`Estas seguro de eliminar el proveedor #${id}? Tambien se eliminaran productos y compras asociadas.`)) return;

  try {
    await BrickLandAPI.deleteProveedor(id);
    showAlert("Proveedor eliminado", "success");
    await loadProveedores();
  } catch (error) {
    showAlert(error.message || "Error al eliminar proveedor", "error");
  }
}

function resetProveedorForm() {
  document.getElementById("proveedorForm").reset();
  document.getElementById("proveedorId").value = "";
  document.getElementById("proveedorFormTitle").textContent = "Crear proveedor";
  document.getElementById("btnCancelarProveedor").classList.add("hidden");
}

async function saveEmpleado(event) {
  event.preventDefault();

  const id = document.getElementById("empleadoId").value;
  const payload = {
    nombre: document.getElementById("empleadoNombre").value.trim(),
    apellido: document.getElementById("empleadoApellido").value.trim(),
    cargo: document.getElementById("empleadoCargo").value.trim(),
    telefono: document.getElementById("empleadoTelefono").value.trim(),
    email: document.getElementById("empleadoEmail").value.trim(),
    fecha_contratacion: document.getElementById("empleadoFecha").value,
    activo: true
  };

  try {
    if (id) {
      await BrickLandAPI.updateEmpleado(id, payload);
      showAlert("Empleado actualizado", "success");
    } else {
      await BrickLandAPI.createEmpleado(payload);
      showAlert("Empleado creado", "success");
    }

    resetEmpleadoForm();
    await loadEmpleados();
  } catch (error) {
    showAlert(error.message || "Error al guardar empleado", "error");
  }
}

function editEmpleado(id) {
  const empleado = empleados.find((item) => Number(item.id_empleado) === Number(id));
  if (!empleado) return;

  document.getElementById("empleadoId").value = empleado.id_empleado;
  document.getElementById("empleadoNombre").value = empleado.nombre || "";
  document.getElementById("empleadoApellido").value = empleado.apellido || "";
  document.getElementById("empleadoCargo").value = empleado.cargo || "";
  document.getElementById("empleadoTelefono").value = empleado.telefono || "";
  document.getElementById("empleadoEmail").value = empleado.email || "";
  document.getElementById("empleadoFecha").value = toInputDate(empleado.fecha_contratacion);
  document.getElementById("empleadoFormTitle").textContent = "Editar empleado";
  document.getElementById("btnCancelarEmpleado").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteEmpleado(id) {
  if (!confirm(`Estas seguro de eliminar el empleado #${id}?`)) return;

  try {
    const response = await BrickLandAPI.deleteEmpleado(id);
    showAlert(response.message || "Empleado eliminado", "success");
    await loadEmpleados();
  } catch (error) {
    showAlert(error.message || "Error al eliminar empleado", "error");
  }
}

function resetEmpleadoForm() {
  document.getElementById("empleadoForm").reset();
  document.getElementById("empleadoId").value = "";
  document.getElementById("empleadoFormTitle").textContent = "Crear empleado";
  document.getElementById("btnCancelarEmpleado").classList.add("hidden");
}

function renderTableWithActions(rows, columns, editFn, deleteFn, idKey) {
  if (!rows || rows.length === 0) {
    return `<p class="empty">No hay datos disponibles</p>`;
  }

  const headers = columns.map((column) => `<th>${column.label}</th>`).join("");
  const body = rows.map((row) => `
    <tr>
      ${columns.map((column) => `<td>${formatCell(row[column.key], column)}</td>`).join("")}
      <td>
        <div class="row-actions">
          <button class="btn secondary" type="button" onclick="${editFn}(${row[idKey]})">Editar</button>
          <button class="btn danger" type="button" onclick="${deleteFn}(${row[idKey]})">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("");

  return `<table><thead><tr>${headers}<th>Acciones</th></tr></thead><tbody>${body}</tbody></table>`;
}

function toInputDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function showAlert(message, type = "success") {
  const alert = document.getElementById("alerta");
  if (!alert) return;

  alert.textContent = message;
  alert.className = `alert ${type}`;
  window.clearTimeout(showAlert.timeout);
  showAlert.timeout = window.setTimeout(() => alert.classList.add("hidden"), 4200);
}

window.editProducto = editProducto;
window.deleteProducto = deleteProducto;
window.editCliente = editCliente;
window.deleteCliente = deleteCliente;
window.editVenta = editVenta;
window.deleteVenta = deleteVenta;
window.editEmpleado = editEmpleado;
window.deleteEmpleado = deleteEmpleado;
window.editProveedor = editProveedor;
window.deleteProveedor = deleteProveedor;
