const mysql = require('mysql2/promise');
require('dotenv').config(); // loads variables from a local .env file, if one exists

const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
};

// Cloud databases (like TiDB) need a secure connection. A local MySQL does not.
const isLocal = !config.host || config.host === 'localhost' || config.host === '127.0.0.1';
if (!isLocal) {
    config.ssl = { minVersion: 'TLSv1.2', rejectUnauthorized: true };
}

const pool = mysql.createPool(config);

module.exports = pool;
