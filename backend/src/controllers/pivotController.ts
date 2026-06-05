import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getAllUploads, saveUpload, removeUpload } from '../models/pivotModel';

export async function getPivotData(_req: AuthRequest, res: Response) {
  try {
    const uploads = await getAllUploads();
    res.json(uploads.map(u => {
      const parsed = JSON.parse(u.rows_data);
      const rows       = Array.isArray(parsed) ? parsed : (parsed.rows ?? []);
      const ctd_summary = Array.isArray(parsed) ? [] : (parsed.ctd_summary ?? []);
      return { id: u.id, year: u.year, label: u.label, rows, ctd_summary, uploadedAt: u.uploaded_at };
    }));
  } catch {
    res.status(500).json({ message: 'Erro ao buscar dados' });
  }
}

export async function uploadPivot(req: AuthRequest, res: Response) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  const { year, label, rows, ctd_summary } = req.body;
  if (!year || !label || !Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ message: 'Dados incompletos' });
  }
  try {
    await saveUpload(Number(year), label, rows, ctd_summary ?? [], req.user.id);
    res.json({ message: 'Publicado com sucesso' });
  } catch {
    res.status(500).json({ message: 'Erro ao salvar' });
  }
}

export async function deletePivot(req: AuthRequest, res: Response) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  try {
    await removeUpload(Number(req.params.id));
    res.json({ message: 'Removido com sucesso' });
  } catch {
    res.status(500).json({ message: 'Erro ao remover' });
  }
}
