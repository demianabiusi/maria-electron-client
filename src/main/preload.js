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
  getConnections: () => ipcRenderer.invoke('db:get-connections'),
  saveConnection: (connection) => ipcRenderer.invoke('db:save-connection', connection),
  deleteConnection: (id) => ipcRenderer.invoke('db:delete-connection', id),
  getDatabases: (config) => ipcRenderer.invoke('db:get-databases', config),
  getTables: (config, database) => ipcRenderer.invoke('db:get-tables', { config, database }),
  getTableColumns: (config, database, table) => ipcRenderer.invoke('db:get-table-columns', { config, database, table }),
  getTableIndexes: (config, database, table) => ipcRenderer.invoke('db:get-table-indexes', { config, database, table }),
  getViews: (config, database) => ipcRenderer.invoke('db:get-views', { config, database }),
  getProcedures: (config, database) => ipcRenderer.invoke('db:get-procedures', { config, database }),
  getFunctions: (config, database) => ipcRenderer.invoke('db:get-functions', { config, database }),
  getTriggers: (config, database) => ipcRenderer.invoke('db:get-triggers', { config, database }),
  getEvents: (config, database) => ipcRenderer.invoke('db:get-events', { config, database }),
  executeQuery: ({ config, sql }) => ipcRenderer.invoke('db:execute-query', { config, sql })
})
