import dotenv from 'dotenv';
dotenv.config();

import pool from '../config/database';

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS email_queue (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      to_email     VARCHAR(255) NOT NULL,
      cc_email     VARCHAR(255) DEFAULT NULL,
      subject      VARCHAR(255) NOT NULL,
      body         LONGTEXT     NOT NULL,
      status       ENUM('pending','sent','failed') DEFAULT 'pending',
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      processed_at DATETIME DEFAULT NULL
    )
  `);
  console.log('Tabela email_queue criada com sucesso.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
