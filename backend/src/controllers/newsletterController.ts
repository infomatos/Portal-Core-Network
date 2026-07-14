import { Response } from 'express';
import type { AuthRequest } from '../middlewares/authMiddleware';
import {
  listarNewsletters,
  buscarNewsletter,
  criarNewsletter,
  atualizarNewsletter,
  marcarEnviada,
  deletarNewsletter,
  duplicarNewsletter,
} from '../models/newsletterModel';
import { listarAtivos } from '../models/subscriberModel';
import { enfileirar } from '../models/mailQueueModel';

export async function getNewsletters(_req: AuthRequest, res: Response) {
  try {
    const newsletters = await listarNewsletters();
    res.json(newsletters);
  } catch (e) {
    console.error('[newsletter] getNewsletters:', e);
    res.status(500).json({ message: 'Erro ao listar newsletters' });
  }
}

export async function getNewsletter(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  try {
    const newsletter = await buscarNewsletter(id);
    if (!newsletter) return res.status(404).json({ message: 'Newsletter não encontrada' });
    res.json(newsletter);
  } catch (e) {
    console.error('[newsletter] getNewsletter:', e);
    res.status(500).json({ message: 'Erro ao buscar newsletter' });
  }
}

export async function createNewsletter(req: AuthRequest, res: Response) {
  const { title, body, design } = req.body;
  if (!title || !body || !design) {
    return res.status(400).json({ message: 'Título, body e design são obrigatórios' });
  }
  try {
    const id = await criarNewsletter(title.trim(), body, design);
    res.status(201).json({ message: 'Rascunho salvo', id });
  } catch (e) {
    console.error('[newsletter] createNewsletter:', e);
    res.status(500).json({ message: 'Erro ao criar newsletter' });
  }
}

export async function updateNewsletter(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  const { title, body, design } = req.body;
  if (!title || !body || !design) {
    return res.status(400).json({ message: 'Título, body e design são obrigatórios' });
  }
  try {
    await atualizarNewsletter(id, title.trim(), body, design);
    res.json({ message: 'Rascunho atualizado' });
  } catch (e) {
    console.error('[newsletter] updateNewsletter:', e);
    res.status(500).json({ message: 'Erro ao atualizar newsletter' });
  }
}

export async function sendNewsletter(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  try {
    const newsletter = await buscarNewsletter(id);
    if (!newsletter) return res.status(404).json({ message: 'Newsletter não encontrada' });
    if (newsletter.status === 'sent') {
      return res.status(400).json({ message: 'Esta newsletter já foi enviada' });
    }

    const subscribers = await listarAtivos();
    if (subscribers.length === 0) {
      return res.status(400).json({ message: 'Nenhum subscriber ativo encontrado' });
    }

    const emails = subscribers.map(s => s.email).join(', ');
    await enfileirar(emails, newsletter.title, newsletter.body);

    await marcarEnviada(id);

    res.json({ message: `Newsletter enfileirada para ${subscribers.length} subscriber(s)` });
  } catch (e) {
    console.error('[newsletter] sendNewsletter:', e);
    res.status(500).json({ message: 'Erro ao enviar newsletter' });
  }
}

export async function duplicarNewsletterHandler(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  try {
    const novoId = await duplicarNewsletter(id);
    res.status(201).json({ message: 'Newsletter duplicada como rascunho', id: novoId });
  } catch (e) {
    console.error('[newsletter] duplicar:', e);
    res.status(500).json({ message: 'Erro ao duplicar newsletter' });
  }
}

export async function deleteNewsletter(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  try {
    await deletarNewsletter(id);
    res.json({ message: 'Rascunho removido' });
  } catch (e) {
    console.error('[newsletter] deleteNewsletter:', e);
    res.status(500).json({ message: 'Erro ao remover newsletter' });
  }
}
