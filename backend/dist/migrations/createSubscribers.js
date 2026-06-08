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
