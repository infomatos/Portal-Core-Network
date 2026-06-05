import { Response } from 'express';
import type { AuthRequest } from '../middlewares/authMiddleware';
import {
  listarSubscribers,
  adicionarSubscriber,
  alterarStatus,
  deletarSubscriber,
} from '../models/subscriberModel';

export async function getSubscribers(req: AuthRequest, res: Response) {
  try {
    const subscribers = await listarSubscribers();
    res.json(subscribers);
  } catch (e) {
    console.error('[subscribers] getSubscribers:', e);
    res.status(500).json({ message: 'Erro ao listar subscribers' });
  }
}

export async function addSubscriber(req: AuthRequest, res: Response) {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Nome e email são obrigatórios' });
  }
  try {
    await adicionarSubscriber(name.trim(), email.trim().toLowerCase());
    res.status(201).json({ message: 'Subscriber adicionado com sucesso' });
  } catch (e: any) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Este email já está cadastrado' });
    }
    console.error('[subscribers] addSubscriber:', e);
    res.status(500).json({ message: 'Erro ao adicionar subscriber' });
  }
}

export async function patchSubscriberStatus(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ message: 'Status inválido' });
  }
  try {
    await alterarStatus(id, status);
    res.json({ message: 'Status atualizado' });
  } catch (e) {
    console.error('[subscribers] patchStatus:', e);
    res.status(500).json({ message: 'Erro ao atualizar status' });
  }
}

export async function removeSubscriber(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  try {
    await deletarSubscriber(id);
    res.json({ message: 'Subscriber removido' });
  } catch (e) {
    console.error('[subscribers] removeSubscriber:', e);
    res.status(500).json({ message: 'Erro ao remover subscriber' });
  }
}
