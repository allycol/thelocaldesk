// Applies schema.sql (CREATE TABLE IF NOT EXISTS, safe to re-run) against
// DB_* from the environment. Used by server.js on every boot, since managed
// DB instances (e.g. GoDaddy's) are typically not reachable to run a
// one-off local migration script against.
const fs = require('node:fs/promises');
const path = require('node:path');
const mysql = require('mysql2/promise');

async function applySchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  try {
    const sql = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
    await connection.query(sql);
  } finally {
    await connection.end();
  }
}

module.exports = { applySchema };
