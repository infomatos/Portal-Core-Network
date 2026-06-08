"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function migrate() {
    await database_1.default.query(`
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
