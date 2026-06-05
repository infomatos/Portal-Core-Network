import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../store/AuthContext';

interface Pending {
  id: number;
  name: string;
  matricula: string;
  email: string;
  created_at: string;
}

type Action = { id: number; type: 'approve' | 'reject' };

export default function Aprovacoes() {
  const { token } = useAuth();
  const [list, setList]       = useState<Pending[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState<Action | null>(null);

  const API = import.meta.env.VITE_API_URL;
  const headers = { Authorization: `Bearer ${token}` };

  const load = useCallback(() => {
    setLoading(true);
    fetch(`${API}/auth/pending`, { headers })
      .then(r => r.json())
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function act(id: number, type: 'approve' | 'reject') {
    setActing({ id, type });
    await fetch(`${API}/auth/users/${id}/${type === 'approve' ? 'approve' : 'reject'}`, {
      method: 'PATCH',
      headers,
    });
    setActing(null);
    load();
  }

  return (
    <div className="p-8 flex flex-col gap-6 max-w-3xl">

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Dashboard</p>
        <h1 className="text-2xl font-bold text-slate-800 mt-1">Aprovações de cadastro</h1>
        <p className="text-sm text-slate-500 mt-1">Revise e aprove ou recuse os cadastros pendentes.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-400 text-sm py-8">
          <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
          Carregando…
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 bg-white border border-slate-200 rounded-xl text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Nenhum cadastro pendente</p>
            <p className="text-xs text-slate-400 mt-0.5">Todos os usuários foram revisados.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map(user => {
            const isActing = acting?.id === user.id;
            return (
              <div key={user.id} className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-slate-500">
                    {user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Matrícula: <span className="font-mono font-medium text-slate-600">{user.matricula}</span>
                    <span className="mx-2">·</span>
                    {new Date(user.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => act(user.id, 'reject')}
                    disabled={!!acting}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {isActing && acting?.type === 'reject' ? 'Recusando…' : 'Recusar'}
                  </button>
                  <button
                    onClick={() => act(user.id, 'approve')}
                    disabled={!!acting}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {isActing && acting?.type === 'approve' ? 'Aprovando…' : 'Aprovar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
