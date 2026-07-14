import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

interface ForumPostDetail {
  id: number;
  title: string;
  slug: string;
  forum_date: string;
  participants: string;
  main_topics: string;
  content: string;
  action_items: string;
  author_name: string | null;
  attachment_name: string | null;
  attachment_url: string | null;
  attachment_size: number | null;
  published_at: string | null;
  created_at: string;
}

function fmtDate(d: string | null) {
  if (!d) return '';
  const [year, month, day] = d.slice(0, 10).split('-');
  if (!year || !month || !day) return d;
  return `${day}/${month}/${year}`;
}

function fmtSize(size: number | null) {
  if (!size) return '';
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function splitTopics(value: string) {
  return value.split(/,|\n/).map(t => t.trim()).filter(Boolean);
}

interface ActionItem {
  action: string;
  responsible: string;
  done: boolean;
}

function parseActionItems(value: string): ActionItem[] {
  try {
    const items = JSON.parse(value || '[]');
    if (!Array.isArray(items)) return [];
    return items.map((item: any) => ({
      action: String(item?.action ?? ''),
      responsible: String(item?.responsible ?? ''),
      done: Boolean(item?.done),
    })).filter(item => item.action || item.responsible);
  } catch {
    return [];
  }
}

function TextBlock({ title, children }: { title: string; children: string }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">{title}</h2>
      <div className="text-slate-700 leading-relaxed whitespace-pre-line">{children}</div>
    </section>
  );
}

export default function ForumPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<ForumPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    fetch(`${API}/forum/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data?.message) setNotFound(true);
        else setPost(data);
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

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 text-slate-400">
        <p className="font-semibold text-slate-500">Registro nao encontrado</p>
        <Link to="/forum" className="text-sm text-[#EB0028] hover:underline">Voltar para Forum</Link>
      </div>
    );
  }

  const topics = splitTopics(post.main_topics);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Forum
          </button>
          <svg className="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-xs font-semibold text-slate-500 truncate">{post.title}</span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#EB0028]">Forum Core Evolution</p>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mt-3">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 mt-5 pb-8 border-b border-slate-100">
          <span>{fmtDate(post.forum_date)}</span>
          {post.author_name && <span>Autor: <strong className="text-slate-700">{post.author_name}</strong></span>}
        </div>

        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Principais temas</h2>
          <div className="flex flex-wrap gap-2">
            {topics.map(topic => (
              <span key={topic} className="text-xs font-medium text-slate-700 bg-slate-100 rounded-full px-2.5 py-1">
                {topic}
              </span>
            ))}
          </div>
        </section>

        <TextBlock title="Participantes">{post.participants}</TextBlock>
        <TextBlock title="Conteudo discutido">{post.content}</TextBlock>
        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Plano de acao</h2>
          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <div className="min-w-[560px]">
              <div className="grid grid-cols-[44px_1fr_220px] bg-slate-50 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <div className="px-3 py-2 text-center">Ok</div>
                <div className="px-3 py-2">Acao</div>
                <div className="px-3 py-2 border-l border-slate-100">Responsavel</div>
              </div>
              {parseActionItems(post.action_items).map((item, index) => (
                <div key={`${item.action}-${index}`} className="grid grid-cols-[44px_1fr_220px] border-b border-slate-100 last:border-b-0">
                  <div className="flex items-center justify-center px-3 py-3">
                    <input type="checkbox" checked={item.done} readOnly className="accent-[#EB0028]" />
                  </div>
                  <div className={`px-3 py-3 text-sm ${item.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.action}</div>
                  <div className={`px-3 py-3 text-sm border-l border-slate-100 ${item.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.responsible}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {post.attachment_url && (
          <section className="mt-10 p-4 border border-slate-200 rounded-xl bg-slate-50">
            <h2 className="text-sm font-bold text-slate-800 mb-2">Arquivo complementar</h2>
            <a
              href={post.attachment_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#EB0028] hover:underline"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94a3 3 0 1 1 4.243 4.243L8.552 18.32a1.5 1.5 0 1 1-2.121-2.121l9.192-9.193" />
              </svg>
              {post.attachment_name}
              {post.attachment_size ? <span className="text-slate-400">({fmtSize(post.attachment_size)})</span> : null}
            </a>
          </section>
        )}
      </main>
    </div>
  );
}
