import pool from '../config/database';

async function run() {
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS status ENUM('pending', 'active', 'rejected') NOT NULL DEFAULT 'active'
  `);
  console.log('Coluna status adicionada à tabela users.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
