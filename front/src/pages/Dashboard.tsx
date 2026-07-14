import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

interface UploadEntry { id: number; label: string; uploadedAt: string; }

interface PortalStats {
  logins: number;
  visitas: number;
  total: number;
  topPage: { path: string; total: number } | null;
  users: { total: number; active: number; pending: number; rejected: number };
  newsletters: { total: number; sent: number; draft: number };
  subscribers: { total: number; active: number; inactive: number };
  news: { total: number; published: number; draft: number; views: number };
  forum: { total: number; published: number; draft: number };
}

const PATH_LABELS: Record<string, string> = {
  '/': 'Home',
  '/orcamento': 'Orçamento',
  '/orcamento/visao-geral': 'Orçamento · Visão Geral',
  '/orcamento/realizacao-nfv': 'Orçamento · Realização NFV',
  '/orcamento/master-pivot': 'Orçamento · Master Pivot',
  '/aquisicoes': 'Aquisições',
  '/aquisicoes/visao-geral': 'Aquisições · Visão Geral',
  '/aquisicoes/status-rfx': 'Aquisições · Status RFX',
  '/aquisicoes/orcamento-rfx': 'Aquisições · Orçamento RFX',
  '/contratos': 'Contratos',
  '/contratos/visao-geral': 'Contratos · Visão Geral',
  '/contratos/buscar-contratos': 'Contratos · Buscar Contratos',
  '/contratos/compromissos': 'Contratos · Compromissos',
  '/contratos/oss2cloud': 'Contratos · OSS2Cloud',
  '/dashboard': 'Dashboard',
};

function pathLabel(path: string) {
  return PATH_LABELS[path] ?? path;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'hoje';
  if (days === 1) return 'ontem';
  return `há ${days} dias`;
}

