import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;
const CATEGORIES = ['NFVi', 'Database', 'Packet Core', 'Voice & Signalling'] as const;
type Category = typeof CATEGORIES[number];
const PER_PAGE = 6;

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content_type: 'article' | 'presentation';
  pdf_url: string | null;
  pdf_name: string | null;
  pdf_size: number | null;
  cover_image: string | null;
  category: Category;
  author_name: string | null;
  featured: number;
  views: number;
  read_time: number;
  published_at: string | null;
  created_at: string;
}

function catMeta(cat: string) {
  if (cat === 'NFVi')
    return { pill: 'bg-blue-500/10 text-blue-700 ring-1 ring-inset ring-blue-500/20', dot: 'bg-blue-500', activeBtn: 'bg-blue-600 text-white shadow-md shadow-blue-200' };
  if (cat === 'Database')
    return { pill: 'bg-purple-500/10 text-purple-700 ring-1 ring-inset ring-purple-500/20', dot: 'bg-purple-500', activeBtn: 'bg-purple-600 text-white shadow-md shadow-purple-200' };
  if (cat === 'Packet Core')
    return { pill: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-500/20', dot: 'bg-emerald-500', activeBtn: 'bg-emerald-600 text-white shadow-md shadow-emerald-200' };
  if (cat === 'Voice & Signalling')
    return { pill: 'bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-500/20', dot: 'bg-amber-500', activeBtn: 'bg-amber-600 text-white shadow-md shadow-amber-200' };
  return { pill: 'bg-slate-500/10 text-slate-600 ring-1 ring-inset ring-slate-500/20', dot: 'bg-slate-400', activeBtn: 'bg-slate-700 text-white shadow-md' };
}

function isNew(d: string | null) {
  if (!d) return false;
  return Date.now() - new Date(d).getTime() < 48 * 3600 * 1000;
}

function fmtDate(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function initials(name: string | null) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function isPresentation(article: Article) {
  return article.content_type === 'presentation';
}

function ContentBadge({ article, light = false }: { article: Article; light?: boolean }) {
  if (!isPresentation(article)) return null;
  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${light ? 'bg-white/15 text-white border border-white/20' : 'bg-[#EB0028]/10 text-[#EB0028] bg-white/90'
      }`}>
      Apresentação
    </span>
  );
}

/* ── Hero do artigo em destaque ───────────────────────────────────────── */
function HeroCard({ article }: { article: Article }) {
  const meta = catMeta(article.category);
  return (
    <Link
      to={`/news/${article.slug}`}
      className="group relative flex flex-col justify-end overflow-hidden rounded-2xl min-h-[420px] md:min-h-[500px] bg-slate-900"
    >
      {article.cover_image ? (
        <img
          src={article.cover_image}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-55"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      <div className="relative p-8 md:p-10">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${meta.pill} bg-white/90`}>
            {article.category}
          </span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#EB0028] text-white uppercase tracking-widest">
            Destaque
          </span>
          <ContentBadge article={article} light />
          {isNew(article.published_at) && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/15 text-white border border-white/20">
              Novo
            </span>
          )}
        </div>

        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3 max-w-3xl">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-slate-300 text-sm md:text-base line-clamp-2 mb-6 max-w-2xl">
            {article.excerpt}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 mb-5">
          {article.author_name && (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold text-white">
                {initials(article.author_name)}
              </div>
              <span className="text-white/80">{article.author_name}</span>
            </div>
          )}
          <span className="text-white/40">·</span>
          <span className="text-white/70">{fmtDate(article.published_at)}</span>
          <span className="text-white/40">·</span>
          <span className="flex items-center gap-1 text-white/70">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {isPresentation(article) ? 'PDF interativo' : `${article.read_time} min de leitura`}
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-white/15 border border-white/20 px-4 py-2 rounded-full group-hover:bg-white/25 transition-colors">
          {isPresentation(article) ? 'Ver apresentação' : 'Ler matéria'}
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

/* ── Card de artigo ───────────────────────────────────────────────────── */
function ArticleCard({ article }: { article: Article }) {
  const meta = catMeta(article.category);
  const nova = isNew(article.published_at || article.created_at);
  return (
    <Link
      to={`/news/${article.slug}`}
      className="group flex flex-col bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-slate-200/70 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative overflow-hidden bg-slate-100 aspect-video">
        {article.cover_image ? (
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50">
            <svg className="w-8 h-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.pill} bg-white/90 backdrop-blur-sm`}>
              {article.category}
            </span>
            <ContentBadge article={article} />
          </div>
        </div>
        {nova && (
          <div className="absolute top-2.5 right-2.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EB0028] text-white">Novo</span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-[#EB0028] transition-colors mb-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-xs text-slate-500 line-clamp-3 flex-1 mb-3">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-3 border-t border-slate-50 mt-auto">
          {article.author_name && (
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600 shrink-0">
                {initials(article.author_name)}
              </div>
              <span className="truncate text-slate-500">{article.author_name}</span>
            </div>
          )}
          <span className="shrink-0">{fmtDate(article.published_at)}</span>
          <span className="flex items-center gap-0.5 shrink-0">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {isPresentation(article) ? 'PDF' : `${article.read_time}m`}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Card compacto para sidebar "Em Alta" ─────────────────────────────── */
function TopCard({ article, rank }: { article: Article; rank: number }) {
  const meta = catMeta(article.category);
  return (
    <Link
      to={`/news/${article.slug}`}
      className="group flex gap-3 py-3 border-b border-slate-100 last:border-none hover:bg-slate-50 -mx-4 px-4 rounded-lg transition-colors"
    >
      <span className="text-2xl font-bold text-slate-100 w-6 shrink-0 leading-tight mt-0.5 text-right">{rank}</span>
      <div className="flex-1 min-w-0">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${meta.pill} inline-block mb-1`}>
          {article.category}
        </span>
        <ContentBadge article={article} />
        <p className="text-xs font-medium text-slate-700 line-clamp-2 group-hover:text-[#EB0028] transition-colors leading-snug">
          {article.title}
        </p>
        <span className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          {article.views.toLocaleString('pt-BR')} visualizações
        </span>
      </div>
    </Link>
  );
}

/* ── Skeleton de card ─────────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="aspect-video bg-slate-100" />
      <div className="p-4 space-y-2.5">
        <div className="h-3.5 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-5/6" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
      </div>
    </div>
  );
}

/* ── Página principal ────────────────────────────────────────────────── */
export default function News() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [featured, setFeatured] = useState<Article | null>(null);
  const [topArticles, setTopArticles] = useState<Article[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.ceil(total / PER_PAGE);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetch(`${API}/news/top`)
      .then(r => r.json())
      .then(d => setTopArticles(Array.isArray(d) ? d : []))
      .catch(() => { });
  }, []);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PER_PAGE) });
      if (activeCategory) params.set('category', activeCategory);
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await fetch(`${API}/news?${params}`);
      const data = await res.json();
      const arts: Article[] = data.articles ?? [];

      setArticles(arts);
      setTotal(data.total ?? 0);

      if (page === 1 && !activeCategory && !debouncedSearch) {
        setFeatured(arts.find(a => a.featured) ?? arts[0] ?? null);
      } else {
        setFeatured(null);
      }
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [page, activeCategory, debouncedSearch]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const handleCategory = (cat: Category | null) => {
    setActiveCategory(cat);
    setPage(1);
  };

  const gridArticles = featured ? articles.filter(a => a.id !== featured.id) : articles;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Cabeçalho ─────────────────────────────────────────────── */}
      <div className="bg-slate-900 pt-14 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full border border-white/5" />
          <div className="absolute top-10 -right-10 w-[350px] h-[350px] rounded-full border border-white/5" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full border border-white/5" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 rounded-full bg-[#EB0028]" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Core Network</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">News</h1>
          <p className="text-slate-400 text-base max-w-xl">
            Notícias, artigos técnicos e atualizações de Core Engineering.
          </p>

          <div className="mt-8 relative max-w-lg">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar matérias..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/8 text-white placeholder-slate-500 border border-white/10 rounded-xl pl-11 pr-10 py-3 text-sm focus:outline-none focus:bg-white/12 focus:border-white/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Filtro de categorias (sticky) ──────────────────────────── */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-1.5 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => handleCategory(null)}
              className={`shrink-0 text-xs font-medium px-4 py-2 rounded-full transition-all duration-150 ${!activeCategory
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
            >
              Todas
            </button>
            {CATEGORIES.map(cat => {
              const meta = catMeta(cat);
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategory(cat)}
                  className={`shrink-0 flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full transition-all duration-150 ${isActive ? meta.activeBtn : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-white' : meta.dot}`} />
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        {!loading && featured && (
          <div className="mb-10">
            <HeroCard article={featured} />
          </div>
        )}
        {loading && (
          <div className="mb-10 bg-slate-800/40 rounded-2xl min-h-[420px] animate-pulse" />
        )}

        <div className="flex gap-8 items-start">

          {/* ── Grid de artigos ───────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : gridArticles.length === 0 ? (
              <div className="text-center py-24">
                <svg className="w-14 h-14 mx-auto mb-4 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
                </svg>
                <p className="font-semibold text-slate-400">Nenhuma matéria encontrada</p>
                {(activeCategory || debouncedSearch) && (
                  <button
                    onClick={() => { setActiveCategory(null); setSearch(''); }}
                    className="mt-3 text-xs text-[#EB0028] hover:underline"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {gridArticles.map(a => <ArticleCard key={a.id} article={a} />)}
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 mt-10">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-slate-200"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${p === page
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'text-slate-500 hover:bg-white hover:text-slate-700 border border-transparent hover:border-slate-200'
                          }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-slate-200"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Sidebar ───────────────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col gap-4 w-72 shrink-0">

            {/* CTA Newsletter */}
            <div className="bg-slate-900 rounded-xl p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-[#EB0028]/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-[#EB0028]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </div>
              <p className="text-white text-sm font-semibold mb-1">Newsletter CNE</p>
              <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                Receba as principais novidades diretamente no seu e-mail.
              </p>
              <Link
                to="/newsletter"
                className="block w-full bg-[#EB0028] text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-red-700 transition-colors"
              >
                Inscrever-se
              </Link>
            </div>

            {/* Em Alta */}
            {topArticles.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-100 p-4">
                <div className="flex items-center gap-2 mb-0.5">
                  <svg className="w-4 h-4 text-[#EB0028]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                  </svg>
                  <h3 className="text-sm font-bold text-slate-800">Em Alta</h3>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">Mais lidas da semana</p>
                {topArticles.slice(0, 5).map((a, i) => (
                  <TopCard key={a.id} article={a} rank={i + 1} />
                ))}
              </div>
            )}

            {/* Filtro rápido por categoria */}
            {/* <div className="bg-white rounded-xl border border-slate-100 p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Categorias</h3>
              <div className="flex flex-col gap-1">
                {CATEGORIES.map(cat => {
                  const meta = catMeta(cat);
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategory(isActive ? null : cat)}
                      className={`flex items-center gap-2.5 text-xs font-medium px-3 py-2 rounded-lg text-left transition-all ${
                        isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-white' : meta.dot}`} />
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div> */}
          </aside>
        </div>
      </div>
    </div>
  );
}
