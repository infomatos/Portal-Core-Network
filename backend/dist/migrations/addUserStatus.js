"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
async function run() {
    await database_1.default.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS status ENUM('pending', 'active', 'rejected') NOT NULL DEFAULT 'active'
  `);
    console.log('Coluna status adicionada à tabela users.');
    process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
