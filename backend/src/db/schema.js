require('dotenv').config();
const fs = require('fs');
const mysql = require('mysql2/promise');

async function runSchema() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });

        const sql = fs.readFileSync(__dirname + '/schema.sql', 'utf8');

        await connection.query(sql);

        console.log('Database schema executed successfully.');

        await connection.end();
    } catch (error) {
        console.error('Schema execution failed:', error.message);
        process.exit(1);
    }
}

runSchema();