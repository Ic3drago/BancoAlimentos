const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.xiflkokvukptzehkladn:Omeg@mode_66@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  try {
    await client.connect();
    console.log('✅ Conectado a la Base de Datos PostgreSQL.');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('⏳ Ejecutando esquema SQL...');
    await client.query(sql);
    console.log('✅ Tablas recreadas.');

    console.log('⏳ Cifrando contraseñas con bcrypt...');
    const adminHash = await bcrypt.hash('admin123', 10);
    const juanHash = await bcrypt.hash('juan123', 10);
    console.log('✅ Contraseñas cifradas.');

    console.log('⏳ Inyectando datos de prueba...');
    
    // Usuarios con contraseñas cifradas
    await client.query(`
      INSERT INTO usuarios (id, nombre, username, password, rol) VALUES 
        ('a1111111-1111-1111-1111-111111111111', 'Admin Central', 'admin', $1, 'admin'),
        ('a2222222-2222-2222-2222-222222222222', 'Juan Conductor', 'juan', $2, 'conductor');
    `, [adminHash, juanHash]);

    // Resto de datos (sin datos sensibles)
    const insertData = `
      -- Beneficiarios
      INSERT INTO beneficiarios (id, nombre_institucion, tipo_poblacion, cantidad_personas, direccion) VALUES 
        ('b1111111-1111-1111-1111-111111111111', 'Comedor Esperanza', 'Niños en situación de calle', 150, 'Zona Sur, Calle 1'),
        ('b2222222-2222-2222-2222-222222222222', 'Asilo San José', 'Adultos Mayores', 80, 'Zona Central'),
        ('b3333333-3333-3333-3333-333333333333', 'Fundación Vida', 'Madres Solteras', 200, 'Zona Norte');

      -- Rutas
      INSERT INTO rutas (id, vehiculo_id, conductor_id, estado) VALUES 
        ('c1111111-1111-1111-1111-111111111111', 'Camión Volvo FMX-01', 'a2222222-2222-2222-2222-222222222222', 'en_curso'),
        ('c2222222-2222-2222-2222-222222222222', 'Furgoneta Sprinter-02', 'a2222222-2222-2222-2222-222222222222', 'completada');

      -- Productos
      INSERT INTO productos (id, nombre, categoria) VALUES 
        ('d1111111-1111-1111-1111-111111111111', 'Fideo Macarrones 10kg', 'Abarrotes'),
        ('d2222222-2222-2222-2222-222222222222', 'Atún en Lata', 'Conservas'),
        ('d3333333-3333-3333-3333-333333333333', 'Manzanas', 'Frutas');

      -- Lotes (PEPS)
      INSERT INTO lotes (id, producto_id, cantidad_actual, fecha_ingreso, fecha_vencimiento) VALUES 
        ('e1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 50, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_DATE + INTERVAL '200 days'),
        ('e2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 200, CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_DATE + INTERVAL '300 days'),
        ('e3333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 80, CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_DATE + INTERVAL '5 days');

      -- Despachos (con auditoría de quién los creó)
      INSERT INTO despachos (id, ruta_id, beneficiario_id, lote_id, creado_por, cantidad_despachada, estado_entrega) VALUES 
        ('f1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 10, 'en_transito'),
        ('f2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'e2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 50, 'entregado'),
        ('f3333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 'b3333333-3333-3333-3333-333333333333', 'e3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 20, 'entregado');
    `;
    await client.query(insertData);
    console.log('✅ Datos de prueba inyectados.');

  } catch (err) {
    console.error('❌ Error al configurar la base de datos:', err);
  } finally {
    await client.end();
  }
}

setupDatabase();
