import pool from '../config/database';

export interface Newsletter {
  id: number;
  title: string;
  body: string;
  design: string | null;
  status: 'draft' | 'sent';
  created_at: string;
  sent_at: string | null;
}

export async function listarNewsletters(): Promise<Omit<Newsletter, 'body' | 'design'>[]> {
  const [rows] = await pool.query(
    'SELECT id, title, status, created_at, sent_at FROM newsletters ORDER BY created_at DESC'
  );
  return rows as Omit<Newsletter, 'body' | 'design'>[];
}

export async function contarNewsletters(): Promise<{ total: number; sent: number; draft: number }> {
  const [rows]: any = await pool.query(
    'SELECT status, COUNT(*) AS total FROM newsletters GROUP BY status'
  );
  const result = { total: 0, sent: 0, draft: 0 };
  for (const row of rows) {
    const count = Number(row.total) || 0;
    result.total += count;
    if (row.status === 'sent') result.sent = count;
    if (row.status === 'draft') result.draft = count;
  }
  return result;
}

export async function buscarNewsletter(id: number): Promise<Newsletter | null> {
  const [rows] = await pool.query(
    'SELECT id, title, body, design, status, created_at, sent_at FROM newsletters WHERE id = ?',
    [id]
  );
  const list = rows as Newsletter[];
  return list[0] ?? null;
}

export async function criarNewsletter(title: string, body: string, design: string): Promise<number> {
  const [result]: any = await pool.query(
    "INSERT INTO newsletters (title, body, design, status) VALUES (?, ?, ?, 'draft')",
    [title, body, design]
  );
  return result.insertId as number;
}

export async function atualizarNewsletter(id: number, title: string, body: string, design: string): Promise<void> {
  await pool.query(
    'UPDATE newsletters SET title = ?, body = ?, design = ? WHERE id = ? AND status = ?',
    [title, body, design, id, 'draft']
  );
}

export async function marcarEnviada(id: number): Promise<void> {
  await pool.query(
    "UPDATE newsletters SET status = 'sent', sent_at = NOW() WHERE id = ?",
    [id]
  );
}

export async function deletarNewsletter(id: number): Promise<void> {
  await pool.query(
    "DELETE FROM newsletters WHERE id = ? AND status = 'draft'",
    [id]
  );
}

export async function duplicarNewsletter(id: number): Promise<number> {
  const original = await buscarNewsletter(id);
  if (!original) throw new Error('Newsletter não encontrada');
  const [result]: any = await pool.query(
    "INSERT INTO newsletters (title, body, design, status) VALUES (?, ?, ?, 'draft')",
    [`${original.title} (cópia)`, original.body, original.design]
  );
  return result.insertId as number;
}
