"use server";
import pool from '@/utils/db';

export async function getDistribucionData() {
  try {
    const [lotes, instituciones, rutas] = await Promise.all([
      pool.query(`
        SELECT l.id, p.nombre as producto, l.cantidad_disponible, l.fecha_ingreso, p.categoria
        FROM lotes l
        JOIN productos p ON l.producto_id = p.id
        WHERE l.cantidad_disponible > 0
        ORDER BY l.fecha_ingreso ASC
      `),
      pool.query(`SELECT id, nombre, tipo_poblacion, cantidad_personas FROM instituciones ORDER BY nombre ASC`),
      pool.query(`
        SELECT r.id, u.nombre as conductor, v.placa as vehiculo
        FROM rutas r
        JOIN usuarios u ON r.conductor_id = u.id
        JOIN vehiculos v ON r.vehiculo_id = v.id
        WHERE r.estado != 'completada'
      `)
    ]);

    return {
      lotes: lotes.rows,
      instituciones: instituciones.rows,
      rutas: rutas.rows
    };
  } catch (err) {
    console.error('[FETCH DATA ERROR]', err);
    return { error: 'Error al cargar datos' };
  }
}
