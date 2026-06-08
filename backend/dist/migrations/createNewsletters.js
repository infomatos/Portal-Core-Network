"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const database_1 = __importDefault(require("../config/database"));
async function run() {
    await database_1.default.query(`
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
