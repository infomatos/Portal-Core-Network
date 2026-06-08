"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
async function run() {
    await database_1.default.query(`
    CREATE TABLE IF NOT EXISTS access_logs (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      user_id     INT NULL,
      type        ENUM('login', 'visita') NOT NULL DEFAULT 'visita',
      path        VARCHAR(255) NULL,
      accessed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
    console.log('Tabela access_logs criada.');
    process.exit(0);
}
run().catch(err => { console.error('[access_logs] create table:', err); process.exit(1); });
