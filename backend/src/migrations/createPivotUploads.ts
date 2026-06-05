import pool from '../config/database';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pivot_uploads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      year INT NOT NULL,
      label VARCHAR(100) NOT NULL,
      rows_data LONGTEXT NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      uploaded_by INT,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    )
  `);
  console.log('✓ pivot_uploads criada');
  process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });
