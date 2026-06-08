"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCompromissos = getAllCompromissos;
exports.saveCompromissos = saveCompromissos;
exports.removeCompromissos = removeCompromissos;
const database_1 = __importDefault(require("../config/database"));
async function getAllCompromissos() {
    const [rows] = await database_1.default.query('SELECT id, label, rows_data, uploaded_at FROM compromissos_uploads ORDER BY uploaded_at DESC');
    return rows;
}
async function saveCompromissos(label, rows, userId) {
    await database_1.default.query('INSERT INTO compromissos_uploads (label, rows_data, uploaded_by) VALUES (?, ?, ?)', [label, JSON.stringify(rows), userId]);
}
async function removeCompromissos(id) {
    await database_1.default.query('DELETE FROM compromissos_uploads WHERE id = ?', [id]);
}
