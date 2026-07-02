const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'RP738964$',
    database: 'c270',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;