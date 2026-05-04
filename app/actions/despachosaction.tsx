"use server";
import pool from '@/utils/db';
import { revalidatePath } from 'next/cache';

type AsignacionItem = {
  loteId: string;
  instId: string;
  cantidadEnviar: number;
};

type DespachoPayload = {
  rutaId: string;
  asignaciones: AsignacionItem[];
};

export async function crearDespacho(payload: DespachoPayload) {
  const { rutaId, asignaciones } = payload;

  if (!rutaId || !asignaciones || asignaciones.length === 0) {
    return { error: 'Datos incompletos para crear el despacho' };
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const asig of asignaciones) {
      const { loteId, instId, cantidadEnviar } = asig;

      // Verificar disponibilidad
      const loteRes = await client.query(
        'SELECT cantidad_disponible FROM lotes WHERE id = $1 FOR UPDATE',
        [loteId]
      );
      if (loteRes.rows.length === 0) throw new Error(`Lote ${loteId} no encontrado`);
      
      const disponible = loteRes.rows[0].cantidad_disponible;
      if (cantidadEnviar > disponible) {
        throw new Error(`Stock insuficiente en lote ${loteId}: disponible ${disponible}, solicitado ${cantidadEnviar}`);
      }

      // Crear el despacho
      await client.query(
        `INSERT INTO despachos (lote_id, institucion_id, ruta_id, cantidad_despachada, estado_entrega, fecha_despacho)
         VALUES ($1, $2, $3, $4, 'en_transito', NOW())`,
        [loteId, instId, rutaId, cantidadEnviar]
      );

      // Descontar del lote (PEPS: se descuenta del lote más antiguo seleccionado)
      await client.query(
        'UPDATE lotes SET cantidad_disponible = cantidad_disponible - $1 WHERE id = $2',
        [cantidadEnviar, loteId]
      );
    }

    await client.query('COMMIT');
    revalidatePath('/distribucion');
    revalidatePath('/seguimiento');
    revalidatePath('/mis-entregas');
    return { success: true };
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[DESPACHO ERROR]', err.message);
    return { error: err.message || 'Error al crear el despacho' };
  } finally {
    client.release();
  }
}

export async function confirmarEntrega(despachoId: string) {
  try {
    await pool.query(
      `UPDATE despachos SET estado_entrega = 'entregado', fecha_entrega = NOW() WHERE id = $1`,
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