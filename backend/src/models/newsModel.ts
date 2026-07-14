import pool from '../config/database';

export type NewsCategory = 'NFVi' | 'Database' | 'Packet Core' | 'Voice & Signalling';
export const NEWS_CATEGORIES: NewsCategory[] = ['NFVi', 'Database', 'Packet Core', 'Voice & Signalling'];
export type NewsContentType = 'article' | 'presentation';

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  content_type: NewsContentType;
  pdf_url: string | null;
  pdf_name: string | null;
  pdf_size: number | null;
  cover_image: string | null;
  category: NewsCategory;
  author_id: number | null;
  author_name?: string | null;
  status: 'draft' | 'published';
  featured: number;
  views: number;
  read_time: number;
  published_at: string | null;
  created_at: string;
}

const COLS = `
  n.id, n.title, n.slug, n.excerpt, n.content_type, n.pdf_url, n.pdf_name, n.pdf_size, n.cover_image, n.category,
  n.author_id, u.name AS author_name, n.status, n.featured,
  n.views, n.read_time, n.published_at, n.created_at
`;

export async function listarNoticias(opts: {
  category?: NewsCategory;
  search?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<Omit<NewsItem, 'body'>[]> {
  const { category, search, limit = 9, offset = 0 } = opts;
  let sql = `SELECT ${COLS} FROM news n LEFT JOIN users u ON n.author_id = u.id WHERE n.status = 'published'`;
  const params: any[] = [];

  if (category) { sql += ' AND n.category = ?'; params.push(category); }
  if (search) { sql += ' AND (n.title LIKE ? OR n.excerpt LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  sql += ' ORDER BY n.featured DESC, n.published_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [rows] = await pool.query(sql, params);
  return rows as Omit<NewsItem, 'body'>[];
}

export async function contarNoticias(opts: {
  category?: NewsCategory;
  search?: string;
} = {}): Promise<number> {
  const { category, search } = opts;
  let sql = `SELECT COUNT(*) AS total FROM news WHERE status = 'published'`;
  const params: any[] = [];
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (search) { sql += ' AND (title LIKE ? OR excerpt LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  const [rows]: any = await pool.query(sql, params);
  return rows[0].total as number;
}

export async function contarNoticiasPorStatus(): Promise<{ total: number; published: number; draft: number; views: number }> {
  const [statusRows]: any = await pool.query(
    'SELECT status, COUNT(*) AS total FROM news GROUP BY status'
  );
  const [viewRows]: any = await pool.query(
    'SELECT COALESCE(SUM(views), 0) AS views FROM news'
  );
  const result = { total: 0, published: 0, draft: 0, views: Number(viewRows[0]?.views) || 0 };
  for (const row of statusRows) {
    const count = Number(row.total) || 0;
    result.total += count;
    if (row.status === 'published') result.published = count;
    if (row.status === 'draft') result.draft = count;
  }
  return result;
}

export async function maisLidas(limit = 5): Promise<Omit<NewsItem, 'body'>[]> {
  const [rows] = await pool.query(
    `SELECT ${COLS} FROM news n LEFT JOIN users u ON n.author_id = u.id
     WHERE n.status = 'published' ORDER BY n.views DESC LIMIT ?`,
    [limit]
  );
  return rows as Omit<NewsItem, 'body'>[];
}

export async function buscarNoticia(slug: string): Promise<NewsItem | null> {
  const [rows] = await pool.query(
    `SELECT n.*, u.name AS author_name FROM news n
     LEFT JOIN users u ON n.author_id = u.id
     WHERE n.slug = ? AND n.status = 'published'`,
    [slug]
  );
  const list = rows as NewsItem[];
  return list[0] ?? null;
}

export async function buscarNoticiaPorId(id: number): Promise<NewsItem | null> {
  const [rows] = await pool.query(
    `SELECT n.*, u.name AS author_name FROM news n
     LEFT JOIN users u ON n.author_id = u.id WHERE n.id = ?`,
    [id]
  );
  const list = rows as NewsItem[];
  return list[0] ?? null;
}

export async function listarTodasNoticias(): Promise<Omit<NewsItem, 'body'>[]> {
  const [rows] = await pool.query(
    `SELECT ${COLS} FROM news n LEFT JOIN users u ON n.author_id = u.id ORDER BY n.created_at DESC`
  );
  return rows as Omit<NewsItem, 'body'>[];
}

export async function incrementarViews(id: number): Promise<void> {
  await pool.query('UPDATE news SET views = views + 1 WHERE id = ?', [id]);
}

export async function criarNoticia(data: {
  title: string;
  slug: string;
  excerpt: string;
  body: string | null;
  content_type: NewsContentType;
  pdf_url: string | null;
  pdf_name: string | null;
  pdf_size: number | null;
  cover_image: string | null;
  category: NewsCategory;
  author_id: number;
  status: 'draft' | 'published';
  featured: boolean;
  read_time: number;
}): Promise<number> {
  const published_at = data.status === 'published' ? new Date() : null;
  const [result]: any = await pool.query(
    `INSERT INTO news (title, slug, excerpt, body, content_type, pdf_url, pdf_name, pdf_size, cover_image, category, author_id, status, featured, read_time, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.title, data.slug, data.excerpt, data.body, data.content_type,
      data.pdf_url, data.pdf_name, data.pdf_size, data.cover_image,
      data.category, data.author_id, data.status,
      data.featured ? 1 : 0, data.read_time, published_at,
    ]
  );
  return result.insertId as number;
}

export async function atualizarNoticia(id: number, data: {
  title: string;
  slug: string;
  excerpt: string;
  body: string | null;
  content_type: NewsContentType;
  pdf_url: string | null;
  pdf_name: string | null;
  pdf_size: number | null;
  cover_image: string | null;
  category: NewsCategory;
  status: 'draft' | 'published';
  featured: boolean;
  read_time: number;
}): Promise<void> {
  const existing = await buscarNoticiaPorId(id);
  const published_at =
    data.status === 'published' && existing?.status !== 'published'
      ? new Date()
      : (existing?.published_at ?? null);

  await pool.query(
    `UPDATE news SET title=?, slug=?, excerpt=?, body=?, content_type=?, pdf_url=?, pdf_name=?, pdf_size=?, cover_image=?, category=?,
     status=?, featured=?, read_time=?, published_at=? WHERE id=?`,
    [
      data.title, data.slug, data.excerpt, data.body, data.content_type,
      data.pdf_url, data.pdf_name, data.pdf_size, data.cover_image,
      data.category, data.status, data.featured ? 1 : 0,
      data.read_time, published_at, id,
    ]
  );
}

export async function deletarNoticia(id: number): Promise<void> {
  await pool.query('DELETE FROM news WHERE id = ?', [id]);
}

export async function buscarRelacionadas(slug: string, category: NewsCategory, limit = 3): Promise<Omit<NewsItem, 'body'>[]> {
  const [rows] = await pool.query(
    `SELECT ${COLS} FROM news n LEFT JOIN users u ON n.author_id = u.id
     WHERE n.status = 'published' AND n.category = ? AND n.slug != ?
     ORDER BY n.published_at DESC LIMIT ?`,
    [category, slug, limit]
  );
  return rows as Omit<NewsItem, 'body'>[];
}
