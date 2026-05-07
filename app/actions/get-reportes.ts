import pool from '@/utils/db';

export async function getReporteGeneral() {
  try {
    // 1. Entregas completadas (Impacto Social)
    const entregasRes = await pool.query(`
      SELECT * FROM vista_impacto_social 
      WHERE estado_entrega = 'entregado'
      ORDER BY fecha_entrega DESC
    `);

    // 2. Prioridad PEPS (Sugerencia de despacho)
    const pepsRes = await pool.query(`
      SELECT * FROM vista_sugerencia_despacho
      ORDER BY fecha_vencimiento ASC, fecha_ingreso ASC
    `);

    // 3. Resumen por institución
    const resumenInstRes = await pool.query(`
      SELECT 
        nombre_institucion,
        COUNT(*) as total_entregas,
        SUM(cantidad_despachada) as total_productos,
        MAX(fecha_entrega) as ultima_entrega
      FROM vista_impacto_social
      WHERE estado_entrega = 'entregado'
      GROUP BY nombre_institucion
      ORDER BY total_entregas DESC
    `);

    return {
      success: true,
      entregas: entregasRes.rows,
      peps: pepsRes.rows,
      resumenInstituciones: resumenInstRes.rows
    };
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    return { success: false, error: 'No se pudieron cargar los reportes' };
  }
}
