import dotenv from 'dotenv';
dotenv.config();

import pool from '../config/database';

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS newsletters (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      title      VARCHAR(255) NOT NULL,
      body       LONGTEXT NOT NULL,
      design     LONGTEXT DEFAULT NULL,
      status     ENUM('draft','sent') DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      sent_at    DATETIME DEFAULT NULL
    )
  `);
  console.log('Tabela newsletters criada com sucesso.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
