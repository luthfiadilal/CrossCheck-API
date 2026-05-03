const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    const connection = await mysql.createConnection({
      host: '154.19.37.71',
      user: 'admin',
      password: 'an1357@$',
      database: 'crosscheckdb',
      port: 3306,
      connectTimeout: 10000
    });
    console.log('✅ Connected successfully!');
    await connection.end();
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

testConnection();
