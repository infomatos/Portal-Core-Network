import { Response } from 'express';
import type { AuthRequest } from '../middlewares/authMiddleware';
import {
  listarNoticias, contarNoticias, maisLidas,
  buscarNoticia, buscarNoticiaPorId, buscarRelacionadas,
  listarTodasNoticias, incrementarViews,
  criarNoticia, atualizarNoticia, deletarNoticia,
  NEWS_CATEGORIES, type NewsCategory, type NewsContentType,
} from '../models/newsModel';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function calcReadTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function getNoticias(req: AuthRequest, res: Response) {
  try {
    const { category, search, page = '1', limit = '9' } = req.query as Record<string, string>;
    const lim = Math.min(Number(limit) || 9, 50);
    const off = (Math.max(Number(page) || 1, 1) - 1) * lim;
    const cat = NEWS_CATEGORIES.includes(category as NewsCategory)
      ? (category as NewsCategory)
      : undefined;

    const [articles, total] = await Promise.all([
      listarNoticias({ category: cat, search, limit: lim, offset: off }),
      contarNoticias({ category: cat, search }),
    ]);

    res.json({ articles, total, page: Number(page), limit: lim });
  } catch (e) {
    console.error('[news] getNoticias:', e);
    res.status(500).json({ message: 'Erro ao listar notícias' });
  }
}

export async function getTop(_req: AuthRequest, res: Response) {
  try {
    const top = await maisLidas(5);
    res.json(top);
  } catch (e) {
    console.error('[news] getTop:', e);
    res.status(500).json({ message: 'Erro ao buscar notícias em alta' });
  }
}

export async function getNoticia(req: AuthRequest, res: Response) {
  try {
    const noticia = await buscarNoticia(String(req.params.slug));
    if (!noticia) return res.status(404).json({ message: 'Matéria não encontrada' });
    await incrementarViews(noticia.id);
    res.json(noticia);
  } catch (e) {
    console.error('[news] getNoticia:', e);
    res.status(500).json({ message: 'Erro ao buscar matéria' });
  }
}

export async function getRelacionadas(req: AuthRequest, res: Response) {
  try {
    const slug = String(req.params.slug);
    const current = await buscarNoticia(slug);
    if (!current) return res.json([]);
    const related = await buscarRelacionadas(slug, current.category, 3);
    res.json(related);
  } catch (e) {
    console.error('[news] getRelacionadas:', e);
    res.status(500).json({ message: 'Erro ao buscar relacionadas' });
  }
}

export async function getAllAdmin(_req: AuthRequest, res: Response) {
  try {
    const articles = await listarTodasNoticias();
    res.json(articles);
  } catch (e) {
    console.error('[news] getAllAdmin:', e);
    res.status(500).json({ message: 'Erro ao listar matérias' });
  }
}

export async function getNoticiaAdmin(req: AuthRequest, res: Response) {
  try {
    const noticia = await buscarNoticiaPorId(Number(req.params.id));
    if (!noticia) return res.status(404).json({ message: 'Matéria não encontrada' });
    res.json(noticia);
  } catch (e) {
    console.error('[news] getNoticiaAdmin:', e);
    res.status(500).json({ message: 'Erro ao buscar matéria' });
  }
}

export async function createNoticia(req: AuthRequest, res: Response) {
  const { title, excerpt, body, content_type, pdf_url, pdf_name, pdf_size, cover_image, category, status, featured } = req.body;
  const contentType: NewsContentType = content_type === 'presentation' ? 'presentation' : 'article';

  if (!title || !category) {
    return res.status(400).json({ message: 'Título e categoria são obrigatórios' });
  }
  if (contentType === 'article' && !body) {
    return res.status(400).json({ message: 'Conteúdo da matéria é obrigatório' });
  }
  if (contentType === 'presentation' && !pdf_url) {
    return res.status(400).json({ message: 'PDF da apresentação é obrigatório' });
  }
  if (!NEWS_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: 'Categoria inválida' });
  }

  try {
    const baseSlug = slugify(title);
    const existing = await buscarNoticia(baseSlug);
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

    const id = await criarNoticia({
      title: title.trim(),
      slug,
      excerpt: excerpt?.trim() ?? '',
      body: contentType === 'article' ? body : null,
      content_type: contentType,
      pdf_url: contentType === 'presentation' ? pdf_url : null,
      pdf_name: contentType === 'presentation' ? (pdf_name ?? null) : null,
      pdf_size: contentType === 'presentation' ? (Number(pdf_size) || null) : null,
      cover_image: cover_image ?? null,
      category,
      author_id: req.user!.id,
      status: status === 'published' ? 'published' : 'draft',
      featured: Boolean(featured),
      read_time: contentType === 'article' ? calcReadTime(body) : 1,
    });

    res.status(201).json({ message: 'Matéria criada', id, slug });
  } catch (e) {
    console.error('[news] createNoticia:', e);
    res.status(500).json({ message: 'Erro ao criar matéria' });
  }
}

export async function updateNoticia(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  const { title, excerpt, body, content_type, pdf_url, pdf_name, pdf_size, cover_image, category, status, featured } = req.body;
  const contentType: NewsContentType = content_type === 'presentation' ? 'presentation' : 'article';

  if (!title || !category) {
    return res.status(400).json({ message: 'Título e categoria são obrigatórios' });
  }
  if (contentType === 'article' && !body) {
    return res.status(400).json({ message: 'Conteúdo da matéria é obrigatório' });
  }
  if (contentType === 'presentation' && !pdf_url) {
    return res.status(400).json({ message: 'PDF da apresentação é obrigatório' });
  }
  if (!NEWS_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: 'Categoria inválida' });
  }

  try {
    await atualizarNoticia(id, {
      title: title.trim(),
      slug: slugify(title),
      excerpt: excerpt?.trim() ?? '',
      body: contentType === 'article' ? body : null,
      content_type: contentType,
      pdf_url: contentType === 'presentation' ? pdf_url : null,
      pdf_name: contentType === 'presentation' ? (pdf_name ?? null) : null,
      pdf_size: contentType === 'presentation' ? (Number(pdf_size) || null) : null,
      cover_image: cover_image ?? null,
      category,
      status: status === 'published' ? 'published' : 'draft',
      featured: Boolean(featured),
      read_time: contentType === 'article' ? calcReadTime(body) : 1,
    });
    res.json({ message: 'Matéria atualizada' });
  } catch (e) {
    console.error('[news] updateNoticia:', e);
    res.status(500).json({ message: 'Erro ao atualizar matéria' });
  }
}

export async function deleteNoticia(req: AuthRequest, res: Response) {
  try {
    await deletarNoticia(Number(req.params.id));
    res.json({ message: 'Matéria removida' });
  } catch (e) {
    console.error('[news] deleteNoticia:', e);
    res.status(500).json({ message: 'Erro ao remover matéria' });
  }
}
