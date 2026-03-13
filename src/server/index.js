const express = require('express');
const cors = require('cors');
const { testConnection, getDatabases, executeQuery, getTables, getViews, getProcedures, getFunctions, getTriggers, getEvents, getTableColumns, getTableIndexes } = require('../main/db');

const app = express();
const PORT = 3000;

app.use(cors()); // Permitir peticiones desde localhost:5173
app.use(express.json());

// Simulamos una latencia irreal de guardado como en electron-store (en memoria para dev web)
let mockConnections = [{ id: '1', host: 'localhost', user: 'root', password: '', port: 3306 }];

app.post('/api/test-connection', async (req, res) => {
  try {
    const result = await testConnection(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/get-databases', async (req, res) => {
  try {
    const dbs = await getDatabases(req.body);
    res.json(dbs);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/get-tables', async (req, res) => {
  try {
    const { config, database } = req.body;
    const tables = await getTables(config, database);
    res.json(tables);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/get-table-columns', async (req, res) => {
  try {
    const { config, database, table } = req.body;
    res.json(await getTableColumns(config, database, table));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/get-table-indexes', async (req, res) => {
  try {
    const { config, database, table } = req.body;
    res.json(await getTableIndexes(config, database, table));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/get-views', async (req, res) => {
  try {
    const { config, database } = req.body;
    res.json(await getViews(config, database));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/get-procedures', async (req, res) => {
  try {
    const { config, database } = req.body;
    res.json(await getProcedures(config, database));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/get-functions', async (req, res) => {
  try {
    const { config, database } = req.body;
    res.json(await getFunctions(config, database));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/get-triggers', async (req, res) => {
  try {
    const { config, database } = req.body;
    res.json(await getTriggers(config, database));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/get-events', async (req, res) => {
  try {
    const { config, database } = req.body;
    res.json(await getEvents(config, database));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/execute-query', async (req, res) => {
  try {
    const { config, sql } = req.body;
    const result = await executeQuery(config, sql);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Endpoints mockeados de electron-store para conexiones
app.get('/api/get-connections', (req, res) => {
  res.json(mockConnections);
});

app.post('/api/save-connection', (req, res) => {
  const connection = req.body;
  if (connection.id) {
    const index = mockConnections.findIndex(c => c.id === connection.id);
    if (index !== -1) mockConnections[index] = { ...mockConnections[index], ...connection };
  } else {
    connection.id = String(Date.now());
    mockConnections.push(connection);
  }
  res.json(connection);
});

app.post('/api/delete-connection', (req, res) => {
  const { id } = req.body;
  mockConnections = mockConnections.filter(c => c.id !== id);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`💻 [WEB-MOCK] Local API Server running on http://localhost:${PORT}`);
});
