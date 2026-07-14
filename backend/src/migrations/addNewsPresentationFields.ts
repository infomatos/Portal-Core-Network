import dotenv from 'dotenv';
dotenv.config();

import pool from '../config/database';

async function run() {
  const statements = [
    "ALTER TABLE news ADD COLUMN content_type ENUM('article','presentation') NOT NULL DEFAULT 'article' AFTER body",
    "ALTER TABLE news ADD COLUMN pdf_url VARCHAR(500) DEFAULT NULL AFTER content_type",
    "ALTER TABLE news ADD COLUMN pdf_name VARCHAR(255) DEFAULT NULL AFTER pdf_url",
    "ALTER TABLE news ADD COLUMN pdf_size INT DEFAULT NULL AFTER pdf_name",
  ];

  for (const sql of statements) {
    try {
      await pool.query(sql);
    } catch (error: any) {
      if (error?.code !== 'ER_DUP_FIELDNAME') throw error;
    }
  }

  console.log('Campos de apresentacao da news atualizados com sucesso.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
