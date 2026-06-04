document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.public === "true") {
    initLoginPage();
    return;
  }

  guardSession();
});

const ROLE_ACCESS = {
  administrador: {
    home: "index.html",
    modules: ["dashboard", "productos", "clientes", "ventas", "empleados", "proveedores", "usuarios", "reportes"],
    write: ["productos", "clientes", "ventas", "empleados", "proveedores", "usuarios"]
  },
  gerente: {
    home: "reportes/index.html",
    modules: ["productos", "clientes", "ventas", "empleados", "proveedores", "reportes"],
    write: []
  },
  vendedor: {
    home: "ventas.html",
    modules: ["ventas"],
    write: ["ventas"]
  },
  bodeguero: {
    home: "productos.html",
    modules: ["productos", "proveedores"],
    write: ["productos", "proveedores"]
  },
  analista: {
    home: "reportes/index.html",
    modules: ["reportes"],
    write: []
  }
};

async function guardSession() {
  try {
    const session = await getCurrentSession();
    window.BrickLandSession = session;

    if (!session.authenticated) {
      window.location.href = getLoginPath();
      return;
    }

    if (!canAccessCurrentPage(session.user)) {
      window.location.href = getRoleHomePath(session.user.rol);
      return;
    }

    applyRoleVisibility(session.user);
    renderSessionActions(session.user);
  } catch (error) {
    window.location.href = getLoginPath();
  }
}

function initLoginPage() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  getCurrentSession().then((session) => {
    if (session.authenticated) {
      window.location.href = getRoleHomePath(session.user && session.user.rol);
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const alert = document.getElementById("alerta");
    const button = document.getElementById("btnLogin");
    button.disabled = true;
    button.textContent = "Ingresando...";

    try {
      if (!window.BrickLandAPI || typeof BrickLandAPI.login !== "function") {
        throw new Error("No se cargo correctamente js/api.js. Recarga la pagina con Ctrl + F5.");
      }

      const response = await BrickLandAPI.login({
        username: document.getElementById("username").value.trim(),
        password: document.getElementById("password").value
      });

      window.location.href = getRoleHomePath(response.user && response.user.rol);
    } catch (error) {
      alert.textContent = error.message || "No se pudo iniciar sesion";
      alert.className = "alert error";
    } finally {
      button.disabled = false;
      button.textContent = "Ingresar";
    }
  });
}

async function getCurrentSession() {
  if (window.BrickLandSession) {
    return window.BrickLandSession;
  }

  if (window.BrickLandAPI && typeof BrickLandAPI.getSession === "function") {
    window.BrickLandSession = await BrickLandAPI.getSession();
    return window.BrickLandSession;
  }

  if (window.BrickLandAPI && typeof BrickLandAPI.getSesion === "function") {
    window.BrickLandSession = await BrickLandAPI.getSesion();
    return window.BrickLandSession;
  }

  const response = await fetch("http://localhost:3000/auth/session", {
    credentials: "include"
  });

  if (!response.ok) {
    return { authenticated: false };
  }

  window.BrickLandSession = await response.json();
  return window.BrickLandSession;
}

function normalizeRole(role) {
  const value = String(role || "").trim().toLowerCase();
  return value === "admin" ? "administrador" : value;
}

function getAccessForRole(role) {
  return ROLE_ACCESS[normalizeRole(role)] || ROLE_ACCESS.analista;
}

function getCurrentRole() {
  return normalizeRole(window.BrickLandSession?.user?.rol);
}

function canAccessModule(role, moduleName) {
  return getAccessForRole(role).modules.includes(moduleName);
}

function canWriteModule(role, moduleName) {
  return getAccessForRole(role).write.includes(moduleName);
}

function canAccessCurrentPage(user) {
  const moduleName = getCurrentModule();
  if (!moduleName || moduleName === "login") return true;
  return canAccessModule(user?.rol, moduleName);
}

function getCurrentModule() {
  if (document.body.dataset.nav) return document.body.dataset.nav;
  if (document.body.dataset.page) return document.body.dataset.page;
  if (document.body.dataset.report) return "reportes";

  return moduleFromPath(window.location.pathname) || "dashboard";
}

function moduleFromPath(path) {
  const normalized = String(path || "").toLowerCase();
  if (normalized.includes("/reportes/")) return "reportes";
  if (normalized.includes("productos")) return "productos";
  if (normalized.includes("clientes")) return "clientes";
  if (normalized.includes("ventas")) return "ventas";
  if (normalized.includes("empleados")) return "empleados";
  if (normalized.includes("proveedores")) return "proveedores";
  if (normalized.includes("usuarios")) return "usuarios";
  if (normalized.includes("login")) return "login";
  if (normalized.endsWith("/") || normalized.includes("index")) return "dashboard";
  return "";
}

function moduleFromHref(href) {
  if (!href || href.startsWith("#") || href.startsWith("javascript:")) return "";
  return moduleFromPath(href);
}

function getRoleHomePath(role) {
  return toRelativeAppPath(getAccessForRole(role).home);
}

function toRelativeAppPath(path) {
  const inReports = window.location.pathname.includes("/reportes/");

  if (path.startsWith("reportes/")) {
    return inReports ? path.replace("reportes/", "") : path;
  }

  return inReports ? `../${path}` : path;
}

function applyRoleVisibility(user) {
  const role = normalizeRole(user?.rol);
  document.body.dataset.role = role;

  document.querySelectorAll("a[href]").forEach((link) => {
    const moduleName = link.dataset.nav || moduleFromHref(link.getAttribute("href"));
    if (!moduleName || moduleName === "login") return;

    const allowed = canAccessModule(role, moduleName);
    const card = link.closest(".quick-card, .report-card");
    const target = card || link;
    target.classList.toggle("hidden", !allowed);
  });

  document.querySelectorAll(".nav-group").forEach((group) => {
    const visibleLinks = Array.from(group.querySelectorAll(".nav-link"))
      .filter((link) => !link.classList.contains("hidden"));
    group.classList.toggle("hidden", visibleLinks.length === 0);
  });
}

function renderSessionActions(user) {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar || document.getElementById("sessionBox")) return;

  const displayName = user.nombre || user.username || "Usuario";
  const role = user.rol || "sin rol";

  const box = document.createElement("div");
  box.id = "sessionBox";
  box.className = "session-box";
  box.innerHTML = `
    <div>
      <span>Sesion activa</span>
      <strong>${escapeHtml(displayName)}</strong>
      <small>${escapeHtml(user.username || "")}</small>
      <em>${escapeHtml(formatRole(role))}</em>
    </div>
    <button class="btn ghost full" type="button" id="btnLogout">Cerrar sesion</button>
  `;

  sidebar.appendChild(box);
  document.getElementById("btnLogout").addEventListener("click", async () => {
    await logoutSession();
    window.location.href = getLoginPath();
  });
}

async function logoutSession() {
  if (window.BrickLandAPI && typeof BrickLandAPI.logout === "function") {
    return BrickLandAPI.logout();
  }

  const response = await fetch("http://localhost:3000/auth/logout", {
    method: "POST",
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("No se pudo cerrar sesion");
  }

  return response.json();
}

function formatRole(role) {
  const labels = {
    administrador: "Administrador",
    gerente: "Gerente",
    vendedor: "Vendedor",
    bodeguero: "Bodeguero",
    analista: "Analista",
    admin: "Administrador"
  };

  return labels[role] || role;
}

window.BrickLandAuth = {
  getCurrentSession,
  getCurrentRole,
  normalizeRole,
  canAccessModule,
  canWriteModule,
  getCurrentModule,
  getRoleHomePath,
  applyRoleVisibility
};
