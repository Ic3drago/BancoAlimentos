"use server";
import pool from '@/utils/db';
import { revalidatePath } from 'next/cache';

export async function actualizarUbicacionRuta(rutaId: string, lat: number, lng: number) {
  if (!rutaId || !lat || !lng) return { error: 'Datos de ubicación incompletos' };

  try {
    await pool.query(
      `UPDATE rutas 
       SET latitud_actual = $1, longitud_actual = $2, ultima_actualizacion = NOW() 
       WHERE id = $3`,
      [lat, lng, rutaId]
    );
    // No revalidamos path aquí porque se llama muy frecuentemente
    return { success: true };
  } catch (err) {
    console.error('[UPDATE LOCATION ERROR]', err);
    return { error: 'Error al actualizar ubicación' };
  }
}
