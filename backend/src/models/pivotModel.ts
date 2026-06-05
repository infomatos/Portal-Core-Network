import pool from '../config/database';

export interface PivotUploadRow {
  id: number;
  year: number;
  label: string;
  rows_data: string;
  uploaded_at: string;
  uploaded_by: number;
}

export async function getAllUploads(): Promise<PivotUploadRow[]> {
  const [rows] = await pool.query(
    'SELECT id, year, label, rows_data, uploaded_at FROM pivot_uploads ORDER BY year DESC, uploaded_at ASC'
  );
  return rows as PivotUploadRow[];
}

export async function saveUpload(
  year: number,
  label: string,
  rows: unknown[],
  ctdSummary: unknown[],
  userId: number
): Promise<void> {
  await pool.query(
    'INSERT INTO pivot_uploads (year, label, rows_data, uploaded_by) VALUES (?, ?, ?, ?)',
    [year, label, JSON.stringify({ rows, ctd_summary: ctdSummary }), userId]
  );
}

export async function removeUpload(id: number): Promise<void> {
  await pool.query('DELETE FROM pivot_uploads WHERE id = ?', [id]);
}
