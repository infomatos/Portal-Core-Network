import pool from "../config/database";
import bcrypt from "bcryptjs";

export interface User {
    id?: number;
    name: string;
    matricula: string;
    email: string;
    password: string;
    role: 'admin' | 'user' | 'editor' | 'moderador';
    status?: 'pending' | 'active' | 'rejected';
    created_at?: Date;
}

export async function acharUserPorMatricula(matricula: string): Promise<User | null> {
    const [rows]: any = await pool.query('SELECT * FROM users WHERE UPPER(matricula) = UPPER(?)', [matricula]);
    return rows[0] || null;
}
    
export async function acharUserPorEmail(email: string): Promise<User | null> {
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
}

export async function criarUser(user: Omit<User, 'id' | 'created_at'>): Promise<void> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await pool.query(
        'INSERT INTO users (name, matricula, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)',
        [user.name, user.matricula.toUpperCase(), user.email, hashedPassword, user.role, 'pending']);
}

export async function salvarResetToken(userId: number, token: string, expires: Date): Promise<void> {
    await pool.query(
        'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
        [token, expires, userId]
    );
}

export async function acharUserPorResetToken(token: string): Promise<User | null> {
    const [rows]: any = await pool.query(
        'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
        [token]
    );
    return rows[0] || null;
}

export async function registrarAcesso(userId: number): Promise<void> {
    await pool.query('INSERT INTO access_logs (user_id, type) VALUES (?, ?)', [userId, 'login']);
}

export async function registrarVisita(path: string): Promise<void> {
    await pool.query('INSERT INTO access_logs (user_id, type, path) VALUES (NULL, ?, ?)', ['visita', path]);
}

export async function totalAcessos(): Promise<{ logins: number; visitas: number }> {
    const [rows]: any = await pool.query(
        'SELECT type, COUNT(*) AS total FROM access_logs GROUP BY type'
    );
    const result = { logins: 0, visitas: 0 };
    for (const row of rows) {
        if (row.type === 'login')  result.logins  = row.total;
        if (row.type === 'visita') result.visitas = row.total;
    }
    return result;
}

export async function paginaMaisAcessada(): Promise<{ path: string; total: number } | null> {
    const [rows]: any = await pool.query(
        `SELECT path, COUNT(*) AS total
         FROM access_logs
         WHERE path IS NOT NULL AND path != ''
         GROUP BY path
         ORDER BY total DESC
         LIMIT 1`
    );
    return rows[0] ? { path: rows[0].path, total: rows[0].total } : null;
}

export async function atualizarNome(id: number, name: string): Promise<void> {
    await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, id]);
}

export async function emailsAdmins(): Promise<string[]> {
    const [rows]: any = await pool.query("SELECT email FROM users WHERE role = 'admin'");
    return rows.map((r: any) => r.email);
}

export async function listarUsers() {
    const [rows]: any = await pool.query(
        'SELECT id, name, matricula, email, role, status, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
}

export async function contarUsers(): Promise<{ total: number; active: number; pending: number; rejected: number }> {
    const [rows]: any = await pool.query(
        'SELECT status, COUNT(*) AS total FROM users GROUP BY status'
    );
    const result = { total: 0, active: 0, pending: 0, rejected: 0 };
    for (const row of rows) {
        const count = Number(row.total) || 0;
        result.total += count;
        if (row.status === 'active') result.active = count;
        if (row.status === 'pending') result.pending = count;
        if (row.status === 'rejected') result.rejected = count;
    }
    return result;
}

export async function listarPendentes() {
    const [rows]: any = await pool.query(
        "SELECT id, name, matricula, email, created_at FROM users WHERE status = 'pending' ORDER BY created_at ASC"
    );
    return rows;
}

export async function aprovarUser(id: number): Promise<void> {
    await pool.query("UPDATE users SET status = 'active' WHERE id = ?", [id]);
}

export async function recusarUser(id: number): Promise<void> {
    await pool.query("UPDATE users SET status = 'rejected' WHERE id = ?", [id]);
}

export async function atualizarRole(id: number, role: string): Promise<void> {
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
}

export async function removerUser(id: number): Promise<void> {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
}

export async function atualizarSenha(userId: number, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
        'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
        [hashedPassword, userId]
    );
}
