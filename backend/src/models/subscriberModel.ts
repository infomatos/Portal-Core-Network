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

export async function contarSubscribers(): Promise<{ total: number; active: number; inactive: number }> {
  const [rows]: any = await pool.query(
    'SELECT status, COUNT(*) AS total FROM subscribers GROUP BY status'
  );
  const result = { total: 0, active: 0, inactive: 0 };
  for (const row of rows) {
    const count = Number(row.total) || 0;
    result.total += count;
    if (row.status === 'active') result.active = count;
    if (row.status === 'inactive') result.inactive = count;
  }
  return result;
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
