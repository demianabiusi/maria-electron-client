# Hoja de Ruta (Roadmap): Clon de SQLYog con Electron

Este documento sirve como guía y contexto para el desarrollo de una aplicación de escritorio multiplataforma (Windows y Linux), similar a SQLYog, utilizando Electron.

## 1. Objetivo del Proyecto

El objetivo es crear un cliente de base de datos SQL enfocado exclusivamente en **MySQL y MariaDB**, que permita a los usuarios conectarse, explorar esquemas y ejecutar consultas. La aplicación debe ser compilable para Windows y Linux.

## 2. Tecnologías Principales

- **Framework Principal**: Electron.
- **Lógica de Negocio (Proceso Principal de Electron)**: Node.js. Aquí se gestionarán las conexiones a las bases de datos y las consultas.
- **Interfaz de Usuario (Proceso de Renderizado de Electron)**: HTML, CSS y un framework de JavaScript moderno.
    - **Recomendación**: **React** o **Vue**. Son ideales para construir interfaces de usuario complejas y reactivas como la que necesita un cliente SQL.
- **Comunicación Segura**: `contextBridge` de Electron para exponer APIs del proceso principal al de renderizado de forma segura.
- **Driver de Base de Datos (Node.js)**:
    - `mysql2`: Es el estándar de facto para Node.js. Es rápido, seguro y soporta promesas.
- **Empaquetado y Distribución**: `electron-builder`. Facilita la creación de instaladores para Windows (`.exe`, `.msi`) y paquetes para Linux (`.AppImage`, `.deb`).

## 3. Características Clave (Features)

Para que la aplicación sea un clon funcional de SQLYog, deberá incluir:

1.  **Gestor de Conexiones**:
    - Guardar, editar y eliminar configuraciones de conexión (host, usuario, contraseña, puerto, base de datos).
    - Se puede usar `electron-store` para persistir esta configuración de forma local y segura.
2.  **Explorador de Objetos de BD**:
    - Una vista en árbol (tree view) que muestre:
        - Bases de datos/esquemas.
        - Tablas, vistas, procedimientos almacenados.
        - Columnas, índices y claves foráneas de cada tabla.
3.  **Editor de Consultas SQL**:
    - Interfaz con pestañas para múltiples consultas.
    - Resaltado de sintaxis SQL. Una librería como **Monaco Editor** (el motor de VS Code) es perfecta para esto.
    - Sugerencias y autocompletado de código (feature avanzada).
4.  **Visor de Resultados**:
    - Mostrar los resultados de las consultas en una tabla/cuadrícula (data grid).
    - Permitir ordenar, filtrar y exportar los resultados (a CSV, JSON, etc.).
    - Edición de datos directamente en la cuadrícula.

## 4. Fases de Desarrollo Sugeridas

### Fase 1: Estructura Base y Conexión

- **Tarea 1**: Configurar la estructura del proyecto con un framework de frontend (React/Vue).
- **Tarea 2**: Implementar la comunicación segura entre el proceso principal y el de renderizado usando `preload.js` y `contextBridge`.
- **Tarea 3**: Crear un formulario de conexión simple en la UI.
- **Tarea 4**: En el proceso principal, recibir los datos del formulario, usar `mysql2` para establecer una conexión y devolver el estado (éxito/error) a la UI.

### Fase 2: UI Principal y Explorador de BD

- **Tarea 1**: Diseñar el layout principal de la aplicación (ej. panel lateral para el explorador, área principal para el editor).
- **Tarea 2**: Implementar el explorador de objetos como un árbol. Al conectar, obtener la lista de bases de datos y tablas y mostrarlas.
- **Tarea 3**: Integrar un editor de texto (Monaco Editor) en el área principal.

### Fase 3: Ejecución de Consultas y Resultados

- **Tarea 1**: Enviar el texto del editor de SQL al proceso principal.
- **Tarea 2**: Ejecutar la consulta en la base de datos y gestionar posibles errores.
- **Tarea 3**: Devolver los resultados (filas y columnas) al proceso de renderizado.
- **Tarea 4**: Mostrar los resultados en una cuadrícula de datos interactiva. Librerías como **AG-Grid** o **TanStack Table** son excelentes para esto.

### Fase 4: Funcionalidades Avanzadas y Persistencia

- **Tarea 1**: Implementar el gestor de conexiones para guardar y cargar configuraciones.
- **Tarea 2**: Añadir la funcionalidad de ver la estructura de una tabla (columnas, tipos de datos) al hacer clic en ella en el explorador.
- **Tarea 3**: Permitir la exportación de resultados desde la cuadrícula de datos.

### Fase 5: Empaquetado y Distribución

- **Tarea 1**: Configurar `electron-builder` en `package.json`.
- **Tarea 2**: Definir los scripts para construir la aplicación para `win` y `linux`.
- **Tarea 3**: Generar los instaladores y probarlos en ambos sistemas operativos.

## 5. Consideraciones de Seguridad

- **NUNCA** manejes credenciales de base de datos ni ejecutes consultas directamente en el proceso de renderizado. Toda la lógica de base de datos debe residir en el proceso principal de Node.js.
- Utiliza siempre `contextIsolation: true` y `nodeIntegration: false` en las `webPreferences` de tu `BrowserWindow`.
- Expón solo las funciones necesarias desde el proceso principal al de renderizado a través del `contextBridge`.

Este documento te servirá de guía para retomar el proyecto en cualquier momento, sabiendo cuál es el siguiente paso y qué tecnologías utilizar. ¡Mucho éxito con el desarrollo!