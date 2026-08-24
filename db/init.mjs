// Applies schema.sql against DB_HOST/DB_NAME from the environment.
// Usage: npm run db:init  (reads .env via --env-file)
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
});

const sql = await readFile(path.join(__dirname, 'schema.sql'), 'utf8');
await connection.query(sql);
console.log('Schema applied.');
await connection.end();
