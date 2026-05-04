"use server";
import pool from '@/utils/db';

export async function getProductos() {
  try {
    const res = await pool.query('SELECT id, nombre, categoria FROM productos ORDER BY nombre ASC');
    return res.rows;
  } catch (err) {
    console.error(err);
    return [];
  }
}
