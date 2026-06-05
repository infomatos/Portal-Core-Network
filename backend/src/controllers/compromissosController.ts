import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getAllCompromissos, saveCompromissos, removeCompromissos } from '../models/compromissosModel';

export async function getCompromissosData(_req: AuthRequest, res: Response) {
  try {
    const uploads = await getAllCompromissos();
    res.json(uploads.map(u => ({
      id: u.id,
      label: u.label,
      rows: JSON.parse(u.rows_data),
      uploadedAt: u.uploaded_at,
    })));
  } catch {
    res.status(500).json({ message: 'Erro ao buscar dados' });
  }
}

export async function uploadCompromissos(req: AuthRequest, res: Response) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  const { label, rows } = req.body;
  if (!label || !Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ message: 'Dados incompletos' });
  }
  try {
    await saveCompromissos(label, rows, req.user.id);
    res.json({ message: 'Publicado com sucesso' });
  } catch {
    res.status(500).json({ message: 'Erro ao salvar' });
  }
}

export async function deleteCompromissos(req: AuthRequest, res: Response) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  try {
    await removeCompromissos(Number(req.params.id));
    res.json({ message: 'Removido com sucesso' });
  } catch {
    res.status(500).json({ message: 'Erro ao remover' });
  }
}
