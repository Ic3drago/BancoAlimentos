# ACTIVIDAD 6: Investigación y aplicación de pruebas de software
**Proyecto:** Sistema de Logística - Banco de Alimentos Bolivia
**Fecha:** 05/05/2026
**Tipo:** Grupal

---

## 1. Investigación sobre Pruebas de Software

### 1.1 Tipos de Pruebas de Software
*   **Pruebas Unitarias:** Verifican el funcionamiento de componentes individuales de código (funciones, métodos) en aislamiento.
*   **Pruebas Funcionales:** Se centran en los requisitos del sistema, validando que el software haga lo que se supone que debe hacer.
*   **Pruebas de Integración:** Verifican que diferentes módulos o servicios funcionen correctamente cuando se combinan.
*   **Pruebas de Aceptación (UAT):** Realizadas por el usuario final para confirmar que el sistema cumple con sus necesidades de negocio.

### 1.2 Diseño del Plan de Pruebas
Es el proceso de definir el alcance, enfoque, recursos y cronograma de las actividades de prueba. Define qué se va a probar, quién lo hará y bajo qué criterios.

### 1.3 Identificación de Casos de Prueba
Según **ISTQB**, un caso de prueba especifica entradas, condiciones de ejecución y resultados esperados para cubrir un objetivo de prueba específico.

### 1.4 Reporte de Pruebas
Documento que resume el resultado de la ejecución de las pruebas, detallando qué falló, qué pasó y el estado general de la calidad del software (basado en **IEEE 829**).

### 1.5 Gestión de Cambios y Corrección de Errores
Proceso sistemático para identificar, registrar (**Bug Tracking**), priorizar y resolver defectos encontrados durante las pruebas (basado en **IEEE 1044**).

---

## 2. Aplicación al Proyecto Final

### 2.1 Pruebas Unitarias
*   **Entrada:** Registro de un producto con `fecha_vencimiento` anterior a la fecha actual.
*   **Resultado esperado:** El sistema debe marcar el lote como "No Apto" o rechazar el ingreso.
*   **Entrada:** Coordenada de latitud como texto `"NaN"`.
*   **Resultado esperado:** La función de renderizado del mapa debe convertirlo a número o usar un valor por defecto para evitar errores de la API de Google Maps.

### 2.2 Pruebas Funcionales
*   **Módulo Almacén:** Registrar una donación de 500kg de arroz y verificar que el stock aumente correctamente.
*   **Módulo Distribución:** Asignar un lote a una institución y verificar que la cantidad disponible en el lote disminuya automáticamente (PEPS).
*   **Módulo Logística:** Visualizar la ruta en el mapa entre el conductor y la institución destino.

### 2.3 Pruebas de Aceptación (Simuladas)
*   **Escenario:** Una ONG (Hogar San José) solicita 100 unidades de fideo.
*   **Acción:** El Admin busca en el sistema el lote más antiguo (PEPS), lo asigna a la ONG y genera la ruta para el conductor.
*   **Validación:** El conductor recibe la notificación y el sistema muestra la ubicación exacta en el mapa.

---

## 3. Diseño del Plan de Pruebas

*   **Objetivo:** Validar el funcionamiento del módulo de Distribución y el seguimiento en tiempo real del Mapa.
*   **Alcance:** Se probará la asignación de lotes, actualización de stock y renderizado de mapas de Google. No se probará la integración con GPS real en esta fase (se usará simulación).
*   **Estrategia:** Pruebas funcionales de caja negra y pruebas de integración con Supabase (PostgreSQL).
*   **Entorno:** Next.js (React/TypeScript), Base de Datos Supabase, Google Maps API.
*   **Responsables:** Equipo de desarrollo del Banco de Alimentos.
*   **Cronograma:**
    *   Semana 1: Pruebas unitarias de acciones de servidor.
    *   Semana 2: Pruebas funcionales de interfaz y Mapas.

---

## 4. Identificación de Casos de Prueba

| ID | Caso | Entrada | Resultado Esperado |
|:---:|:---|:---|:---|
| CP01 | Registrar Donante | Nombre: "Súper A", Producto: Arroz | Registro exitoso en tabla `lotes` |
| CP02 | Seleccionar Vencido | Fecha: 01/01/2020 | El sistema rechaza el lote (PEPS) |
| CP03 | Asignar Ruta | Conductor ID, Lote ID | Se crea registro en `despachos` |
| CP04 | Render Mapa | Lat: -17.38, Lng: -66.15 | El mapa de Google muestra marcador |

---

## 5. Reporte de Pruebas

| Caso | Resultado Esperado | Resultado Obtenido | Estado |
|:---:|:---|:---|:---|
| CP01 | Correcto | Correcto | **OK** |
| CP02 | Rechazo | Rechazo | **OK** |
| CP03 | Stock actualizado | Stock actualizado | **OK** |
| CP04 | Mostrar marcador | "Invalid LatLng" (Error corregido) | **FIXED** |

> **Nota:** Se encontró un error inicial donde las coordenadas DECIMAL de la BD llegaban como String, causando un fallo en la API de Google Maps. Se aplicó `Number()` para corregirlo.

---

## 6. Gestión de Cambios y Corrección de Errores

### a) Registro de Errores (Bug Tracking)
| ID | Error | Módulo | Severidad | Estado |
|:---:|:---|:---|:---|:---|
| BUG01 | Error de tipos en coordenadas | Mapa / Logística | Alta | **Cerrado** |
| BUG02 | Sesión no expira al cerrar | Seguridad | Media | **Abierto** |

### b) Flujo de Corrección
1.  **Detección:** Usuario reporta que el mapa aparece en blanco.
2.  **Registro:** Se crea BUG01 detallando que la API de Google falla por tipos de datos.
3.  **Asignación:** Responsable de Frontend.
4.  **Corrección:** Aplicación de conversión explícita a `Number` en el componente.
5.  **Verificación:** Se vuelve a probar con datos de la BD y se confirma la visualización.
