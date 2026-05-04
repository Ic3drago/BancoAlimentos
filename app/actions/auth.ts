"use server";

import pool from '@/utils/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Por favor, ingresa usuario y contraseña.' };
  }

  let user = null;

  try {
    const res = await pool.query(
      'SELECT id, nombre, username, password, rol FROM usuarios WHERE username = $1',
      [username]
    );
    
    if (res.rows.length === 0) {
      return { error: 'Usuario o contraseña incorrectos.' };
    }

    user = res.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return { error: 'Usuario o contraseña incorrectos.' };
    }
  } catch (err: any) {
    // No exponer detalles técnicos al usuario
    console.error('[AUTH ERROR]', err.message);
    return { error: 'No se pudo conectar al servidor. Intente más tarde.' };
  }

  // Establecer cookies FUERA del try/catch para evitar conflictos con redirect()
  cookies().set('session_user_id', user.id, { httpOnly: true, path: '/' });
  cookies().set('session_user_rol', user.rol, { httpOnly: true, path: '/' });
  cookies().set('session_user_nombre', user.nombre, { path: '/' });

  if (user.rol === 'admin') {
    redirect('/distribucion');
  } else {
    redirect('/mis-entregas');
  }
}

export async function logout() {
  cookies().delete('session_user_id');
  cookies().delete('session_user_rol');
  cookies().delete('session_user_nombre');
  redirect('/login');
}
