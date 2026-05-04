# Sistema de Gestion Logistica - Banco de Alimentos de Bolivia

## Metodologia de Desarrollo: Cascada (Waterfall)

El presente proyecto fue desarrollado siguiendo la metodologia de desarrollo en Cascada, la cual establece un flujo secuencial y ordenado donde cada fase debe completarse antes de avanzar a la siguiente. A continuacion se detalla cada etapa del proceso aplicado.

---

## 1. Analisis de Requisitos

### 1.1 Objetivo General

Desarrollar un sistema web de gestion logistica para el Banco de Alimentos de Bolivia que permita administrar el inventario de donaciones, controlar la distribucion de alimentos hacia poblaciones vulnerables y garantizar la trazabilidad completa de cada despacho, desde el ingreso al almacen hasta la entrega al beneficiario final.

### 1.2 Objetivos Especificos

- Implementar un sistema de inventario basado en el metodo PEPS (Primero en Entrar, Primero en Salir) para priorizar la distribucion de productos con mayor antiguedad en almacen.
- Desarrollar un modulo de alertas automaticas que notifique sobre productos proximos a su fecha de vencimiento.
- Crear un sistema de autenticacion con roles diferenciados (Administrador y Conductor) para controlar el acceso a las funcionalidades segun el perfil del usuario.
- Implementar cifrado de contrasenas mediante algoritmos de hashing para proteger la informacion del personal.
- Disenar un modulo de seguimiento logistico que permita visualizar en tiempo real el estado de los envios en transito.
- Registrar una auditoria completa de cada operacion, identificando que usuario creo el despacho y que conductor realizo la entrega.
- Proporcionar metricas de impacto social que muestren la cantidad de poblacion beneficiada por las entregas realizadas.

### 1.3 Requisitos Funcionales

| ID   | Requisito                                                               |
| ---- | ----------------------------------------------------------------------- |
| RF01 | El sistema debe permitir el inicio de sesion con usuario y contrasena.  |
| RF02 | El sistema debe diferenciar entre roles de Administrador y Conductor.   |
| RF03 | El administrador debe poder visualizar el inventario ordenado por PEPS. |
| RF04 | El administrador debe poder registrar nuevas entradas de donaciones.    |
| RF05 | El administrador debe poder buscar productos en el almacen.             |
| RF06 | El sistema debe alertar sobre productos proximos a vencer.              |
| RF07 | El conductor debe poder ver unicamente sus entregas asignadas.          |
| RF08 | El conductor debe poder confirmar la entrega de un despacho.            |
| RF09 | El panel de seguimiento debe actualizarse automaticamente.              |
| RF10 | Cada despacho debe registrar quien lo creo y quien lo entrego.          |
| RF11 | El sistema debe mostrar la cantidad total de poblacion alimentada.      |

### 1.4 Requisitos No Funcionales

| ID    | Requisito                                                                  |
| ----- | -------------------------------------------------------------------------- |
| RNF01 | Las contrasenas deben almacenarse cifradas con bcrypt (hash irreversible). |
| RNF02 | El sistema debe ser accesible desde navegadores web modernos.              |
| RNF03 | La interfaz debe ser responsiva y adaptarse a dispositivos moviles.        |
| RNF04 | El tiempo de respuesta de las consultas no debe superar los 3 segundos.    |
| RNF05 | El sistema debe proteger las rutas mediante middleware de autenticacion.   |

---

## 2. Diseno del Sistema

### 2.1 Arquitectura

El sistema utiliza una arquitectura basada en componentes con renderizado del lado del servidor (SSR), implementada mediante el framework Next.js con App Router. La comunicacion con la base de datos se realiza de forma directa mediante consultas SQL parametrizadas a traves de la libreria pg (node-postgres).

### 2.2 Diagrama de la Base de Datos

```
usuarios (id, nombre, username, password, rol)
    |
    |--- conductor_id ---> rutas (id, vehiculo_id, conductor_id, estado)
    |                           |
    |--- creado_por --------> despachos (id, ruta_id, beneficiario_id, lote_id, creado_por,
    |                                     cantidad_despachada, estado_entrega, fecha_despacho)
    |                           |
    |                     beneficiarios (id, nombre_institucion, tipo_poblacion,
    |                                    cantidad_personas, direccion)
    |                           |
    |                     lotes (id, producto_id, cantidad_actual, fecha_ingreso,
    |                            fecha_vencimiento, estado)
    |                           |
    |                     productos (id, nombre, categoria)
```

### 2.3 Roles del Sistema

| Rol           | Acceso                                                         |
| ------------- | -------------------------------------------------------------- |
| Administrador | Dashboard PEPS, Registro de Entradas, Seguimiento Logistico.   |
| Conductor     | Panel de Mis Entregas (solo las rutas asignadas a su usuario). |

### 2.4 Vistas de Base de Datos

- **vista_sugerencia_despacho:** Calcula los dias en almacen y dias para vencer de cada lote, priorizando por antiguedad (PEPS).
- **vista_impacto_social:** Consolida la informacion de despachos, beneficiarios, conductores y administradores para la trazabilidad y auditoria.

---

## 3. Implementacion (Codificacion)

### 3.1 Tecnologias Utilizadas

