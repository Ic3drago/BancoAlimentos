-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Limpieza
DROP VIEW IF EXISTS vista_sugerencia_despacho;
DROP VIEW IF EXISTS vista_impacto_social;
DROP TABLE IF EXISTS despachos CASCADE;
DROP TABLE IF EXISTS rutas CASCADE;
DROP TABLE IF EXISTS lotes CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS beneficiarios CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 0. Tabla de Usuarios (Roles)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'empleado' -- 'admin', 'conductor'
);

-- 1. Tabla de Beneficiarios (Impacto Social)
CREATE TABLE beneficiarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_institucion VARCHAR(255) NOT NULL,
    tipo_poblacion VARCHAR(100) NOT NULL,
    cantidad_personas INTEGER NOT NULL CHECK (cantidad_personas >= 0),
    direccion TEXT
);

-- 2. Tabla de Productos
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL
);

-- 3. Tabla de Lotes (PEPS)
CREATE TABLE lotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
    cantidad_actual INTEGER NOT NULL CHECK (cantidad_actual >= 0),
    fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(50) DEFAULT 'disponible'
);

-- 4. Tabla de Rutas
CREATE TABLE rutas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehiculo_id VARCHAR(100) NOT NULL,
    conductor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    estado VARCHAR(50) DEFAULT 'programada'
);

-- 5. Tabla de Despachos (Trazabilidad y Auditoría)
CREATE TABLE despachos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ruta_id UUID REFERENCES rutas(id) ON DELETE CASCADE,
    beneficiario_id UUID REFERENCES beneficiarios(id) ON DELETE CASCADE,
    lote_id UUID REFERENCES lotes(id) ON DELETE CASCADE,
    creado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    cantidad_despachada INTEGER NOT NULL CHECK (cantidad_despachada > 0),
    estado_entrega VARCHAR(50) DEFAULT 'en_transito', -- 'en_transito', 'entregado', 'cancelado'
    fecha_despacho TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Vista de Sugerencia de Despacho (Cálculo PEPS)
CREATE VIEW vista_sugerencia_despacho AS
SELECT 
    l.id AS lote_id,
    p.id AS producto_id,
    p.nombre AS nombre_producto,
    p.categoria,
    l.cantidad_actual,
    l.fecha_ingreso,
    l.fecha_vencimiento,
    EXTRACT(DAY FROM (CURRENT_TIMESTAMP - l.fecha_ingreso)) AS dias_en_almacen,
    (l.fecha_vencimiento - CURRENT_DATE) AS dias_para_vencer
FROM 
    lotes l
JOIN 
    productos p ON l.producto_id = p.id
WHERE 
    l.cantidad_actual > 0;

-- 7. Vista de Seguimiento (Auditoría completa: quién cargó y quién entrega)
CREATE VIEW vista_impacto_social AS
SELECT 
    d.id AS despacho_id,
    b.nombre_institucion,
    b.tipo_poblacion,
    b.cantidad_personas,
    p.nombre AS producto_entregado,
    d.cantidad_despachada,
    d.fecha_despacho,
    d.estado_entrega,
    r.id AS ruta_id,
    r.vehiculo_id,
    conductor.nombre AS nombre_conductor,
    admin_user.nombre AS cargado_por
FROM 
    despachos d
JOIN beneficiarios b ON d.beneficiario_id = b.id
JOIN lotes l ON d.lote_id = l.id
JOIN productos p ON l.producto_id = p.id
JOIN rutas r ON d.ruta_id = r.id
LEFT JOIN usuarios conductor ON r.conductor_id = conductor.id
LEFT JOIN usuarios admin_user ON d.creado_por = admin_user.id;
