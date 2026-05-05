"use server";
import pool from '@/utils/db';
import { revalidatePath } from 'next/cache';

export async function registrarEntradasMasivas(entradas: { productoId: string, cantidad: string, donante: string }[]) {
  if (!entradas || entradas.length === 0) return { error: 'No hay entradas para registrar' };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const entrada of entradas) {
      // Obtener factor de conversión del producto
      const prodRes = await client.query('SELECT factor_conversion FROM productos WHERE id = $1', [entrada.productoId]);
      const factor = parseFloat(prodRes.rows[0]?.factor_conversion || '1');
      const cantidadBase = parseFloat(entrada.cantidad) * factor;

      await client.query(
        'INSERT INTO lotes (producto_id, cantidad_disponible, fecha_vencimiento, donante) VALUES ($1, $2, CURRENT_DATE + INTERVAL \'6 months\', $3)',
        [entrada.productoId, cantidadBase, entrada.donante]
      );
    }

    await client.query('COMMIT');
    revalidatePath('/entradas');
    revalidatePath('/distribucion');
    return { success: true };
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error(err);
    return { error: 'Error al registrar las donaciones' };
  } finally {
    client.release();
  }
}
