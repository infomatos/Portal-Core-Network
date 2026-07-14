import dotenv from 'dotenv';
dotenv.config();

import pool from '../config/database';

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS forum_posts (
      id                    INT AUTO_INCREMENT PRIMARY KEY,
      title                 VARCHAR(255) NOT NULL,
      slug                  VARCHAR(255) NOT NULL UNIQUE,
      forum_date            DATE NOT NULL,
      participants          TEXT NOT NULL,
      main_topics           TEXT NOT NULL,
      content               LONGTEXT NOT NULL,
      action_items          LONGTEXT NOT NULL,
      author_id             INT DEFAULT NULL,
      status                ENUM('draft','published') NOT NULL DEFAULT 'draft',
      attachment_name       VARCHAR(255) DEFAULT NULL,
      attachment_url        VARCHAR(500) DEFAULT NULL,
      attachment_path       VARCHAR(500) DEFAULT NULL,
      attachment_mime       VARCHAR(160) DEFAULT NULL,
      attachment_size       INT DEFAULT NULL,
      published_at          DATETIME DEFAULT NULL,
      created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_forum_posts_author
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('Tabela forum_posts criada com sucesso.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
