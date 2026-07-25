const mysql = require('mysql2/promise');
require('dotenv').config(); // loads variables from a local .env file, if one exists

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;



//RP738964$