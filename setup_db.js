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
    const passHash = await bcrypt.hash('conductor123', 10); // Contraseña común para conductores de prueba
    console.log('✅ Contraseñas cifradas.');

    console.log('⏳ Inyectando datos de prueba...');
    
    // Usuarios con contraseñas cifradas
    await client.query(`
      INSERT INTO usuarios (id, nombre, username, password, rol) VALUES 
        ('a1111111-1111-1111-1111-111111111111', 'Admin Central', 'admin', $1, 'admin'),
        ('a2222222-2222-2222-2222-222222222222', 'Juan', 'juan', $2, 'conductor'),
        ('a3333333-3333-3333-3333-333333333333', 'Mario', 'mario', $2, 'conductor'),
        ('a4444444-4444-4444-4444-444444444444', 'Elena', 'elena', $2, 'conductor');
    `, [adminHash, passHash]);

    // Vehículos
    await client.query(`
      INSERT INTO vehiculos (id, placa, modelo, capacidad_kg) VALUES 
        ('11111111-1111-1111-1111-111111111111', 'ABC-123', 'Volvo FMX', 5000),
        ('22222222-2222-2222-2222-222222222222', 'DEF-456', 'Sprinter', 2000);
    `);

    // Instituciones
    await client.query(`
      INSERT INTO instituciones (id, nombre, tipo_poblacion, cantidad_personas, direccion, latitud, longitud) VALUES 
        ('b1111111-1111-1111-1111-111111111111', 'Comedor Esperanza', 'Niños en situación de calle', 150, 'Zona Sur, Calle 1', -17.3895, -66.1568),
        ('b2222222-2222-2222-2222-222222222222', 'Asilo San José', 'Adultos Mayores', 80, 'Zona Central', -17.3912, -66.1541),
        ('b3333333-3333-3333-3333-333333333333', 'Fundación Vida', 'Madres Solteras', 200, 'Zona Norte', -17.3785, -66.1620);
    `);

    // Resto de datos
    const insertData = `
      -- Rutas
      INSERT INTO rutas (id, vehiculo_id, conductor_id, estado) VALUES 
        ('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'en_curso'),
        ('c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'completada');

      -- Productos
      INSERT INTO productos (id, nombre, categoria) VALUES 
        ('d1111111-1111-1111-1111-111111111111', 'Fideo Macarrones 10kg', 'Abarrotes'),
        ('d2222222-2222-2222-2222-222222222222', 'Atún en Lata', 'Conservas'),
        ('d3333333-3333-3333-3333-333333333333', 'Manzanas', 'Frutas');

      -- Lotes (PEPS)
      INSERT INTO lotes (id, producto_id, cantidad_disponible, fecha_ingreso, fecha_vencimiento, donante) VALUES 
        ('e1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 50, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_DATE + INTERVAL '200 days', 'Donante A'),
        ('e2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 200, CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_DATE + INTERVAL '300 days', 'Donante B'),
        ('e3333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 80, CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_DATE + INTERVAL '5 days', 'Donante C');

      -- Despachos
      INSERT INTO despachos (id, ruta_id, institucion_id, lote_id, creado_por, cantidad_despachada, estado_entrega) VALUES 
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
