const { contextBridge, ipcRenderer } = require('electron')

// Expone de forma segura las versiones de node, chrome y electron al proceso de renderizado.
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  // también podríamos exponer funciones relacionadas con ipcRenderer aquí
})

// API específica para base de datos
contextBridge.exposeInMainWorld('db', {
  testConnection: (config) => ipcRenderer.invoke('db:test-connection', config),
  saveConfig: (config) => ipcRenderer.invoke('db:save-config', config),
  getConfig: () => ipcRenderer.invoke('db:get-config'),
  getDatabases: (config) => ipcRenderer.invoke('db:get-databases', config),
  getTables: (config, database) => ipcRenderer.invoke('db:get-tables', { config, database }),
  executeQuery: ({ config, sql }) => ipcRenderer.invoke('db:execute-query', { config, sql })
})
