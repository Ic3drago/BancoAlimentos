-- ============================================================
-- ESQUEMA DE BASE DE DATOS PROFESIONAL - BANCO DE ALIMENTOS BOLIVIA
-- Versión: 2.0 (Modernización Logística y GPS)
-- ============================================================

-- 1. LIMPIEZA DE TABLAS (Para despliegue limpio)
DROP VIEW IF EXISTS vista_impacto_social;
DROP VIEW IF EXISTS vista_sugerencia_despacho;
DROP TABLE IF EXISTS despachos CASCADE;
DROP TABLE IF EXISTS rutas CASCADE;
DROP TABLE IF EXISTS lotes CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS instituciones CASCADE;
DROP TABLE IF EXISTS vehiculos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USUARIOS (Roles: admin, conductor, empleado)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'empleado'
);

-- 3. VEHÍCULOS
CREATE TABLE vehiculos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    placa VARCHAR(20) UNIQUE NOT NULL,
    modelo VARCHAR(100),
    capacidad_kg DECIMAL(10, 2)
);

-- 4. INSTITUCIONES (Destinos de entrega)
CREATE TABLE instituciones (
    id PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    tipo_poblacion VARCHAR(100) NOT NULL,
    cantidad_personas INTEGER NOT NULL CHECK (cantidad_personas >= 0),
    direccion TEXT,
    latitud DECIMAL(10, 7),
    longitud DECIMAL(10, 7)
);

-- 5. PRODUCTOS (Con soporte para unidades y conversión)
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    unidad_medida VARCHAR(50) DEFAULT 'unidades', -- Ej: Caja, Arroba
    factor_conversion DECIMAL(10, 2) DEFAULT 1.0, -- Cuántas unidades base hay en una unidad de medida
    unidad_base VARCHAR(50) DEFAULT 'unidades'    -- Ej: Botella, Kilo
);

-- 6. LOTES (Sistema PEPS - Primeras Entradas Primeras Salidas)
CREATE TABLE lotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
    cantidad_disponible DECIMAL(10, 2) NOT NULL CHECK (cantidad_disponible >= 0),
    fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento DATE NOT NULL,
    donante TEXT,
    estado VARCHAR(50) DEFAULT 'disponible'
);

-- 7. RUTAS (Seguimiento GPS en tiempo real)
CREATE TABLE rutas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehiculo_id UUID REFERENCES vehiculos(id) ON DELETE SET NULL,
    conductor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    estado VARCHAR(50) DEFAULT 'programada',
    latitud_actual DECIMAL(10, 7),
    longitud_actual DECIMAL(10, 7),
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. DESPACHOS (Movimientos de inventario)
CREATE TABLE despachos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ruta_id UUID REFERENCES rutas(id) ON DELETE CASCADE,
    institucion_id UUID REFERENCES instituciones(id) ON DELETE CASCADE,
    lote_id UUID REFERENCES lotes(id) ON DELETE CASCADE,
    creado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    cantidad_despachada DECIMAL(10, 2) NOT NULL CHECK (cantidad_despachada > 0),
    estado_entrega VARCHAR(50) DEFAULT 'en_transito',
    fecha_despacho TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega TIMESTAMP
);

-- 9. VISTAS ANALÍTICAS

-- Vista para sugerir qué lotes despachar primero (PEPS)
CREATE VIEW vista_sugerencia_despacho AS
SELECT 
    l.id AS lote_id,
    p.id AS producto_id,
    p.nombre AS nombre_producto,
    p.categoria,
    l.cantidad_disponible,
    l.fecha_ingreso,
    l.fecha_vencimiento,
    EXTRACT(DAY FROM (CURRENT_TIMESTAMP - l.fecha_ingreso)) AS dias_en_almacen,
    (l.fecha_vencimiento - CURRENT_DATE) AS dias_para_vencer
FROM 
    lotes l
JOIN 
    productos p ON l.producto_id = p.id
WHERE 
    l.cantidad_disponible > 0;

-- Vista completa para seguimiento e impacto social
CREATE VIEW vista_impacto_social AS
SELECT
  d.id                        AS despacho_id,
  d.estado_entrega,
  d.fecha_despacho,
  d.fecha_entrega,
  d.cantidad_despachada,
  p.nombre                    AS producto_entregado,
  i.nombre                    AS nombre_institucion,
  i.tipo_poblacion,
  i.cantidad_personas,
  i.latitud                   AS lat_destino,
  i.longitud                  AS lng_destino,
  v.placa                     AS vehiculo_id,
  u.nombre                    AS nombre_conductor,
  u2.nombre                   AS cargado_por,
  r.id                        AS ruta_id,
  r.latitud_actual,
  r.longitud_actual,
  r.ultima_actualizacion
FROM despachos d
JOIN lotes l         ON d.lote_id = l.id
JOIN productos p     ON l.producto_id = p.id
JOIN instituciones i ON d.institucion_id = i.id
JOIN rutas r         ON d.ruta_id = r.id
JOIN vehiculos v     ON r.vehiculo_id = v.id
JOIN usuarios u      ON r.conductor_id = u.id
LEFT JOIN usuarios u2 ON d.creado_por = u2.id;

-- 10. ÍNDICES (Optimización de búsqueda)
CREATE INDEX idx_despachos_estado ON despachos(estado_entrega);
CREATE INDEX idx_lotes_fecha_peps ON lotes(producto_id, fecha_ingreso ASC) WHERE cantidad_disponible > 0;
CREATE INDEX idx_rutas_conductor ON rutas(conductor_id) WHERE estado != 'completada';


