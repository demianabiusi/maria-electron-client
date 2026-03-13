const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { testConnection, getDatabases, executeQuery, getTables, getViews, getProcedures, getFunctions, getTriggers, getEvents, getTableColumns, getTableIndexes } = require('./db')
const Store = require('electron-store')
const crypto = require('crypto')

const store = new Store()

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // Es más seguro mantenerlo en false
      contextIsolation: true // Es más seguro mantenerlo en true
    }
  })

  // En desarrollo (si no está empaquetada), cargamos desde el servidor de Vite
  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools() // Opcional: abrir herramientas de desarrollo
  } else {
    // En producción, cargamos el archivo construido en dist
    win.loadFile(path.join(__dirname, '../../dist/renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // Manejador para la prueba de conexión
  ipcMain.handle('db:test-connection', async (event, config) => {
    return await testConnection(config);
  });

  // Obtener lista de bases de datos (Fase 2: Explorador de Objetos)
  ipcMain.handle('db:get-databases', async (event, config) => {
    return await getDatabases(config);
  });

  // Obtener tablas de una base de datos
  ipcMain.handle('db:get-tables', async (event, { config, database }) => {
    return await getTables(config, database);
  });

  // Obtener columnas de una tabla
  ipcMain.handle('db:get-table-columns', async (event, { config, database, table }) => {
    return await getTableColumns(config, database, table);
  });

  // Obtener índices de una tabla
  ipcMain.handle('db:get-table-indexes', async (event, { config, database, table }) => {
    return await getTableIndexes(config, database, table);
  });

  // Obtener vistas de una base de datos
  ipcMain.handle('db:get-views', async (event, { config, database }) => {
    return await getViews(config, database);
  });

  // Obtener procedimientos almacenados de una base de datos
  ipcMain.handle('db:get-procedures', async (event, { config, database }) => {
    return await getProcedures(config, database);
  });

  // Obtener funciones de una base de datos
  ipcMain.handle('db:get-functions', async (event, { config, database }) => {
    return await getFunctions(config, database);
  });

  // Obtener triggers de una base de datos
  ipcMain.handle('db:get-triggers', async (event, { config, database }) => {
    return await getTriggers(config, database);
  });

  // Obtener eventos de una base de datos
  ipcMain.handle('db:get-events', async (event, { config, database }) => {
    return await getEvents(config, database);
  });

  // Ejecutar una consulta SQL (Fase 3)
  ipcMain.handle('db:execute-query', async (event, { config, sql }) => {
    return await executeQuery(config, sql);
  });

  // --- Gestión de Conexiones (ABM) ---

  // Obtener todas las conexiones guardadas
  ipcMain.handle('db:get-connections', async () => {
    return store.get('savedConnections', []);
  });

  // Guardar (Crear/Editar) una conexión
  ipcMain.handle('db:save-connection', async (event, connection) => {
    const connections = store.get('savedConnections', []);
    
    if (connection.id) {
      // Editar existente
      const index = connections.findIndex(c => c.id === connection.id);
      if (index !== -1) {
        connections[index] = { ...connections[index], ...connection };
      }
    } else {
      // Crear nueva
      connection.id = crypto.randomUUID();
      connections.push(connection);
    }
    store.set('savedConnections', connections);
    return connection;
  });

  // Eliminar una conexión
  ipcMain.handle('db:delete-connection', async (event, id) => {
    const connections = store.get('savedConnections', []);
    const newConnections = connections.filter(c => c.id !== id);
    store.set('savedConnections', newConnections);
    return true;
  });

  createWindow();
})

// Cerrar cuando todas las ventanas se cierren (Windows y Linux)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
