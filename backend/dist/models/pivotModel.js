"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUploads = getAllUploads;
exports.saveUpload = saveUpload;
exports.removeUpload = removeUpload;
const database_1 = __importDefault(require("../config/database"));
async function getAllUploads() {
    const [rows] = await database_1.default.query('SELECT id, year, label, rows_data, uploaded_at FROM pivot_uploads ORDER BY year DESC, uploaded_at ASC');
    return rows;
}
async function saveUpload(year, label, rows, ctdSummary, userId) {
    await database_1.default.query('INSERT INTO pivot_uploads (year, label, rows_data, uploaded_by) VALUES (?, ?, ?, ?)', [year, label, JSON.stringify({ rows, ctd_summary: ctdSummary }), userId]);
}
async function removeUpload(id) {
    await database_1.default.query('DELETE FROM pivot_uploads WHERE id = ?', [id]);
}
