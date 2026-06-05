import dotenv from 'dotenv';
dotenv.config();

import pool from '../config/database';

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(255) NOT NULL,
      email      VARCHAR(255) NOT NULL UNIQUE,
      status     ENUM('active','inactive') DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Tabela subscribers criada com sucesso.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
