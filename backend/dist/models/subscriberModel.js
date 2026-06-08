"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarSubscribers = listarSubscribers;
exports.listarAtivos = listarAtivos;
exports.adicionarSubscriber = adicionarSubscriber;
exports.alterarStatus = alterarStatus;
exports.deletarSubscriber = deletarSubscriber;
const database_1 = __importDefault(require("../config/database"));
async function listarSubscribers() {
    const [rows] = await database_1.default.query('SELECT id, name, email, status, created_at FROM subscribers ORDER BY created_at DESC');
    return rows;
}
async function listarAtivos() {
    const [rows] = await database_1.default.query("SELECT id, name, email FROM subscribers WHERE status = 'active' ORDER BY name ASC");
    return rows;
}
async function adicionarSubscriber(name, email) {
    await database_1.default.query('INSERT INTO subscribers (name, email) VALUES (?, ?)', [name, email]);
}
async function alterarStatus(id, status) {
    await database_1.default.query('UPDATE subscribers SET status = ? WHERE id = ?', [status, id]);
}
async function deletarSubscriber(id) {
    await database_1.default.query('DELETE FROM subscribers WHERE id = ?', [id]);
}
