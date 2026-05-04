const productosBody = document.getElementById("productosBody");
const productosLoading = document.getElementById("productosLoading");
const productoForm = document.getElementById("productoForm");
const alerta = document.getElementById("alerta");
const btnCancelar = document.getElementById("btnCancelar");
const btnRecargar = document.getElementById("btnRecargar");
const btnGuardar = document.getElementById("btnGuardar");
const formTitulo = document.getElementById("formTitulo");
const contadorProductos = document.getElementById("contadorProductos");

let productos = [];

document.addEventListener("DOMContentLoaded", cargarProductos);
productoForm.addEventListener("submit", guardarProducto);
btnCancelar.addEventListener("click", limpiarFormulario);
btnRecargar.addEventListener("click", cargarProductos);

async function cargarProductos() {
  setLoading(true);
  productosBody.innerHTML = `<tr><td colspan="6" class="empty-state">Cargando...</td></tr>`;

  try {
    productos = await BrickLandAPI.getProductos();
    renderProductos(productos);
  } catch (error) {
    productosBody.innerHTML = `<tr><td colspan="6" class="empty-state">Error al cargar datos</td></tr>`;
    mostrarAlerta(error.message || "Error al cargar datos", "error");
  } finally {
    setLoading(false);
  }
}

function renderProductos(lista) {
  contadorProductos.textContent = `${lista.length} producto${lista.length === 1 ? "" : "s"}`;

  if (!lista.length) {
    productosBody.innerHTML = `<tr><td colspan="6" class="empty-state">No hay productos registrados</td></tr>`;
    return;
  }

  productosBody.innerHTML = lista.map((producto) => `
    <tr>
      <td><strong>${escapeHtml(producto.nombre)}</strong></td>
      <td>${formatCurrency(producto.precio_unitario)}</td>
      <td><span class="stock-badge">${producto.stock ?? 0}</span></td>
      <td>${escapeHtml(producto.categoria || "Sin categoria")}</td>
      <td>${escapeHtml(producto.proveedor || "Sin proveedor")}</td>
      <td>
        <div class="row-actions">
          <button class="btn secondary" type="button" onclick="editarProducto(${producto.id_producto})">Editar</button>
          <button class="btn danger" type="button" onclick="eliminarProducto(${producto.id_producto})">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("");
}

async function guardarProducto(event) {
  event.preventDefault();

  const id = document.getElementById("productoId").value;
  const producto = leerFormulario();

  btnGuardar.disabled = true;
  btnGuardar.textContent = id ? "Actualizando..." : "Guardando...";

  try {
    if (id) {
      await BrickLandAPI.updateProducto(id, {
        nombre: producto.nombre,
        precio_unitario: producto.precio_unitario,
        stock: producto.stock
      });
      mostrarAlerta("Producto actualizado", "success");
    } else {
      await BrickLandAPI.createProducto(producto);
      mostrarAlerta("Producto creado", "success");
    }

    limpiarFormulario();
    await cargarProductos();
  } catch (error) {
    mostrarAlerta(error.message || "Error al guardar producto", "error");
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = "Guardar producto";
  }
}

function editarProducto(id) {
  const producto = productos.find((item) => Number(item.id_producto) === Number(id));
  if (!producto) return;

  document.getElementById("productoId").value = producto.id_producto;
  document.getElementById("nombre").value = producto.nombre || "";
  document.getElementById("descripcion").value = producto.descripcion || "";
  document.getElementById("precio_unitario").value = producto.precio_unitario || "";
  document.getElementById("stock").value = producto.stock || 0;
  document.getElementById("stock_minimo").value = producto.stock_minimo || "";
  document.getElementById("id_categoria").value = producto.id_categoria || "";
  document.getElementById("id_proveedor").value = producto.id_proveedor || "";

  formTitulo.textContent = "Editar producto";
  btnCancelar.classList.remove("hidden");
  btnGuardar.textContent = "Actualizar producto";
  setCreateOnlyFields(false);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function eliminarProducto(id) {
  const producto = productos.find((item) => Number(item.id_producto) === Number(id));
  const nombre = producto ? producto.nombre : "este producto";
  const confirmar = confirm(`Estas seguro de eliminar "${nombre}"?`);

  if (!confirmar) return;

  try {
    await BrickLandAPI.deleteProducto(id);
    mostrarAlerta("Producto eliminado", "success");
    await cargarProductos();
  } catch (error) {
    mostrarAlerta(error.message || "Error al eliminar producto", "error");
  }
}

function leerFormulario() {
  return {
    nombre: document.getElementById("nombre").value.trim(),
    descripcion: document.getElementById("descripcion").value.trim(),
    precio_unitario: Number(document.getElementById("precio_unitario").value),
    stock: Number(document.getElementById("stock").value || 0),
    stock_minimo: Number(document.getElementById("stock_minimo").value || 0),
    id_categoria: Number(document.getElementById("id_categoria").value),
    id_proveedor: Number(document.getElementById("id_proveedor").value)
  };
}

function limpiarFormulario() {
  productoForm.reset();
  document.getElementById("productoId").value = "";
  formTitulo.textContent = "Crear producto";
  btnCancelar.classList.add("hidden");
  btnGuardar.textContent = "Guardar producto";
  setCreateOnlyFields(true);
}

function setCreateOnlyFields(isCreateMode) {
  ["descripcion", "stock_minimo", "id_categoria", "id_proveedor"].forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    field.disabled = !isCreateMode;
  });

  document.getElementById("id_categoria").required = isCreateMode;
  document.getElementById("id_proveedor").required = isCreateMode;
}

function setLoading(isLoading) {
  productosLoading.classList.toggle("hidden", !isLoading);
  btnRecargar.disabled = isLoading;
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
