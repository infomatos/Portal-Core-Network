"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.acharUserPorMatricula = acharUserPorMatricula;
exports.acharUserPorEmail = acharUserPorEmail;
exports.criarUser = criarUser;
exports.salvarResetToken = salvarResetToken;
exports.acharUserPorResetToken = acharUserPorResetToken;
exports.registrarAcesso = registrarAcesso;
exports.registrarVisita = registrarVisita;
exports.totalAcessos = totalAcessos;
exports.paginaMaisAcessada = paginaMaisAcessada;
exports.atualizarNome = atualizarNome;
exports.emailsAdmins = emailsAdmins;
exports.listarUsers = listarUsers;
exports.listarPendentes = listarPendentes;
exports.aprovarUser = aprovarUser;
exports.recusarUser = recusarUser;
exports.atualizarRole = atualizarRole;
exports.removerUser = removerUser;
exports.atualizarSenha = atualizarSenha;
const database_1 = __importDefault(require("../config/database"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function acharUserPorMatricula(matricula) {
    const [rows] = await database_1.default.query('SELECT * FROM users WHERE UPPER(matricula) = UPPER(?)', [matricula]);
    return rows[0] || null;
}
async function acharUserPorEmail(email) {
    const [rows] = await database_1.default.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
}
async function criarUser(user) {
    const hashedPassword = await bcryptjs_1.default.hash(user.password, 10);
    await database_1.default.query('INSERT INTO users (name, matricula, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)', [user.name, user.matricula.toUpperCase(), user.email, hashedPassword, user.role, 'pending']);
}
async function salvarResetToken(userId, token, expires) {
    await database_1.default.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?', [token, expires, userId]);
}
async function acharUserPorResetToken(token) {
    const [rows] = await database_1.default.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);
    return rows[0] || null;
}
async function registrarAcesso(userId) {
    await database_1.default.query('INSERT INTO access_logs (user_id, type) VALUES (?, ?)', [userId, 'login']);
}
async function registrarVisita(path) {
    await database_1.default.query('INSERT INTO access_logs (user_id, type, path) VALUES (NULL, ?, ?)', ['visita', path]);
}
async function totalAcessos() {
    const [rows] = await database_1.default.query('SELECT type, COUNT(*) AS total FROM access_logs GROUP BY type');
    const result = { logins: 0, visitas: 0 };
    for (const row of rows) {
        if (row.type === 'login')
            result.logins = row.total;
        if (row.type === 'visita')
            result.visitas = row.total;
    }
    return result;
}
async function paginaMaisAcessada() {
    const [rows] = await database_1.default.query(`SELECT path, COUNT(*) AS total
         FROM access_logs
         WHERE path IS NOT NULL AND path != ''
         GROUP BY path
         ORDER BY total DESC
         LIMIT 1`);
    return rows[0] ? { path: rows[0].path, total: rows[0].total } : null;
}
async function atualizarNome(id, name) {
    await database_1.default.query('UPDATE users SET name = ? WHERE id = ?', [name, id]);
}
async function emailsAdmins() {
    const [rows] = await database_1.default.query("SELECT email FROM users WHERE role = 'admin'");
    return rows.map((r) => r.email);
}
async function listarUsers() {
    const [rows] = await database_1.default.query('SELECT id, name, matricula, email, role, status, created_at FROM users ORDER BY created_at DESC');
    return rows;
}
async function listarPendentes() {
    const [rows] = await database_1.default.query("SELECT id, name, matricula, email, created_at FROM users WHERE status = 'pending' ORDER BY created_at ASC");
    return rows;
}
async function aprovarUser(id) {
    await database_1.default.query("UPDATE users SET status = 'active' WHERE id = ?", [id]);
}
async function recusarUser(id) {
    await database_1.default.query("UPDATE users SET status = 'rejected' WHERE id = ?", [id]);
}
async function atualizarRole(id, role) {
    await database_1.default.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
}
async function removerUser(id) {
    await database_1.default.query('DELETE FROM users WHERE id = ?', [id]);
}
async function atualizarSenha(userId, newPassword) {
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
    await database_1.default.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [hashedPassword, userId]);
}
