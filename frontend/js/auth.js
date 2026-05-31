document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.public === "true") {
    initLoginPage();
    return;
  }

  guardSession();
});

async function guardSession() {
  try {
    const session = await getCurrentSession();

    if (!session.authenticated) {
      window.location.href = getLoginPath();
      return;
    }

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
      window.location.href = "index.html";
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

      await BrickLandAPI.login({
        username: document.getElementById("username").value.trim(),
        password: document.getElementById("password").value
      });

      window.location.href = "index.html";
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
  if (window.BrickLandAPI && typeof BrickLandAPI.getSession === "function") {
    return BrickLandAPI.getSession();
  }

  if (window.BrickLandAPI && typeof BrickLandAPI.getSesion === "function") {
    return BrickLandAPI.getSesion();
  }

  const response = await fetch("http://localhost:3000/auth/session", {
    credentials: "include"
  });

  if (!response.ok) {
    return { authenticated: false };
  }

  return response.json();
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
