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

module.exports = { testConnection, getDatabases };