| Componente    | Tecnologia                          |
| ------------- | ----------------------------------- |
| Frontend      | Next.js 14 (React), Tailwind CSS    |
| Backend       | Next.js Server Components y Actions |
| Base de Datos | PostgreSQL (Supabase)               |
| Autenticacion | Cookies HTTP + Middleware           |
| Cifrado       | bcryptjs                            |
| Iconografia   | Lucide React                        |
| Lenguaje      | TypeScript                          |

### 3.2 Estructura del Proyecto

```
FinalProye/
  app/
    actions/
      auth.ts            -- Logica de inicio y cierre de sesion
      entregas.ts         -- Logica de confirmacion de entregas
    distribucion/
      page.tsx            -- Panel principal del administrador (PEPS)
    entradas/
      page.tsx            -- Formulario de registro de donaciones
    login/
      page.tsx            -- Pantalla de inicio de sesion
    mis-entregas/
      page.tsx            -- Panel exclusivo del conductor
    seguimiento/
      page.tsx            -- Seguimiento logistico en tiempo real
    layout.tsx            -- Layout principal con Sidebar
    page.tsx              -- Redireccion inicial
  components/
    AlertasCaducidad.tsx  -- Alertas de productos proximos a vencer
    AutoRefresh.tsx       -- Refresco automatico para tiempo real
    BotonEntrega.tsx      -- Boton de confirmacion del conductor
    BuscadorInventario.tsx-- Buscador de productos en almacen
    Sidebar.tsx           -- Menu lateral con roles
    TablaDespachos.tsx    -- Tabla PEPS de despachos sugeridos
  types/
    database.ts           -- Definiciones de tipos TypeScript
  utils/
    db.ts                 -- Conexion a la base de datos
  middleware.ts           -- Proteccion de rutas por rol
  schema.sql              -- Esquema de la base de datos
  setup_db.js             -- Script de inicializacion y datos de prueba
```

### 3.3 Seguridad Implementada

- Las contrasenas se almacenan como hashes bcrypt de 10 rondas de salt.
- Las cookies de sesion utilizan el atributo `httpOnly` para prevenir acceso desde JavaScript del cliente.
- Las consultas a la base de datos utilizan parametros (`$1`, `$2`) para prevenir inyeccion SQL.
- El middleware intercepta todas las peticiones y valida el rol antes de permitir el acceso.
- Los errores internos del servidor no se exponen al usuario final; se registran unicamente en los logs del servidor.

---

## 4. Pruebas

### 4.1 Pruebas Realizadas

| Caso de Prueba                                          | Resultado                        |
| ------------------------------------------------------- | -------------------------------- |
| Inicio de sesion con credenciales correctas (admin)     | Exitoso                          |
| Inicio de sesion con credenciales correctas (conductor) | Exitoso                          |
| Inicio de sesion con credenciales incorrectas           | Rechazado correctamente          |
| Acceso a rutas protegidas sin sesion                    | Redirigido a /login              |
| Conductor intenta acceder a /distribucion               | Redirigido a /mis-entregas       |
| Administrador visualiza inventario PEPS                 | Exitoso                          |
| Buscador filtra productos por nombre y categoria        | Exitoso                          |
| Conductor confirma entrega de un despacho               | Estado actualizado a "entregado" |
| Panel de seguimiento se actualiza automaticamente       | Exitoso (cada 3 segundos)        |
| Auditoria muestra quien cargo y quien entrego           | Exitoso                          |
| Compilacion del proyecto sin errores de TypeScript      | Exitoso                          |

### 4.2 Herramientas de Verificacion

- Compilacion de produccion con `npx next build` para validar tipos e integridad del codigo.
- Pruebas manuales de flujo completo con dos sesiones simultaneas (administrador y conductor).

---

## 5. Despliegue

### 5.1 Requisitos del Entorno

- Node.js version 18 o superior.
- Acceso a una base de datos PostgreSQL (se utiliza Supabase como proveedor).
- Archivo de configuracion `.env.local` con la variable `DATABASE_URL`.

### 5.2 Procedimiento de Despliegue

1. Instalar dependencias: `npm install`
2. Configurar la variable de entorno `DATABASE_URL` en el archivo `.env.local`.
3. Ejecutar el script de inicializacion: `node setup_db.js`
4. Iniciar el servidor: `npm run dev` (desarrollo) o `npm run build && npm start` (produccion).

---

## 6. Mantenimiento

### 6.1 Consideraciones para Futuras Versiones

- Integracion con un proveedor de identidad externo (OAuth, Auth0) para mayor seguridad.
- Implementacion de geolocalizacion GPS en tiempo real para los conductores.
- Generacion de reportes exportables en formato PDF o Excel.
- Notificaciones por correo electronico o SMS cuando se confirmen entregas.
- Panel de administracion de usuarios (crear, editar y eliminar cuentas).

### 6.2 Respaldo de Datos

Se recomienda configurar respaldos automaticos de la base de datos PostgreSQL a traves del panel de administracion de Supabase, con una frecuencia minima de una vez al dia.

---

## Conclusiones

El sistema desarrollado cumple con los objetivos planteados al inicio del proyecto, proporcionando al Banco de Alimentos de Bolivia una herramienta funcional para la gestion logistica de sus operaciones. La metodologia en Cascada permitio un desarrollo ordenado y documentado, donde cada fase fue completada y validada antes de avanzar a la siguiente. El resultado es un sistema seguro, trazable y orientado al impacto social, capaz de registrar cada movimiento desde el ingreso de una donacion hasta su entrega al beneficiario final.
