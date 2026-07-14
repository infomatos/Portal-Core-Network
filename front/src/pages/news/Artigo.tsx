import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  content_type: 'article' | 'presentation';
  pdf_url: string | null;
  pdf_name: string | null;
  pdf_size: number | null;
  cover_image: string | null;
  category: string;
  author_name: string | null;
  featured: number;
  views: number;
  read_time: number;
  published_at: string | null;
  created_at: string;
}

function catMeta(cat: string) {
  if (cat === 'NFVi')
    return { pill: 'bg-blue-500/10 text-blue-700 ring-1 ring-inset ring-blue-500/20', bar: 'bg-blue-500' };
  if (cat === 'Database')
    return { pill: 'bg-purple-500/10 text-purple-700 ring-1 ring-inset ring-purple-500/20', bar: 'bg-purple-500' };
  if (cat === 'Packet Core')
    return { pill: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-500/20', bar: 'bg-emerald-500' };
  if (cat === 'Voice & Signalling')
    return { pill: 'bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-500/20', bar: 'bg-amber-500' };
  return { pill: 'bg-slate-500/10 text-slate-600 ring-1 ring-inset ring-slate-500/20', bar: 'bg-slate-400' };
}

function isNew(d: string | null) {
  if (!d) return false;
  return Date.now() - new Date(d).getTime() < 48 * 3600 * 1000;
}

function fmtDate(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function initials(name: string | null) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function isPresentation(article: Article) {
  return article.content_type === 'presentation';
}

function PresentationExperience({
  article,
  related,
  onBack,
}: {
  article: Article;
  related: Article[];
  onBack: () => void;
}) {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(110);
  const meta = catMeta(article.category);
  const nova = isNew(article.published_at || article.created_at);

  if (!article.pdf_url) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-400">
        <p className="font-semibold text-slate-800">Apresentação sem PDF anexado</p>
        <button onClick={onBack} className="text-sm text-[#EB0028] hover:underline">Voltar</button>
      </div>
    );
  }

  const pdfSrc = `${article.pdf_url}#page=${page}&zoom=${zoom}&view=FitH&toolbar=0&navpanes=0&scrollbar=1`;

  const toggleFullscreen = () => {
    const el = document.getElementById('presentation-reader');
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        {article.cover_image && (
          <img src={article.cover_image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 blur-sm scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white/95 to-slate-100/90" />
        <div className="relative max-w-7xl mx-auto px-5 md:px-8 py-7">
          <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Voltar para News
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.pill} bg-white/95`}>{article.category}</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EB0028] text-white">Apresentação PDF</span>
              {nova && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EB0028]/10 text-[#EB0028]">Novo</span>}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight max-w-5xl text-slate-950">{article.title}</h1>
            {article.excerpt && <p className="mt-4 max-w-4xl text-base md:text-lg text-slate-600 leading-relaxed">{article.excerpt}</p>}
          </div>
        </div>
      </section>

      <main id="presentation-reader" className="bg-slate-50">
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40">Anterior</button>
              <div className="h-9 min-w-24 px-3 rounded-lg bg-slate-900 text-white text-sm font-bold flex items-center justify-center">Pág. {page}</div>
              <button type="button" onClick={() => setPage(p => p + 1)} className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50">Próxima</button>
            </div>

            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setZoom(z => Math.max(75, z - 10))} className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-lg font-bold text-slate-700 hover:bg-slate-50">-</button>
              <span className="w-14 text-center text-sm font-semibold text-slate-600">{zoom}%</span>
              <button type="button" onClick={() => setZoom(z => Math.min(200, z + 10))} className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-lg font-bold text-slate-700 hover:bg-slate-50">+</button>
              <button type="button" onClick={() => setZoom(110)} className="hidden sm:inline-flex h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50">Ajustar</button>
              <button type="button" onClick={toggleFullscreen} className="h-9 px-3 rounded-lg bg-[#EB0028] text-sm font-semibold text-white hover:bg-red-700">Tela cheia</button>
              <a href={article.pdf_url} target="_blank" rel="noreferrer" className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center">Abrir PDF</a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 md:px-8 py-5">
          <div className="rounded-xl md:rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
            <iframe key={pdfSrc} title={article.title} src={pdfSrc} className="w-full h-[calc(100vh-5.5rem)] min-h-[620px] bg-slate-100" />
          </div>
        </div>
      </main>

      {related.length > 0 && (
        <section className="border-t border-slate-200 bg-white py-10">
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <div className="flex items-center gap-2 mb-5">
              <div className={`w-1 h-5 rounded-full ${meta.bar}`} />
              <h2 className="text-base font-bold text-slate-800">Conteúdos relacionados</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map(a => <RelCard key={a.id} article={a} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
function RelCard({ article }: { article: Article }) {
  const meta = catMeta(article.category);
  return (
    <Link
      to={`/news/${article.slug}`}
      className="group flex flex-col bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative overflow-hidden bg-slate-100 aspect-video">
        {article.cover_image ? (
          <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-50" />
        )}
        <div className="absolute top-2 left-2">
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.pill} bg-white/90`}>{article.category}</span>
            {isPresentation(article) && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EB0028]/10 text-[#EB0028] bg-white/90">PDF</span>
            )}
          </div>
        </div>
      </div>
      <div className="p-3">
        <h4 className="text-xs font-semibold text-slate-800 line-clamp-2 group-hover:text-[#EB0028] transition-colors leading-snug">
          {article.title}
        </h4>
        <p className="text-[11px] text-slate-400 mt-1.5">
          {new Date(article.published_at || article.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          {' · '}{isPresentation(article) ? 'PDF' : `${article.read_time}m`}
        </p>
      </div>
    </Link>
  );
}

/* Página do artigo */
export default function Artigo() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [artigo, setArtigo] = useState<Article | null>(null);
  const [relacionadas, setRelacionadas] = useState<Article[]>([])
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    setLoading(true);
    setNotFound(false);

    Promise.all([
      fetch(`${API}/news/${slug}`).then(r => r.json()),
      fetch(`${API}/news/relacionadas/${slug}`).then(r => r.json()),
    ])
      .then(([article, related]) => {
        if (article?.message) {
          setNotFound(true);
        } else {
          setArtigo(article);
          setRelacionadas(Array.isArray(related) ? related : []);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 rounded-full border-2 border-slate-200 border-t-slate-700" />
      </div>
    );
  }

  if (notFound || !artigo) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 text-slate-400">
        <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <p className="font-semibold text-slate-500">Matéria não encontrada</p>
        <Link to="/news" className="text-sm text-[#EB0028] hover:underline">← Voltar para News</Link>
      </div>
    );
  }

  const meta = catMeta(artigo.category);
  const nova = isNew(artigo.published_at || artigo.created_at);

  if (isPresentation(artigo)) {
    return (
      <PresentationExperience
        article={artigo}
        related={relacionadas}
        onBack={() => navigate(-1)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Imagem de capa */}
      {artigo.cover_image && (
        <div className="w-full max-h-[500px] overflow-hidden bg-slate-100">
          <img
            src={artigo.cover_image}
            alt={artigo.title}
            className="w-full h-full object-cover max-h-[500px]"
          />
        </div>
      )}

      {/* Barra de navegação / breadcrumb */}
      {/* <div className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            News
          </button>
          <svg className="w-3 h-3 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.pill}`}>{artigo.category}</span>
        </div>
      </div> */}

      {/*  Conteúdo principal */}
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.pill}`}>{artigo.category}</span>
          {nova && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EB0028]/10 text-[#EB0028]">Novo</span>
          )}
        </div>

        {/* Ti­tulo */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4">
          {artigo.title}
        </h1>

        {/* Resumo com destaque */}
        {artigo.excerpt && (
          <p className="text-lg text-slate-500 leading-relaxed mb-6 pl-4 border-l-[3px] border-[#EB0028]">
            {artigo.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400 pb-8 border-b border-slate-100">
          {artigo.author_name && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                {initials(artigo.author_name)}
              </div>
              <span className="text-slate-600 font-medium">{artigo.author_name}</span>
            </div>
          )}
          <span className="text-slate-200">·</span>
          <span>{fmtDate(artigo.published_at)}</span>
          <span className="text-slate-200">·</span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {artigo.read_time} min de leitura
          </span>
          <span className="text-slate-200">·</span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            {artigo.views.toLocaleString('pt-BR')} visualizações
          </span>
        </div>

        {/* Corpo do artigo */}
        {artigo.body && (
          <div
            className="article-body mt-8"
            dangerouslySetInnerHTML={{ __html: artigo.body }}
          />
        )}

        {/* Rodapé de navegação */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Voltar
          </button>
          <Link
            to="/news"
            className="flex items-center gap-2 text-sm font-medium text-[#EB0028] hover:underline"
          >
            Ver todas as matérias
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/*  Notícias relacionadas  */}
      {relacionadas.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50 py-12">
          <div className="max-w-3xl mx-auto px-6">
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-1 h-5 rounded-full ${meta.bar}`} />
              <h2 className="text-base font-bold text-slate-800">Notícias relacionadas</h2>
              <span className="text-xs text-slate-400 ml-1">— {artigo.category}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relacionadas.map(a => <RelCard key={a.id} article={a} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

