"use server";
import pool from '@/utils/db';
import { revalidatePath } from 'next/cache';

export async function registrarEntrada(formData: FormData) {
  const productoId = formData.get('productoId') as string;
  const cantidad = parseInt(formData.get('cantidad') as string);
  const donante = formData.get('donante') as string || null;

  if (!productoId || isNaN(cantidad) || cantidad <= 0) {
    return { error: 'Datos inválidos' };
  }

  try {
    // La fecha_ingreso se asigna automaticamente como NOW() para garantizar PEPS
    await pool.query(
      `INSERT INTO lotes (producto_id, cantidad_disponible, fecha_ingreso, donante)
       VALUES ($1, $2, NOW(), $3)`,
      [productoId, cantidad, donante]
    );
    revalidatePath('/entradas');
    revalidatePath('/distribucion');
    return { success: true };
  } catch (err) {
    console.error('[ENTRADA ERROR]', err);
    return { error: 'No se pudo registrar el lote' };
  }
}