const isElectron = !!window.db;
const API_URL = 'http://localhost:3000/api';

/**
 * Función genérica para emitir requests a la API web con fetch
 */
const fetchDb = async (endpoint, payload) => {
  const method = payload ? 'POST' : 'GET';
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (payload) {
    options.body = JSON.stringify(payload);
  }

  const res = await fetch(`${API_URL}/${endpoint}`, options);
  if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
  return await res.json();
};

const api = {
  testConnection: async (config) => {
    if (isElectron) return await window.db.testConnection(config);
    return await fetchDb('test-connection', config);
  },
  
  getConnections: async () => {
    if (isElectron) return await window.db.getConnections();
    return await fetchDb('get-connections');
  },
  
  saveConnection: async (connection) => {
    if (isElectron) return await window.db.saveConnection(connection);
    return await fetchDb('save-connection', connection);
  },
  
  deleteConnection: async (id) => {
    if (isElectron) return await window.db.deleteConnection(id);
    return await fetchDb('delete-connection', { id });
  },
  
  getDatabases: async (config) => {
    if (isElectron) return await window.db.getDatabases(config);
    return await fetchDb('get-databases', config);
  },
  
  getTables: async (config, database) => {
    if (isElectron) return await window.db.getTables(config, database);
    return await fetchDb('get-tables', { config, database });
  },
  
  getTableColumns: async (config, database, table) => {
    if (isElectron) return await window.db.getTableColumns(config, database, table);
    return await fetchDb('get-table-columns', { config, database, table });
  },
  
  getTableIndexes: async (config, database, table) => {
    if (isElectron) return await window.db.getTableIndexes(config, database, table);
    return await fetchDb('get-table-indexes', { config, database, table });
  },
  
  getViews: async (config, database) => {
    if (isElectron) return await window.db.getViews(config, database);
    return await fetchDb('get-views', { config, database });
  },
  
  getProcedures: async (config, database) => {
    if (isElectron) return await window.db.getProcedures(config, database);
    return await fetchDb('get-procedures', { config, database });
  },
  
  getFunctions: async (config, database) => {
    if (isElectron) return await window.db.getFunctions(config, database);
    return await fetchDb('get-functions', { config, database });
  },
  
  getTriggers: async (config, database) => {
    if (isElectron) return await window.db.getTriggers(config, database);
    return await fetchDb('get-triggers', { config, database });
  },
  
  getEvents: async (config, database) => {
    if (isElectron) return await window.db.getEvents(config, database);
    return await fetchDb('get-events', { config, database });
  },
  
  executeQuery: async ({ config, sql }) => {
    if (isElectron) return await window.db.executeQuery({ config, sql });
    return await fetchDb('execute-query', { config, sql });
  }
};

export default api;
