"use server";
import pool from '@/utils/db';
import { revalidatePath } from 'next/cache';

export async function confirmarEntrega(despachoId: string) {
  try {
    await pool.query(
      `UPDATE despachos SET estado_entrega = 'entregado' WHERE id = $1`,
      [despachoId]
    );
    revalidatePath('/mis-entregas');
    revalidatePath('/seguimiento');
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: 'No se pudo confirmar la entrega' };
  }
}
