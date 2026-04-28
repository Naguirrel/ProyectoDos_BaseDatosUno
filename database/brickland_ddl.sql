-- ============================================================
--  BrickLand Store — Script DDL + Datos de prueba + Índices
--  PostgreSQL | Proyecto 2 | cc3088 Bases de Datos 1
-- ============================================================

-- ============================================
-- DROP TABLES (orden correcto)
-- ============================================

DROP TABLE IF EXISTS detalle_compra CASCADE;
DROP TABLE IF EXISTS compra CASCADE;
DROP TABLE IF EXISTS detalle_venta CASCADE;
DROP TABLE IF EXISTS venta CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;
DROP TABLE IF EXISTS cliente CASCADE;
DROP TABLE IF EXISTS empleado CASCADE;
DROP TABLE IF EXISTS producto CASCADE;
DROP TABLE IF EXISTS proveedor CASCADE;
DROP TABLE IF EXISTS categoria CASCADE;

-- ============================================
-- CREACION DE TABLAS
-- ============================================

CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

CREATE TABLE proveedor (
    id_proveedor SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    direccion TEXT
);

CREATE TABLE producto (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario > 0),
    stock INT NOT NULL CHECK (stock >= 0),
    stock_minimo INT NOT NULL CHECK (stock_minimo >= 0),
    id_categoria INT NOT NULL,
    id_proveedor INT NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
);

CREATE TABLE empleado (
    id_empleado SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    cargo VARCHAR(50),
    telefono VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    fecha_contratacion DATE NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE cliente (
    id_cliente SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    nit VARCHAR(50) UNIQUE,
    fecha_registro DATE NOT NULL
);

CREATE TABLE venta (
    id_venta SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    estado VARCHAR(50),
    id_cliente INT NOT NULL,
    id_empleado INT NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
);

CREATE TABLE detalle_venta (
    id_detalle SERIAL PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    FOREIGN KEY (id_venta) REFERENCES venta(id_venta) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

CREATE TABLE compra (
    id_compra SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    estado VARCHAR(50),
    id_proveedor INT NOT NULL,
    id_empleado INT NOT NULL,
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
);

CREATE TABLE detalle_compra (
    id_detalle SERIAL PRIMARY KEY,
    id_compra INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    costo_unitario NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    FOREIGN KEY (id_compra) REFERENCES compra(id_compra) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol VARCHAR(50) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    id_empleado INT UNIQUE,
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
);

-- ============================================
-- DATOS BASE (pocos reales)
-- ============================================

INSERT INTO categoria (nombre, descripcion) VALUES
('City','Ciudad'),
('Star Wars','SW'),
('Technic','Ingenieria'),
('Harry Potter','Magia'),
('Marvel','Superheroes'),
('Creator','Creativo'),
('Accesorios','Extras');

INSERT INTO proveedor (nombre, contacto, telefono, email, direccion) VALUES
('LEGO Oficial','Juan','555-1111','lego@mail.com','Guatemala'),
('BrickWorld','Ana','555-2222','brick@mail.com','Mexico'),
('ToyHouse','Luis','555-3333','toy@mail.com','USA');

-- ============================================
-- GENERACION MASIVA (cumplir 25)
-- ============================================

INSERT INTO categoria (nombre, descripcion)
SELECT 'Categoria '||i, 'Desc '||i FROM generate_series(8,25) i;

INSERT INTO proveedor (nombre, contacto, telefono, email, direccion)
SELECT 'Proveedor '||i,'Contacto'||i,'555'||i,'prov'||i||'@mail.com','Ciudad'
FROM generate_series(4,25) i;

INSERT INTO cliente (nombre, apellido, telefono, email, nit, fecha_registro)
SELECT 'Nombre'||i,'Apellido'||i,'555'||i,'cliente'||i||'@mail.com','NIT'||i,CURRENT_DATE
FROM generate_series(1,25) i;

INSERT INTO empleado (nombre, apellido, cargo, telefono, email, fecha_contratacion, activo)
SELECT 'Emp'||i,'Apellido'||i,'Vendedor','555'||i,'emp'||i||'@mail.com',CURRENT_DATE,TRUE
FROM generate_series(1,25) i;

INSERT INTO producto (nombre, descripcion, precio_unitario, stock, stock_minimo, id_categoria, id_proveedor)
SELECT 'Producto '||i,'Desc',50+i,100,10,(i%25)+1,(i%25)+1
FROM generate_series(1,25) i;

INSERT INTO venta (fecha, total, estado, id_cliente, id_empleado)
SELECT CURRENT_DATE,100+i,'COMPLETADA',(i%25)+1,(i%25)+1
FROM generate_series(1,25) i;

INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal)
SELECT i,(i%25)+1,2,50,100 FROM generate_series(1,25) i;

INSERT INTO compra (fecha, total, estado, id_proveedor, id_empleado)
SELECT CURRENT_DATE,200+i,'RECIBIDA',(i%25)+1,(i%25)+1
FROM generate_series(1,25) i;

INSERT INTO detalle_compra (id_compra, id_producto, cantidad, costo_unitario, subtotal)
SELECT i,(i%25)+1,5,30,150 FROM generate_series(1,25) i;

INSERT INTO usuario (username, password_hash, rol, activo, id_empleado)
SELECT 'user'||i,'hash'||i,'vendedor',TRUE,i FROM generate_series(1,25) i;

-- ============================================
-- INDICES
-- ============================================

CREATE INDEX idx_producto_nombre ON producto(nombre);
CREATE INDEX idx_cliente_email ON cliente(email);
CREATE INDEX idx_venta_fecha ON venta(fecha);
CREATE INDEX idx_producto_categoria ON producto(id_categoria);