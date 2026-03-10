const mysql = require('mysql2/promise');

async function testConnection(config) {
  let connection;
  try {
    // Intentamos establecer conexión con los parámetros recibidos
    connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      port: parseInt(config.port) || 3306,
      database: config.database || undefined // Opcional si solo queremos probar conexión al servidor
    });

    await connection.ping(); // Verificamos que el servidor responda
    return { success: true, message: '¡Conexión exitosa a MySQL/MariaDB!' };
  } catch (error) {
    return { success: false, message: error.message };
  } finally {
    if (connection) await connection.end(); // Cerramos la conexión de prueba
  }
}

async function getDatabases(config) {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      port: parseInt(config.port) || 3306
    });
    const [rows] = await connection.execute('SHOW DATABASES');
    return rows.map(row => row.Database);
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

async function executeQuery(config, sql) {
  let connection;
  try {
    connection = await mysql.createConnection({
      ...config,
      port: parseInt(config.port) || 3306,
      multipleStatements: true // Necesario para sentencias como `USE database;`
    });

    const [results, fields] = await connection.query(sql);

    // Si hay múltiples resultados (ej: USE db; SELECT ...), nos quedamos con el último.
    const finalResult = Array.isArray(results) ? results[results.length - 1] : results;
    const finalFields = Array.isArray(fields) ? fields[fields.length - 1] : fields;

    return {
      success: true,
      data: {
        rows: finalResult,
        // Asegurarnos de que `finalFields` es un array antes de mapearlo
        fields: finalFields && Array.isArray(finalFields) ? finalFields.map(f => f.name) : []
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    if (connection) await connection.end();
  }
}

module.exports = { testConnection, getDatabases, executeQuery };