require('dotenv').config();
const fs = require('fs');
const mysql = require('mysql2/promise');

async function runSeed() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });

        const sql = fs.readFileSync(__dirname + '/seed.sql', 'utf8');

        await connection.query(sql);

        console.log('Seed data inserted successfully.');

        await connection.end();
    } catch (error) {
        console.error('Seed execution failed:', error.message);
        process.exit(1);
    }
}

runSeed();