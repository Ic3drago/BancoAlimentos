"use server";
import pool from '@/utils/db';

export async function getEntregasActivas() {
  try {
    const res = await pool.query(`
      SELECT 
        v.despacho_id,
        v.nombre_institucion,
        v.lat_destino,
        v.lng_destino,
        v.nombre_conductor,
        v.vehiculo_id as placa,
        v.producto_entregado,
        v.cantidad_despachada,
        r.latitud_actual,
        r.longitud_actual,
        r.ultima_actualizacion
      FROM vista_impacto_social v
      JOIN rutas r ON v.ruta_id = r.id
      WHERE v.estado_entrega = 'en_transito'
    `);
    return res.rows;
  } catch (err) {
    console.error(err);
    return [];
  }
}
