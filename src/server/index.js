const express = require('express');
const cors = require('cors');
const { testConnection, getDatabases, executeQuery, getTables } = require('../main/db');

const app = express();
const PORT = 3000;

app.use(cors()); // Permitir peticiones desde localhost:5173
app.use(express.json());

// Simulamos una latencia irreal de guardado como en electron-store (en memoria para dev web)
let mockStoreConfig = { host: 'localhost', user: 'root', password: '', port: 3306 };

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

app.post('/api/execute-query', async (req, res) => {
  try {
    const { config, sql } = req.body;
    const result = await executeQuery(config, sql);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Endpoints mockeados de electron-store
app.post('/api/save-config', (req, res) => {
  mockStoreConfig = req.body;
  res.json({ success: true });
});

app.get('/api/get-config', (req, res) => {
  res.json(mockStoreConfig);
});

app.listen(PORT, () => {
  console.log(`💻 [WEB-MOCK] Local API Server running on http://localhost:${PORT}`);
});
