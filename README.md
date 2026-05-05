# Banco de Alimentos Logística

Sistema de gestión logística, trazabilidad y distribución para el Banco de Alimentos de Bolivia, desarrollado con Next.js y PostgreSQL.

## Requisitos Previos

Asegúrate de tener instalado en tu sistema:

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- [npm](https://www.npmjs.com/) (generalmente se instala junto con Node.js)

## Instalación y Configuración

Sigue estos pasos para poner en marcha el proyecto en tu entorno local:

### 1. Clonar el repositorio

Si aún no lo has hecho, clona este proyecto y navega hasta la carpeta raíz:

```bash
cd <Nombre de tu archivo>
```

### 2. Instalar dependencias

Instala todas las dependencias necesarias de Node.js ejecutando:

```bash
npm install
```

### 3. Configurar variables de entorno

El proyecto requiere conectarse a una base de datos PostgreSQL. Ya existe un archivo `.env.local` con la variable `DATABASE_URL` preconfigurada para apuntar a una instancia de Supabase.

Asegúrate de que el archivo `.env.local` se encuentre en la raíz del proyecto y contenga lo siguiente:

```env
DATABASE_URL="postgresql://<usuario>:<contraseña>@<host>:<puerto>/<basededatos>"
```

### 4. Inicializar la Base de Datos

El proyecto incluye un script para inicializar la base de datos (crear las tablas requeridas y llenarlas con datos de prueba). Para ejecutarlo, utiliza el siguiente comando:

```bash
node setup_db.js
```

_Nota: Verás mensajes en la consola indicando que se han recreado las tablas, cifrado las contraseñas e inyectado los datos de prueba exitosamente._

### 5. Iniciar el servidor de desarrollo

Una vez instaladas las dependencias y configurada la base de datos, puedes iniciar la aplicación en modo desarrollo:

```bash
npm run dev
```

### 6. Acceder a la aplicación

Abre tu navegador web y visita:
[http://localhost:3000](http://localhost:3000)

Serás redirigido a la pantalla de inicio de sesión donde deberás ingresar tus credenciales.

## Funcionalidades

### Autenticación y Roles
- **Sistema de Login seguro** con contraseñas cifradas mediante bcrypt.
- **Roles diferenciados:** Administrador y Conductor, cada uno con su panel exclusivo.
- **Middleware de protección** que impide el acceso a rutas no autorizadas.

### Panel de Administrador
- **Panel de Control:** Visualización de inventario priorizado por antigüedad.
- **Buscador de productos:** Búsqueda en tiempo real de productos en el almacén para despacho.
- **Alertas de caducidad:** Notificaciones automáticas de productos próximos a vencer.
- **Registro de entradas:** Formulario para ingresar nuevas donaciones al almacén.
- **Seguimiento logístico en tiempo real:** Panel que se actualiza automáticamente cada 3 segundos mostrando envíos en tránsito, conductor asignado y métricas de población alimentada.
- **Auditoría completa:** En cada despacho se registra quién lo creó (admin) y quién lo entrega (conductor).

### Panel de Conductor
- **Mis Entregas:** Vista exclusiva con los despachos asignados al conductor.
- **Confirmación de entrega:** Botón interactivo para marcar entregas como completadas en tiempo real.

## Tecnologías utilizadas

- **Framework:** Next.js (React)
- **Estilos:** Tailwind CSS
- **Base de Datos:** PostgreSQL (con la librería `pg` para la conexión)
- **Seguridad:** bcryptjs (cifrado de contraseñas)
- **Iconos:** Lucide React
