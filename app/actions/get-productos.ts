"use server";
import pool from '@/utils/db';
import { revalidatePath } from 'next/cache';

export async function getProductos() {
  try {
    const res = await pool.query('SELECT id, nombre, categoria, unidad_medida, factor_conversion, unidad_base FROM productos ORDER BY nombre ASC');
    return res.rows;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function crearProducto(
  nombre: string, 
  categoria: string, 
  unidad_medida: string = 'unidades',
  factor_conversion: number = 1.0,
  unidad_base: string = 'unidades'
) {
  if (!nombre || !categoria) return { error: 'Nombre y categoría son obligatorios' };
  try {
    const res = await pool.query(
      'INSERT INTO productos (nombre, categoria, unidad_medida, factor_conversion, unidad_base) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, categoria, unidad_medida, factor_conversion, unidad_base]
    );
    revalidatePath('/entradas');
    return { success: true, producto: res.rows[0] };
  } catch (err) {
    console.error(err);
    return { error: 'No se pudo crear el producto. Tal vez ya existe.' };
  }
}
