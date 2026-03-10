# Maria Electron Client (Clon de SQLYog)

Este proyecto es una aplicación de escritorio multiplataforma (Windows y Linux) diseñada para administrar bases de datos **MySQL y MariaDB**. Inspirado en la funcionalidad de SQLYog, está construido utilizando tecnologías web modernas sobre **Electron**.

## 🎯 Objetivo

Crear un cliente SQL ligero, rápido y seguro que permita conectar, explorar esquemas y ejecutar consultas de manera eficiente en sistemas operativos donde SQLYog no está disponible nativamente (como Linux) o como una alternativa moderna en Windows.

## 🛠 Tecnologías Principales

*   **Core**: [Electron](https://www.electronjs.org/)
*   **Frontend**: [React](https://react.dev/) (vía Vite)
*   **Backend (Main Process)**: Node.js
*   **Driver de Base de Datos**: `mysql2` (Estándar, rápido y con soporte de promesas)
*   **Almacenamiento Local**: `electron-store`
*   **Distribución**: `electron-builder`

## 🚀 Características Clave

El objetivo final es alcanzar la paridad funcional con herramientas profesionales, incluyendo:

1.  **Gestor de Conexiones**:
    *   Guardar, editar y eliminar configuraciones de conexión.
    *   Persistencia local y segura de datos.

2.  **Explorador de Objetos**:
    *   Vista de árbol para navegar por esquemas, tablas, vistas y procedimientos.
    *   Inspección de columnas, índices y claves foráneas.

3.  **Editor SQL Avanzado**:
    *   Soporte para múltiples pestañas.
    *   Resaltado de sintaxis (integración con Monaco Editor).
    *   Autocompletado y sugerencias.

4.  **Visor de Resultados**:
    *   Grilla de datos interactiva para visualizar filas y columnas.
    *   Funcionalidades de ordenamiento, filtrado y exportación (CSV, JSON).

## 📅 Hoja de Ruta (Roadmap)

El desarrollo está estructurado en las siguientes fases:

*   **Fase 1: Estructura Base y Conexión**
    *   Configuración de Electron + React.
    *   Comunicación segura (`contextBridge`).
    *   Pruebas de conexión con `mysql2`.
*   **Fase 2: UI Principal y Explorador**
    *   Diseño del Layout principal.
    *   Obtención y listado de bases de datos.
*   **Fase 3: Ejecución de Consultas**
    *   Integración del editor SQL.
    *   Ejecución de queries y manejo de resultados.
*   **Fase 4: Funcionalidades Avanzadas**
    *   Mejoras en el gestor de conexiones y persistencia.
    *   Introspección de tablas.
*   **Fase 5: Empaquetado y Distribución**
    *   Generación de instaladores para Windows (`.exe`, `.msi`) y Linux (`.AppImage`, `.deb`).

## 🔒 Seguridad

El proyecto sigue las mejores prácticas de seguridad, manteniendo `nodeIntegration: false` y `contextIsolation: true`, asegurando que toda la lógica de base de datos se ejecute exclusivamente en el proceso principal de Node.js.
