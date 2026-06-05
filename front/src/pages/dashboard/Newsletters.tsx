import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

interface NewsletterItem {
  id: number;
  title: string;
  status: 'draft' | 'sent';
  created_at: string;
  sent_at: string | null;
}

export default function Newsletters() {
  const { token } = useAuth();
  const navegar = useNavigate();
  const API = import.meta.env.VITE_API_URL;
  const cabecalhos = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const [newsletters, setNewsletters] = useState<NewsletterItem[]>([]);
  const [carregando, setCarregando]   = useState(true);
  const [enviando, setEnviando]       = useState<number | null>(null);
  const [aba, setAba]                 = useState<'draft' | 'sent'>('draft');
  const [modalAberto, setModalAberto] = useState(false);
  const [duplicando, setDuplicando]   = useState<number | null>(null);

  async function buscarNewsletters() {
    setCarregando(true);
    try {
      const res = await fetch(`${API}/newsletter`, { headers: cabecalhos });
      setNewsletters(await res.json());
    } catch { /* silent */ }
    setCarregando(false);
  }

  useEffect(() => { buscarNewsletters(); }, []);

  async function handleEnviar(id: number, titulo: string) {
    if (!confirm(`Enviar a newsletter "${titulo}" para todos os inscritos ativos? Esta ação não pode ser desfeita.`)) return;
    setEnviando(id);
    try {
      const res = await fetch(`${API}/newsletter/${id}/send`, { method: 'POST', headers: cabecalhos });
      const dados = await res.json();
      alert(dados.message);
      buscarNewsletters();
    } catch { alert('Erro ao enviar newsletter'); }
    setEnviando(null);
  }

  async function handleUsarComoModelo(id: number) {
    setDuplicando(id);
    try {
      const res = await fetch(`${API}/newsletter/${id}/duplicar`, { method: 'POST', headers: cabecalhos });
      const dados = await res.json();
      setModalAberto(false);
      navegar(`/dashboard/newsletter/${dados.id}`);
    } catch {
      alert('Erro ao duplicar newsletter');
    }
    setDuplicando(null);
  }

  async function handleExcluir(id: number, titulo: string) {
    if (!confirm(`Excluir o rascunho "${titulo}"?`)) return;
    await fetch(`${API}/newsletter/${id}`, { method: 'DELETE', headers: cabecalhos });
    setNewsletters(prev => prev.filter(n => n.id !== id));
  }

  const filtradas = newsletters.filter(n => n.status === aba);

  return (
    <div className="p-8 flex flex-col gap-6">

      {/* Cabeçalho */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Newsletter</h1>
          <p className="text-sm text-slate-500 mt-0.5">{newsletters.length} newsletter{newsletters.length !== 1 ? 's' : ''} no total</p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EB0028] text-white text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nova Newsletter
        </button>
      </div>

      {/* Abas */}
      <div className="flex gap-1 border-b border-slate-200">
        {(['draft', 'sent'] as const).map(status => (
          <button
            key={status}
            onClick={() => setAba(status)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
              aba === status
                ? 'border-[#EB0028] text-[#EB0028]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {status === 'draft' ? 'Rascunhos' : 'Enviadas'}
            <span className="ml-2 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
              {newsletters.filter(n => n.status === status).length}
            </span>
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {carregando ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-[#EB0028] rounded-full animate-spin" />
          </div>
        ) : filtradas.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-16">
            {aba === 'draft' ? 'Nenhum rascunho salvo.' : 'Nenhuma newsletter enviada ainda.'}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Título</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {aba === 'draft' ? 'Criado em' : 'Enviado em'}
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtradas.map(n => (
                <tr key={n.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{n.title}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(n.status === 'sent' && n.sent_at ? n.sent_at : n.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {n.status === 'draft' && (
                        <>
                          <button
                            onClick={() => navegar(`/dashboard/newsletter/${n.id}`)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEnviar(n.id, n.title)}
                            disabled={enviando === n.id}
                            className="text-xs px-3 py-1.5 rounded-lg bg-[#EB0028] text-white font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            {enviando === n.id ? 'Enviando…' : 'Enviar'}
                          </button>
                          <button
                            onClick={() => handleExcluir(n.id, n.title)}
                            className="text-slate-300 hover:text-red-400 transition-colors cursor-pointer"
                            title="Excluir rascunho"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </>
                      )}
                      {n.status === 'sent' && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                          Enviada
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Modal — escolher modelo */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setModalAberto(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">Nova Newsletter</h2>
              <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <button
                onClick={() => { setModalAberto(false); navegar('/dashboard/newsletter/nova'); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-[#EB0028] text-[#EB0028] font-semibold text-sm hover:bg-red-50 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Começar em branco
              </button>

              {newsletters.length > 0 && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ou usar como modelo</p>
                  <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                    {newsletters.map(n => (
                      <button
                        key={n.id}
                        onClick={() => handleUsarComoModelo(n.id)}
                        disabled={duplicando === n.id}
                        className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors cursor-pointer disabled:opacity-50 text-left"
                      >
                        <span className="text-sm text-slate-700 font-medium truncate">{n.title}</span>
                        <span className={`ml-3 shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold ${
                          n.status === 'sent'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {n.status === 'sent' ? 'Enviada' : 'Rascunho'}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
