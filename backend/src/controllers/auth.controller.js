const crypto = require('crypto');
const pool = require('../db/connection');

const sessions = new Map();
const COOKIE_NAME = 'brickland_session';
const DEFAULT_PASSWORD = 'secret';

const DEFAULT_USERS = [
  { username: 'proy2', password: DEFAULT_PASSWORD, rol: 'administrador' },
  { username: 'admin_test', password: DEFAULT_PASSWORD, rol: 'administrador' },
  { username: 'gerente_test', password: DEFAULT_PASSWORD, rol: 'gerente' },
  { username: 'vendedor_test', password: DEFAULT_PASSWORD, rol: 'vendedor' },
  { username: 'bodeguero_test', password: DEFAULT_PASSWORD, rol: 'bodeguero' },
  { username: 'analista_test', password: DEFAULT_PASSWORD, rol: 'analista' }
];

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

function verifyPassword(password, storedHash) {
  return storedHash === hashPassword(password) || storedHash === password;
}

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [rawName, ...valueParts] = cookie.trim().split('=');
    if (!rawName) return cookies;
    cookies[rawName] = decodeURIComponent(valueParts.join('='));
    return cookies;
  }, {});
}

function sessionCookie(token) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400`;
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}

async function ensureDefaultUser() {
  for (const user of DEFAULT_USERS) {
    await pool.query(
      `INSERT INTO usuario (username, password_hash, rol, activo, id_empleado)
       VALUES ($1, $2, $3, TRUE, NULL)
       ON CONFLICT (username)
       DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         rol = EXCLUDED.rol,
         activo = TRUE`,
      [user.username, hashPassword(user.password), user.rol]
    );
  }
}

function toSessionUser(user) {
  return {
    id_usuario: user.id_usuario,
    username: user.username,
    rol: user.rol,
    nombre: user.nombre || user.username
  };
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y password son obligatorios' });
    }

    const result = await pool.query(
      `SELECT
         u.id_usuario,
         u.username,
         u.password_hash,
         u.rol,
         u.activo,
         COALESCE(NULLIF(TRIM(CONCAT(e.nombre, ' ', e.apellido)), ''), u.username) AS nombre
       FROM usuario u
       LEFT JOIN empleado e ON u.id_empleado = e.id_empleado
       WHERE u.username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (!user || !user.activo || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const sessionUser = toSessionUser(user);
    sessions.set(token, sessionUser);

    res.setHeader('Set-Cookie', sessionCookie(token));
    res.json({
      message: 'Sesion iniciada',
      user: sessionUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesion' });
  }
}

function logout(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[COOKIE_NAME];

  if (token) {
    sessions.delete(token);
  }

  res.setHeader('Set-Cookie', clearSessionCookie());
  res.json({ message: 'Sesion cerrada' });
}

function getSession(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  const user = sessions.get(cookies[COOKIE_NAME]);

  if (!user) {
    return res.json({ authenticated: false });
  }

  res.json({ authenticated: true, user });
}

function requireAuth(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  const user = sessions.get(cookies[COOKIE_NAME]);

  if (!user) {
    return res.status(401).json({ error: 'Sesion requerida' });
  }

  req.user = user;
  next();
}

async function getUsuarios(req, res) {
  try {
    const result = await pool.query(`
      SELECT id_usuario, username, rol, activo, id_empleado
      FROM usuario
      ORDER BY id_usuario;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
}

async function createUsuario(req, res) {
  try {
    const { username, password, rol, activo, id_empleado } = req.body;

    if (!username || !password || !rol) {
      return res.status(400).json({ error: 'Usuario, password y rol son obligatorios' });
    }

    const result = await pool.query(
      `INSERT INTO usuario (username, password_hash, rol, activo, id_empleado)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_usuario, username, rol, activo, id_empleado`,
      [username, hashPassword(password), rol, activo !== false, id_empleado || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
}

async function updateUsuario(req, res) {
  try {
    const { id } = req.params;
    const { username, password, rol, activo, id_empleado } = req.body;

    const current = await pool.query(
      `SELECT password_hash FROM usuario WHERE id_usuario = $1`,
      [id]
    );

    if (current.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const passwordHash = password ? hashPassword(password) : current.rows[0].password_hash;

    const result = await pool.query(
      `UPDATE usuario
       SET username = $1, password_hash = $2, rol = $3, activo = $4, id_empleado = $5
       WHERE id_usuario = $6
       RETURNING id_usuario, username, rol, activo, id_empleado`,
      [username, passwordHash, rol, activo !== false, id_empleado || null, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
}

async function deleteUsuario(req, res) {
  try {
    const { id } = req.params;

    if (req.user && Number(req.user.id_usuario) === Number(id)) {
      return res.status(400).json({ error: 'No puedes eliminar el usuario de la sesion actual' });
    }

    const result = await pool.query(
      `DELETE FROM usuario WHERE id_usuario = $1 RETURNING id_usuario`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
}

module.exports = {
  ensureDefaultUser,
  login,
  logout,
  getSession,
  requireAuth,
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario
};
