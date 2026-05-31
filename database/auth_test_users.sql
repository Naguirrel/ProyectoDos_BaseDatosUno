-- ============================================================
-- BrickLand Store - Usuarios de prueba por rol
-- ============================================================
-- Password para todos los usuarios: secret
--
-- Este script es idempotente: crea o actualiza los usuarios de
-- prueba sin duplicarlos y mantiene activo el login principal.

INSERT INTO usuario (username, password_hash, rol, activo, id_empleado) VALUES
('proy3','2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b','administrador',TRUE,NULL),
('admin_test','2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b','administrador',TRUE,NULL),
('gerente_test','2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b','gerente',TRUE,NULL),
('vendedor_test','2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b','vendedor',TRUE,NULL),
('bodeguero_test','2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b','bodeguero',TRUE,NULL),
('analista_test','2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b','analista',TRUE,NULL)
ON CONFLICT (username)
DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  rol = EXCLUDED.rol,
  activo = TRUE,
  id_empleado = EXCLUDED.id_empleado;
