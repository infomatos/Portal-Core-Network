import { useState } from 'react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function Newsletter() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [mensagem, setMensagem] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setMensagem('');

    try {
      const res = await fetch(`${API}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nome.trim(), email: email.trim() }),
      });
      const dados = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus('error');
        setMensagem(dados.message || 'Nao foi possivel concluir sua inscricao.');
        return;
      }

      setNome('');
      setEmail('');
      setStatus('success');
      setMensagem('Inscricao realizada com sucesso. Voce passara a receber as novidades da CNE.');
    } catch {
      setStatus('error');
      setMensagem('Erro ao conectar com o servidor. Tente novamente em instantes.');
    }
  }

  const enviando = status === 'sending';

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-slate-900 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <Link to="/news" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Voltar para News
          </Link>
          <div className="mt-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#EB0028]">Newsletter CNE</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-white">
              Receba novidades de Core Network Engineering
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Inscreva-se para acompanhar noticias, artigos tecnicos e atualizacoes relevantes direto no seu e-mail.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Fique por dentro</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              A newsletter concentra os principais conteudos publicados no portal para facilitar o acompanhamento das novidades do time.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Nome</span>
                <input
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  required
                  disabled={enviando}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-300 disabled:bg-slate-50"
                  placeholder="Seu nome"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">E-mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={enviando}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-300 disabled:bg-slate-50"
                  placeholder="seu.email@timbrasil.com.br"
                />
              </label>

              <button
                type="submit"
                disabled={enviando}
                className="w-full rounded-lg bg-[#EB0028] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enviando ? 'Inscrevendo...' : 'Inscrever-se'}
              </button>

              {mensagem && (
                <p className={`text-sm ${status === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {mensagem}
                </p>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
