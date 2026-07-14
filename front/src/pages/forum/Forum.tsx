import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;
const PER_PAGE = 9;

interface ForumPost {
  id: number;
  title: string;
  slug: string;
  forum_date: string;
  participants: string;
  main_topics: string;
  action_items: string;
  author_name: string | null;
  attachment_name: string | null;
  published_at: string | null;
  created_at: string;
}

function fmtDate(d: string | null) {
  if (!d) return '';
  const [year, month, day] = d.slice(0, 10).split('-');
  if (!year || !month || !day) return d;
  return `${day}/${month}/${year}`;
}

function splitTopics(value: string) {
  return value.split(/,|\n/).map(t => t.trim()).filter(Boolean).slice(0, 4);
}

function actionSummary(value: string) {
  try {
    const items = JSON.parse(value || '[]');
    if (!Array.isArray(items) || !items.length) return 'Nenhum item';
    const done = items.filter((item: any) => item?.done).length;
    return `${done}/${items.length} concluidas`;
  } catch {
    return 'Nenhum item';
  }
}

function AttachmentIcon() {
  return (
    <span title="Possui anexo" className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 rounded-full px-2 py-1">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94a3 3 0 1 1 4.243 4.243L8.552 18.32a1.5 1.5 0 1 1-2.121-2.121l9.192-9.193" />
      </svg>
      Anexo
    </span>
  );
}

function ForumCard({ post }: { post: ForumPost }) {
  const topics = splitTopics(post.main_topics);

  return (
    <Link
      to={`/forum/${post.slug}`}
      className="group flex flex-col bg-white border border-slate-100 rounded-xl p-5 hover:shadow-lg hover:shadow-slate-200/70 hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#EB0028]">Forum Core Evolution</p>
          <p className="text-xs text-slate-400 mt-1">{fmtDate(post.forum_date)}</p>
        </div>
        {post.attachment_name && <AttachmentIcon />}
      </div>

      <h2 className="text-base font-bold text-slate-900 leading-snug group-hover:text-[#EB0028] transition-colors line-clamp-2">
        {post.title}
      </h2>

      <div className="flex flex-wrap gap-1.5 mt-4">
        {topics.length ? topics.map(topic => (
          <span key={topic} className="text-[11px] font-medium text-slate-600 bg-slate-100 rounded-full px-2 py-1">
            {topic}
          </span>
        )) : (
          <span className="text-xs text-slate-400">Sem temas destacados</span>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2">
        <p className="line-clamp-1"><span className="font-semibold text-slate-700">Participantes:</span> {post.participants}</p>
        <p><span className="font-semibold text-slate-700">Plano de acao:</span> {actionSummary(post.action_items)}</p>
        {post.author_name && <p><span className="font-semibold text-slate-700">Autor:</span> {post.author_name}</p>}
      </div>
    </Link>
  );
}

export default function Forum() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.ceil(total / PER_PAGE);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PER_PAGE) });
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await fetch(`${API}/forum?${params.toString()}`);
      const data = await res.json();
      setPosts(Array.isArray(data.posts) ? data.posts : []);
      setTotal(Number(data.total) || 0);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#EB0028]">Forum Core Evolution</p>
          <div className="mt-3 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Registros do Forum</h1>
              <p className="text-sm text-slate-500 mt-2 max-w-2xl">
                Historico dos temas discutidos, participantes e planos de ação definidos no evento.
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar registros..."
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-7 h-7 rounded-full border-2 border-slate-200 border-t-slate-700" />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-xl py-16 text-center">
            <p className="text-sm font-medium text-slate-500">Nenhum registro encontrado</p>
            <p className="text-xs text-slate-400 mt-1">Quando houver publicacoes, elas aparecerao aqui.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {posts.map(post => <ForumCard key={post.id} post={post} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="text-sm text-slate-500">Pagina {page} de {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg disabled:opacity-40"
                >
                  Proxima
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
