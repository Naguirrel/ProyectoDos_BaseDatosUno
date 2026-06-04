const ROLE_ALIASES = {
  admin: 'administrador',
  administrador: 'administrador',
  gerente: 'gerente',
  vendedor: 'vendedor',
  bodeguero: 'bodeguero',
  analista: 'analista'
};

function normalizeRole(role) {
  return ROLE_ALIASES[String(role || '').trim().toLowerCase()] || '';
}

function requireRoles(...allowedRoles) {
  const allowed = new Set(allowedRoles.map(normalizeRole));

  return (req, res, next) => {
    const userRole = normalizeRole(req.user && req.user.rol);

    if (!userRole || !allowed.has(userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'No tienes permisos para realizar esta operacion'
      });
    }

    next();
  };
}

const roles = {
  ADMINISTRADOR: 'administrador',
  GERENTE: 'gerente',
  VENDEDOR: 'vendedor',
  BODEGUERO: 'bodeguero',
  ANALISTA: 'analista'
};

module.exports = {
  roles,
  normalizeRole,
  requireRoles
};
