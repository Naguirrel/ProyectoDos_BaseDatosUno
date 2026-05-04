document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.public === "true") {
    initLoginPage();
    return;
  }

  guardSession();
});

async function guardSession() {
  try {
    const session = await BrickLandAPI.getSession();

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

  BrickLandAPI.getSession().then((session) => {
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

function renderSessionActions(user) {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar || document.getElementById("sessionBox")) return;

  const box = document.createElement("div");
  box.id = "sessionBox";
  box.className = "session-box";
  box.innerHTML = `
    <div>
      <span>Sesion activa</span>
      <strong>${escapeHtml(user.username)}</strong>
    </div>
    <button class="btn ghost full" type="button" id="btnLogout">Cerrar sesion</button>
  `;

  sidebar.appendChild(box);
  document.getElementById("btnLogout").addEventListener("click", async () => {
    await BrickLandAPI.logout();
    window.location.href = getLoginPath();
  });
}
