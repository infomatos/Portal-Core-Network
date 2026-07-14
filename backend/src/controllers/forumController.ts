import { Response } from 'express';
import fs from 'fs';
import type { AuthRequest } from '../middlewares/authMiddleware';
import {
  listarForumPublico, contarForumPublico, listarForumAdmin,
  buscarForumPorSlug, buscarForumPorId, buscarForumPorSlugQualquerStatus,
  criarForumPost, atualizarForumPost, deletarForumPost,
} from '../models/forumModel';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeStatus(value: unknown): 'draft' | 'published' {
  return value === 'published' ? 'published' : 'draft';
}

interface ActionItem {
  action: string;
  responsible: string;
  done: boolean;
}

function parseActionItems(value: unknown): ActionItem[] {
  let raw = value;
  if (typeof value === 'string') {
    try {
      raw = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(raw)) return [];

  return raw
    .map((item: any) => ({
      action: cleanText(item?.action),
      responsible: cleanText(item?.responsible),
      done: Boolean(item?.done),
    }))
    .filter(item => item.action || item.responsible);
}

function attachmentFromFile(req: AuthRequest) {
  if (!req.file) return {};
  const baseUrl = process.env.UPLOAD_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
  return {
    attachment_name: req.file.originalname,
    attachment_url: `${baseUrl}/uploads/forum/${req.file.filename}`,
    attachment_path: req.file.path,
    attachment_mime: req.file.mimetype,
    attachment_size: req.file.size,
  };
}

async function uniqueSlug(title: string, currentId?: number): Promise<string> {
  const base = slugify(title) || `forum-${Date.now()}`;
  const existing = await buscarForumPorSlugQualquerStatus(base);
  if (!existing || existing.id === currentId) return base;
  return `${base}-${Date.now()}`;
}

function removeFile(pathname?: string | null) {
  if (!pathname) return;
  fs.promises.unlink(pathname).catch(() => {});
}

export async function getForumPosts(req: AuthRequest, res: Response) {
  try {
    const { search, page = '1', limit = '12' } = req.query as Record<string, string>;
    const lim = Math.min(Number(limit) || 12, 50);
    const off = (Math.max(Number(page) || 1, 1) - 1) * lim;
    const [posts, total] = await Promise.all([
      listarForumPublico({ search, limit: lim, offset: off }),
      contarForumPublico(search),
    ]);
    res.json({ posts, total, page: Number(page), limit: lim });
  } catch (e) {
    console.error('[forum] getForumPosts:', e);
    res.status(500).json({ message: 'Erro ao listar registros do forum' });
  }
}

export async function getForumPost(req: AuthRequest, res: Response) {
  try {
    const post = await buscarForumPorSlug(String(req.params.slug));
    if (!post) return res.status(404).json({ message: 'Registro nao encontrado' });
    res.json(post);
  } catch (e) {
    console.error('[forum] getForumPost:', e);
    res.status(500).json({ message: 'Erro ao buscar registro' });
  }
}

export async function getForumPostsAdmin(_req: AuthRequest, res: Response) {
  try {
    const posts = await listarForumAdmin();
    res.json(posts);
  } catch (e) {
    console.error('[forum] getForumPostsAdmin:', e);
    res.status(500).json({ message: 'Erro ao listar registros' });
  }
}

export async function getForumPostAdmin(req: AuthRequest, res: Response) {
  try {
    const post = await buscarForumPorId(Number(req.params.id));
    if (!post) return res.status(404).json({ message: 'Registro nao encontrado' });
    res.json(post);
  } catch (e) {
    console.error('[forum] getForumPostAdmin:', e);
    res.status(500).json({ message: 'Erro ao buscar registro' });
  }
}

export async function createForumPost(req: AuthRequest, res: Response) {
  const title = cleanText(req.body.title);
  const forum_date = cleanText(req.body.forum_date);
  const participants = cleanText(req.body.participants);
  const main_topics = cleanText(req.body.main_topics);
  const content = cleanText(req.body.content);
  const actionItems = parseActionItems(req.body.action_items);
  const status = normalizeStatus(req.body.status);

  if (!forum_date) {
    removeFile(req.file?.path);
    return res.status(400).json({ message: 'Data obrigatoria' });
  }

  try {
    const slug = await uniqueSlug(title || `forum-${forum_date}`);
    const id = await criarForumPost({
      title, slug, forum_date, participants, main_topics, content,
      action_items: JSON.stringify(actionItems), author_id: req.user!.id,
      status, ...attachmentFromFile(req),
    });
    res.status(201).json({ message: 'Registro criado', id, slug });
  } catch (e) {
    removeFile(req.file?.path);
    console.error('[forum] createForumPost:', e);
    res.status(500).json({ message: 'Erro ao criar registro' });
  }
}

export async function updateForumPost(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  const title = cleanText(req.body.title);
  const forum_date = cleanText(req.body.forum_date);
  const participants = cleanText(req.body.participants);
  const main_topics = cleanText(req.body.main_topics);
  const content = cleanText(req.body.content);
  const actionItems = parseActionItems(req.body.action_items);
  const status = normalizeStatus(req.body.status);
  const remove_attachment = req.body.remove_attachment === 'true' || req.body.remove_attachment === true;

  if (!forum_date) {
    removeFile(req.file?.path);
    return res.status(400).json({ message: 'Data obrigatoria' });
  }

  try {
    const existing = await buscarForumPorId(id);
    if (!existing) {
      removeFile(req.file?.path);
      return res.status(404).json({ message: 'Registro nao encontrado' });
    }

    const shouldKeepAttachment = !req.file && !remove_attachment;
    const slug = title ? await uniqueSlug(title, id) : existing.slug;
    await atualizarForumPost(id, {
      title, slug, forum_date, participants, main_topics, content,
      action_items: JSON.stringify(actionItems), status,
      keep_attachment: shouldKeepAttachment, ...attachmentFromFile(req),
    });

    if (req.file || remove_attachment) removeFile(existing.attachment_path);
    res.json({ message: 'Registro atualizado', slug });
  } catch (e) {
    removeFile(req.file?.path);
    console.error('[forum] updateForumPost:', e);
    res.status(500).json({ message: 'Erro ao atualizar registro' });
  }
}

export async function deleteForumPost(req: AuthRequest, res: Response) {
  try {
    const post = await buscarForumPorId(Number(req.params.id));
    if (!post) return res.status(404).json({ message: 'Registro nao encontrado' });
    await deletarForumPost(post.id);
    removeFile(post.attachment_path);
    res.json({ message: 'Registro removido' });
  } catch (e) {
    console.error('[forum] deleteForumPost:', e);
    res.status(500).json({ message: 'Erro ao remover registro' });
  }
}
