import pool from '../config/database';

export interface CompromissosUploadRow {
  id: number;
  label: string;
  rows_data: string;
  uploaded_at: string;
  uploaded_by: number;
}

export async function getAllCompromissos(): Promise<CompromissosUploadRow[]> {
  const [rows] = await pool.query(
    'SELECT id, label, rows_data, uploaded_at FROM compromissos_uploads ORDER BY uploaded_at DESC'
  );
  return rows as CompromissosUploadRow[];
}

export async function saveCompromissos(
  label: string,
  rows: unknown[],
  userId: number
): Promise<void> {
  await pool.query(
    'INSERT INTO compromissos_uploads (label, rows_data, uploaded_by) VALUES (?, ?, ?)',
    [label, JSON.stringify(rows), userId]
  );
}

export async function removeCompromissos(id: number): Promise<void> {
  await pool.query('DELETE FROM compromissos_uploads WHERE id = ?', [id]);
}
