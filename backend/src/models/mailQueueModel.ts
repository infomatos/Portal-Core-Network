import pool from '../config/database';

interface QueuedMail {
  id: number;
  to_email: string;
  cc_email: string | null;
  subject: string;
  body: string;
}

export async function enfileirar(
  to_email: string,
  subject: string,
  body: string,
  cc_email?: string
): Promise<void> {
  await pool.query(
    'INSERT INTO email_queue (to_email, cc_email, subject, body) VALUES (?, ?, ?, ?)',
    [to_email, cc_email ?? null, subject, body]
  );
}

export async function buscarPendentes(): Promise<QueuedMail[]> {
  const [rows] = await pool.query(
    "SELECT id, to_email, cc_email, subject, body FROM email_queue WHERE status = 'pending' ORDER BY created_at ASC"
  );
  return rows as QueuedMail[];
}

export async function marcarEnviado(id: number): Promise<void> {
  await pool.query(
    "UPDATE email_queue SET status = 'sent', processed_at = NOW() WHERE id = ?",
    [id]
  );
}

export async function marcarFalha(id: number): Promise<void> {
  await pool.query(
    "UPDATE email_queue SET status = 'failed', processed_at = NOW() WHERE id = ?",
    [id]
  );
}
