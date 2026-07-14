import dotenv from 'dotenv';
dotenv.config();

import pool from '../config/database';

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS news (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      title        VARCHAR(255)  NOT NULL,
      slug         VARCHAR(255)  NOT NULL UNIQUE,
      excerpt      TEXT,
      body         LONGTEXT,
      content_type ENUM('article','presentation') NOT NULL DEFAULT 'article',
      pdf_url      VARCHAR(500) DEFAULT NULL,
      pdf_name     VARCHAR(255) DEFAULT NULL,
      pdf_size     INT DEFAULT NULL,
      cover_image  VARCHAR(500),
      category     ENUM('NFVi','Database','Packet Core','Voice & Signalling') NOT NULL,
      author_id    INT DEFAULT NULL,
      status       ENUM('draft','published') NOT NULL DEFAULT 'draft',
      featured     TINYINT(1)    NOT NULL DEFAULT 0,
      views        INT           NOT NULL DEFAULT 0,
      read_time    INT           NOT NULL DEFAULT 1,
      published_at DATETIME      DEFAULT NULL,
      created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_news_author
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✓ Tabela news criada com sucesso.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
