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
  
  saveConfig: async (config) => {
    if (isElectron) return await window.db.saveConfig(config);
    return await fetchDb('save-config', config);
  },
  
  getConfig: async () => {
    if (isElectron) return await window.db.getConfig();
    return await fetchDb('get-config');
  },
  
  getDatabases: async (config) => {
    if (isElectron) return await window.db.getDatabases(config);
    return await fetchDb('get-databases', config);
  },
  
  getTables: async (config, database) => {
    if (isElectron) return await window.db.getTables(config, database);
    return await fetchDb('get-tables', { config, database });
  },
  
  executeQuery: async ({ config, sql }) => {
    if (isElectron) return await window.db.executeQuery({ config, sql });
    return await fetchDb('execute-query', { config, sql });
  }
};

export default api;
