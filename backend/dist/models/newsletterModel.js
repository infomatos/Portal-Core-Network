"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarNewsletters = listarNewsletters;
exports.buscarNewsletter = buscarNewsletter;
exports.criarNewsletter = criarNewsletter;
exports.atualizarNewsletter = atualizarNewsletter;
exports.marcarEnviada = marcarEnviada;
exports.deletarNewsletter = deletarNewsletter;
exports.duplicarNewsletter = duplicarNewsletter;
const database_1 = __importDefault(require("../config/database"));
async function listarNewsletters() {
    const [rows] = await database_1.default.query('SELECT id, title, status, created_at, sent_at FROM newsletters ORDER BY created_at DESC');
    return rows;
}
async function buscarNewsletter(id) {
    const [rows] = await database_1.default.query('SELECT id, title, body, design, status, created_at, sent_at FROM newsletters WHERE id = ?', [id]);
    const list = rows;
    return list[0] ?? null;
}
async function criarNewsletter(title, body, design) {
    const [result] = await database_1.default.query("INSERT INTO newsletters (title, body, design, status) VALUES (?, ?, ?, 'draft')", [title, body, design]);
    return result.insertId;
}
async function atualizarNewsletter(id, title, body, design) {
    await database_1.default.query('UPDATE newsletters SET title = ?, body = ?, design = ? WHERE id = ? AND status = ?', [title, body, design, id, 'draft']);
}
async function marcarEnviada(id) {
    await database_1.default.query("UPDATE newsletters SET status = 'sent', sent_at = NOW() WHERE id = ?", [id]);
}
async function deletarNewsletter(id) {
    await database_1.default.query("DELETE FROM newsletters WHERE id = ? AND status = 'draft'", [id]);
}
async function duplicarNewsletter(id) {
    const original = await buscarNewsletter(id);
    if (!original)
        throw new Error('Newsletter não encontrada');
    const [result] = await database_1.default.query("INSERT INTO newsletters (title, body, design, status) VALUES (?, ?, ?, 'draft')", [`${original.title} (cópia)`, original.body, original.design]);
    return result.insertId;
}
