"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enfileirar = enfileirar;
exports.buscarPendentes = buscarPendentes;
exports.marcarEnviado = marcarEnviado;
exports.marcarFalha = marcarFalha;
const database_1 = __importDefault(require("../config/database"));
async function enfileirar(to_email, subject, body, cc_email) {
    await database_1.default.query('INSERT INTO email_queue (to_email, cc_email, subject, body) VALUES (?, ?, ?, ?)', [to_email, cc_email ?? null, subject, body]);
}
async function buscarPendentes() {
    const [rows] = await database_1.default.query("SELECT id, to_email, cc_email, subject, body FROM email_queue WHERE status = 'pending' ORDER BY created_at ASC");
    return rows;
}
async function marcarEnviado(id) {
    await database_1.default.query("UPDATE email_queue SET status = 'sent', processed_at = NOW() WHERE id = ?", [id]);
}
async function marcarFalha(id) {
    await database_1.default.query("UPDATE email_queue SET status = 'failed', processed_at = NOW() WHERE id = ?", [id]);
}
