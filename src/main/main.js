const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { testConnection, getDatabases, executeQuery } = require('./db')
const Store = require('electron-store')

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

  // Ejecutar una consulta SQL (Fase 3)
  ipcMain.handle('db:execute-query', async (event, { config, sql }) => {
    return await executeQuery(config, sql);
  });

  // Guardar configuración
  ipcMain.handle('db:save-config', async (event, config) => {
    store.set('dbConfig', config);
    return true;
  });

  // Obtener configuración guardada
  ipcMain.handle('db:get-config', async () => {
    // Devolvemos la config guardada o un valor por defecto
    return store.get('dbConfig', { host: 'localhost', user: 'root', password: '', port: 3306 });
  });

  createWindow();
})

// Cerrar cuando todas las ventanas se cierren (Windows y Linux)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
