import { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';

interface Inscrito {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export default function Inscritos() {
  const { token } = useAuth();
  const API = import.meta.env.VITE_API_URL;
  const cabecalhos = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const [inscritos, setInscritos]   = useState<Inscrito[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome]             = useState('');
  const [email, setEmail]           = useState('');
  const [adicionando, setAdicionando] = useState(false);
  const [erro, setErro]             = useState('');

  async function buscarInscritos() {
    setCarregando(true);
    try {
      const res = await fetch(`${API}/newsletter/subscribers`, { headers: cabecalhos });
      setInscritos(await res.json());
    } catch { /* silent */ }
    setCarregando(false);
  }

  useEffect(() => { buscarInscritos(); }, []);

  async function handleAdicionar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setAdicionando(true);
    try {
      const res = await fetch(`${API}/newsletter/subscribers`, {
        method: 'POST',
        headers: cabecalhos,
        body: JSON.stringify({ name: nome.trim(), email: email.trim() }),
      });
      const dados = await res.json();
      if (!res.ok) { setErro(dados.message); setAdicionando(false); return; }
      setNome(''); setEmail('');
      buscarInscritos();
    } catch { setErro('Erro ao adicionar inscrito'); }
    setAdicionando(false);
  }

  async function handleAlternarStatus(id: number, statusAtual: 'active' | 'inactive') {
    const novoStatus = statusAtual === 'active' ? 'inactive' : 'active';
    await fetch(`${API}/newsletter/subscribers/${id}/status`, {
      method: 'PATCH',
      headers: cabecalhos,
      body: JSON.stringify({ status: novoStatus }),
    });
    setInscritos(prev => prev.map(s => s.id === id ? { ...s, status: novoStatus } : s));
  }

  async function handleRemover(id: number, emailInscrito: string) {
    if (!confirm(`Remover "${emailInscrito}"?`)) return;
    await fetch(`${API}/newsletter/subscribers/${id}`, { method: 'DELETE', headers: cabecalhos });
    setInscritos(prev => prev.filter(s => s.id !== id));
  }

  const totalAtivos = inscritos.filter(s => s.status === 'active').length;

  return (
    <div className="p-8 flex flex-col gap-6">

      {/* Cabeçalho */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Inscritos</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {totalAtivos} ativo{totalAtivos !== 1 ? 's' : ''} · {inscritos.length} total
        </p>
      </div>

      {/* Formulário de adição */}
      <form onSubmit={handleAdicionar} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
        <p className="text-sm font-semibold text-slate-700">Adicionar inscrito</p>
        <div className="flex gap-3 flex-wrap">
          <input
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Nome"
            required
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-40 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="E-mail"
            required
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-48 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
          <button
            type="submit"
            disabled={adicionando}
            className="px-4 py-2 rounded-lg bg-[#EB0028] text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {adicionando ? 'Adicionando…' : 'Adicionar'}
          </button>
        </div>
        {erro && <p className="text-xs text-red-500">{erro}</p>}
      </form>

      {/* Tabela */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {carregando ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-[#EB0028] rounded-full animate-spin" />
          </div>
        ) : inscritos.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-16">Nenhum inscrito cadastrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nome</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">E-mail</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Cadastro</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inscritos.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{s.name}</td>
                  <td className="px-5 py-3.5 text-slate-500">{s.email}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleAlternarStatus(s.id, s.status)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                        s.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {s.status === 'active' ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(s.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleRemover(s.id, s.email)}
                      className="text-slate-300 hover:text-red-400 transition-colors cursor-pointer"
                      title="Remover"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
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
