const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'packages/api/.env.development' });

async function test() {
    try {
        console.log('Connecting to:', process.env.DB_HOST, 'port:', process.env.DB_PORT);
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'altamarm_contable'
        });
        console.log('✅ Auth successful');
        await connection.end();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        console.error('Full error:', err);
    }
}
test();
