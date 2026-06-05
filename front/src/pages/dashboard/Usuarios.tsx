import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../store/AuthContext';

interface UserRow {
  id: number;
  name: string;
  matricula: string;
  email: string;
  role: 'admin' | 'user' | 'editor' | 'moderador';
  created_at: string;
}

const ROLES: UserRow['role'][] = ['admin', 'user', 'editor', 'moderador'];

const ROLE_STYLE: Record<UserRow['role'], string> = {
  admin:      'bg-red-50 text-red-700 border-red-200',
  editor:     'bg-blue-50 text-blue-700 border-blue-200',
  moderador:  'bg-amber-50 text-amber-700 border-amber-200',
  user:       'bg-slate-100 text-slate-600 border-slate-200',
};

export default function Usuarios() {
  const { token, user: me } = useAuth();
  const [rows, setRows]       = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [updating, setUpdating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ id: number; ok: boolean } | null>(null);

  const API = import.meta.env.VITE_API_URL;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/users`, { headers });
      const data = await res.json();
      setRows(data);
    } catch { /* silent */ }
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleRoleChange(id: number, role: UserRow['role']) {
    setUpdating(id);
    try {
      const res = await fetch(`${API}/auth/users/${id}/role`, {
        method: 'PATCH', headers, body: JSON.stringify({ role }),
      });
      if (res.ok) {
        setRows(prev => prev.map(u => u.id === id ? { ...u, role } : u));
        setFeedback({ id, ok: true });
      } else {
        setFeedback({ id, ok: false });
      }
    } catch {
      setFeedback({ id, ok: false });
    }
    setUpdating(null);
    setTimeout(() => setFeedback(null), 2000);
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Remover "${name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await fetch(`${API}/auth/users/${id}`, { method: 'DELETE', headers });
      setRows(prev => prev.filter(u => u.id !== id));
    } catch { /* silent */ }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.matricula.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }, [rows, search]);

  return (
    <div className="p-8 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Usuários</h1>
          <p className="text-sm text-slate-500 mt-0.5">{rows.length} {rows.length === 1 ? 'conta cadastrada' : 'contas cadastradas'}</p>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome, matrícula ou e-mail…"
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 w-72 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-[#EB0028] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-16">Nenhum usuário encontrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Usuário</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Matrícula</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">E-mail</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Cargo</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Cadastro</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">

                  {/* Name + avatar */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-slate-600">{u.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-slate-800 whitespace-nowrap">{u.name}</span>
                      {u.id === me?.id && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 border border-slate-200">você</span>
                      )}
                    </div>
                  </td>

                  {/* Matricula */}
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{u.matricula}</td>

                  {/* Email */}
                  <td className="px-5 py-3.5 text-slate-600 max-w-[14rem] truncate">{u.email}</td>

                  {/* Role */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <select
                        value={u.role}
                        disabled={u.id === me?.id || updating === u.id}
                        onChange={e => handleRoleChange(u.id, e.target.value as UserRow['role'])}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer appearance-none focus:outline-none disabled:cursor-default transition-colors ${ROLE_STYLE[u.role]}`}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      {feedback?.id === u.id && (
                        <span className={`text-xs ${feedback.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                          {feedback.ok ? '✓' : '✗'}
                        </span>
                      )}
                      {updating === u.id && (
                        <div className="w-3 h-3 border border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                      )}
                    </div>
                  </td>

                  {/* Created at */}
                  <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString('pt-BR')}
                  </td>

                  {/* Delete */}
                  <td className="px-5 py-3.5 text-right">
                    {u.id !== me?.id && (
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        className="text-slate-300 hover:text-red-400 transition-colors cursor-pointer"
                        title="Remover usuário"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
