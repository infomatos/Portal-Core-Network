import pool from '../config/database';

export interface Subscriber {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export async function listarSubscribers(): Promise<Subscriber[]> {
  const [rows] = await pool.query(
    'SELECT id, name, email, status, created_at FROM subscribers ORDER BY created_at DESC'
  );
  return rows as Subscriber[];
}

export async function listarAtivos(): Promise<Subscriber[]> {
  const [rows] = await pool.query(
    "SELECT id, name, email FROM subscribers WHERE status = 'active' ORDER BY name ASC"
  );
  return rows as Subscriber[];
}

export async function adicionarSubscriber(name: string, email: string): Promise<void> {
  await pool.query(
    'INSERT INTO subscribers (name, email) VALUES (?, ?)',
    [name, email]
  );
}

export async function alterarStatus(id: number, status: 'active' | 'inactive'): Promise<void> {
  await pool.query(
    'UPDATE subscribers SET status = ? WHERE id = ?',
    [status, id]
  );
}

export async function deletarSubscriber(id: number): Promise<void> {
  await pool.query('DELETE FROM subscribers WHERE id = ?', [id]);
}