function StatCard({ icon, value, label, sub }: {
  icon: React.ReactNode; value: string; label: string; sub?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4">
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-slate-800 tabular-nums leading-tight">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function ModuleCard({ to, title, description, count, lastUpdate, icon }: {
  to: string; title: string; description: string;
  count: number | null; lastUpdate: string | null; icon: React.ReactNode;
}) {
  return (
    <Link to={to} className="group bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 hover:border-slate-400 hover:shadow-sm transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-200 shrink-0">
          {icon}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${count != null && count > 0
            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
            : 'text-slate-400 bg-slate-50 border-slate-200'
          }`}>
          {count != null ? `${count} publicação${count !== 1 ? 'ões' : ''}` : '—'}
        </span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 leading-relaxed mt-1">{description}</p>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-xs text-slate-400">
          {lastUpdate ? `Atualizado ${timeAgo(lastUpdate)}` : 'Sem publicações'}
        </span>
        <span className="text-xs font-medium text-slate-400 group-hover:text-slate-800 transition-colors flex items-center gap-1">
          Editar
          <svg className="w-3 h-3 -translate-x-0.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PortalStats | null>(null);
  const [pivot, setPivot] = useState<UploadEntry[]>([]);
  const [compromissos, setCompromissos] = useState<UploadEntry[]>([]);

  const API = import.meta.env.VITE_API_URL;
  const authHeader = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  useEffect(() => {
    fetch(`${API}/auth/stats`, { headers: authHeader })
      .then(r => r.json()).then((d: any) => setStats({
        logins: d.logins ?? 0,
        visitas: d.visitas ?? 0,
        total: d.total ?? 0,
        topPage: d.topPage ?? null,
        users: {
          total: d.users?.total ?? 0,
          active: d.users?.active ?? 0,
          pending: d.users?.pending ?? 0,
          rejected: d.users?.rejected ?? 0,
        },
        newsletters: {
          total: d.newsletters?.total ?? 0,
          sent: d.newsletters?.sent ?? 0,
          draft: d.newsletters?.draft ?? 0,
        },
        subscribers: {
          total: d.subscribers?.total ?? 0,
          active: d.subscribers?.active ?? 0,
          inactive: d.subscribers?.inactive ?? 0,
        },
        news: {
          total: d.news?.total ?? 0,
          published: d.news?.published ?? 0,
          draft: d.news?.draft ?? 0,
          views: d.news?.views ?? 0,
        },
        forum: {
          total: d.forum?.total ?? 0,
          published: d.forum?.published ?? 0,
          draft: d.forum?.draft ?? 0,
        },
      }))
      .catch(() => setStats(null));

    fetch(`${API}/pivot`)
      .then(r => r.json()).then(setPivot).catch(() => setPivot([]));

    fetch(`${API}/compromissos`)
      .then(r => r.json()).then(setCompromissos).catch(() => setCompromissos([]));
  }, []);

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const hora = new Date().getHours();
  const saudacao =
    hora < 12 ? 'Bom dia' :
      hora < 18 ? 'Boa tarde' :
        'Boa noite';
  const pivotLast = pivot[0]?.uploadedAt ?? null;
  const compLast = compromissos[0]?.uploadedAt ?? null;

  return (
    <div className="p-8 flex flex-col gap-8 max-w-4xl">

      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 capitalize">{today}</p>
        <h1 className="text-2xl font-bold text-slate-800 mt-1">
          {saudacao}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-slate-500 mt-1">Aqui está um resumo do estado atual do portal.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          }
          value={stats != null ? String(stats.users.total) : '—'}
          label="Usuários cadastrados"
          sub={stats != null ? `${stats.users.active} ativos · ${stats.users.pending} pendentes` : undefined}
        />
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          }
          value={stats != null ? String(stats.total) : '—'}
          label="Acessos ao portal"
          sub={stats != null ? `${stats.logins} logins · ${stats.visitas} visitas` : undefined}
        />
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          }
          value={stats != null ? String(stats.newsletters.sent) : '—'}
          label="Newsletters enviadas"
          sub={stats != null ? `${stats.newsletters.draft} rascunhos · ${stats.newsletters.total} total` : undefined}
        />
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a5.971 5.971 0 0 0-.94 3.197m0 0a9.094 9.094 0 0 1-3.742-.479 3 3 0 0 1 4.682-2.72M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          }
          value={stats != null ? String(stats.subscribers.active) : '—'}
          label="Inscritos ativos"
          sub={stats != null ? `${stats.subscribers.total} inscritos no total` : undefined}
        />
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
            </svg>
          }
          value={stats != null ? String(stats.news.published) : '—'}
          label="Notícias publicadas"
          sub={stats != null ? `${stats.news.draft} rascunhos · ${stats.news.views} leituras` : undefined}
        />
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.674.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.17 48.17 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
          }
          value={stats != null ? String(stats.forum.published) : '—'}
          label="Fóruns publicados"
          sub={stats != null ? `${stats.forum.draft} rascunhos · ${stats.forum.total} total` : undefined}
        />
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          }
          value={pivot.length > 0 ? String(pivot.length) : '—'}
          label="Uploads de orçamento"
          sub={pivotLast ? `último ${timeAgo(pivotLast)}` : 'nenhum ainda'}
        />
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          }
          value={compromissos.length > 0 ? String(compromissos.length) : '—'}
          label="Uploads de compromissos"
          sub={compLast ? `último ${timeAgo(compLast)}` : 'nenhum ainda'}
        />
      </div>

      {/* Top page */}
      {stats?.topPage && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-5">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Página mais acessada</p>
            <p className="text-base font-bold text-slate-800 truncate">{pathLabel(stats.topPage.path)}</p>
            <p className="text-xs font-mono text-slate-400 mt-0.5">{stats.topPage.path}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-bold text-slate-800 tabular-nums">{stats.topPage.total}</p>
            <p className="text-xs text-slate-400">acessos</p>
          </div>
        </div>
      )}

      {/* Modules */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Módulos gerenciáveis</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModuleCard
            to="/dashboard/editar-master-pivot"
            title="Master Pivot — Orçamento"
            description="Publique arquivos Excel do Master Pivot para alimentar os painéis de orçamento e realização NFV."
            count={pivot.length}
            lastUpdate={pivotLast}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            }
          />
          <ModuleCard
            to="/dashboard/editar-compromissos"
            title="Compromissos — Contratos"
            description="Gerencie os arquivos de compromissos contratuais exibidos no painel de contratos da CNE."
            count={compromissos.length}
            lastUpdate={compLast}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            }
          />
        </div>
      </div>

    </div>
  );
}
