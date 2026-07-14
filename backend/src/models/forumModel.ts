import pool from '../config/database';

export interface ForumPost {
  id: number;
  title: string;
  slug: string;
  forum_date: string;
  participants: string;
  main_topics: string;
  content: string;
  action_items: string;
  author_id: number | null;
  author_name?: string | null;
  status: 'draft' | 'published';
  attachment_name: string | null;
  attachment_url: string | null;
  attachment_path: string | null;
  attachment_mime: string | null;
  attachment_size: number | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ForumPostInput {
  title: string;
  slug: string;
  forum_date: string;
  participants: string;
  main_topics: string;
  content: string;
  action_items: string;
  author_id: number;
  status: 'draft' | 'published';
  attachment_name?: string | null;
  attachment_url?: string | null;
  attachment_path?: string | null;
  attachment_mime?: string | null;
  attachment_size?: number | null;
}

const COLS = `
  f.id, f.title, f.slug, f.forum_date, f.participants, f.main_topics,
  f.action_items, f.author_id, author.name AS author_name,
  f.status, f.attachment_name, f.attachment_url, f.attachment_path,
  f.attachment_mime, f.attachment_size, f.published_at, f.created_at, f.updated_at
`;

const DETAIL_COLS = `${COLS}, f.content`;

export async function listarForumPublico(opts: {
  search?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<Omit<ForumPost, 'content'>[]> {
  const { search, limit = 12, offset = 0 } = opts;
  let sql = `
    SELECT ${COLS}
    FROM forum_posts f
    LEFT JOIN users author ON f.author_id = author.id
    WHERE f.status = 'published'
  `;
  const params: any[] = [];

  if (search) {
    sql += ' AND (f.title LIKE ? OR f.main_topics LIKE ? OR f.participants LIKE ? OR f.action_items LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  sql += ' ORDER BY f.forum_date DESC, f.published_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [rows] = await pool.query(sql, params);
  return rows as Omit<ForumPost, 'content'>[];
}

export async function contarForumPublico(search?: string): Promise<number> {
  let sql = `
    SELECT COUNT(*) AS total
    FROM forum_posts f
    WHERE f.status = 'published'
  `;
  const params: any[] = [];

  if (search) {
    sql += ' AND (f.title LIKE ? OR f.main_topics LIKE ? OR f.participants LIKE ? OR f.action_items LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  const [rows]: any = await pool.query(sql, params);
  return rows[0].total as number;
}

export async function contarForumPorStatus(): Promise<{ total: number; published: number; draft: number }> {
  const [rows]: any = await pool.query(
    'SELECT status, COUNT(*) AS total FROM forum_posts GROUP BY status'
  );
  const result = { total: 0, published: 0, draft: 0 };
  for (const row of rows) {
    const count = Number(row.total) || 0;
    result.total += count;
    if (row.status === 'published') result.published = count;
    if (row.status === 'draft') result.draft = count;
  }
  return result;
}

export async function listarForumAdmin(): Promise<Omit<ForumPost, 'content'>[]> {
  const [rows] = await pool.query(`
    SELECT ${COLS}
    FROM forum_posts f
    LEFT JOIN users author ON f.author_id = author.id
    ORDER BY f.created_at DESC
  `);
  return rows as Omit<ForumPost, 'content'>[];
}

export async function buscarForumPorSlug(slug: string): Promise<ForumPost | null> {
  const [rows] = await pool.query(`
    SELECT ${DETAIL_COLS}
    FROM forum_posts f
    LEFT JOIN users author ON f.author_id = author.id
    WHERE f.slug = ? AND f.status = 'published'
  `, [slug]);
  const list = rows as ForumPost[];
  return list[0] ?? null;
}

export async function buscarForumPorId(id: number): Promise<ForumPost | null> {
  const [rows] = await pool.query(`
    SELECT ${DETAIL_COLS}
    FROM forum_posts f
    LEFT JOIN users author ON f.author_id = author.id
    WHERE f.id = ?
  `, [id]);
  const list = rows as ForumPost[];
  return list[0] ?? null;
}

export async function buscarForumPorSlugQualquerStatus(slug: string): Promise<ForumPost | null> {
  const [rows] = await pool.query('SELECT * FROM forum_posts WHERE slug = ?', [slug]);
  const list = rows as ForumPost[];
  return list[0] ?? null;
}

export async function criarForumPost(data: ForumPostInput): Promise<number> {
  const published_at = data.status === 'published' ? new Date() : null;
  const [result]: any = await pool.query(
    `INSERT INTO forum_posts (
      title, slug, forum_date, participants, main_topics, content, action_items,
      author_id, status, attachment_name, attachment_url,
      attachment_path, attachment_mime, attachment_size, published_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.title, data.slug, data.forum_date, data.participants, data.main_topics,
      data.content, data.action_items, data.author_id, data.status,
      data.attachment_name ?? null, data.attachment_url ?? null,
      data.attachment_path ?? null, data.attachment_mime ?? null,
      data.attachment_size ?? null, published_at,
    ]
  );
  return result.insertId as number;
}

export async function atualizarForumPost(id: number, data: Omit<ForumPostInput, 'author_id' | 'slug'> & {
  slug: string;
  keep_attachment?: boolean;
}): Promise<void> {
  const existing = await buscarForumPorId(id);
  const published_at =
    data.status === 'published' && existing?.status !== 'published'
      ? new Date()
      : (existing?.published_at ?? null);

  const attachmentFields = data.keep_attachment
    ? ''
    : ', attachment_name=?, attachment_url=?, attachment_path=?, attachment_mime=?, attachment_size=?';
  const attachmentValues = data.keep_attachment
    ? []
    : [
        data.attachment_name ?? null,
        data.attachment_url ?? null,
        data.attachment_path ?? null,
        data.attachment_mime ?? null,
        data.attachment_size ?? null,
      ];

  await pool.query(
    `UPDATE forum_posts SET
      title=?, slug=?, forum_date=?, participants=?, main_topics=?, content=?,
      action_items=?, status=?, published_at=?
      ${attachmentFields}
     WHERE id=?`,
    [
      data.title, data.slug, data.forum_date, data.participants, data.main_topics,
      data.content, data.action_items, data.status, published_at,
      ...attachmentValues, id,
    ]
  );
}

export async function deletarForumPost(id: number): Promise<void> {
  await pool.query('DELETE FROM forum_posts WHERE id = ?', [id]);
}
