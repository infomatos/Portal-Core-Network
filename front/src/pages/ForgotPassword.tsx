import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!email) return setError('Informe seu e-mail.');
    setError('');
    setLoading(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-96 flex flex-col gap-4 bg-white p-8 rounded-lg shadow text-center">
          <div className="text-4xl">📧</div>
          <h2 className="text-xl font-bold text-slate-800">Verifique seu e-mail</h2>
          <p className="text-sm text-slate-500">
            Se o e-mail informado estiver cadastrado, você receberá um link para redefinir sua senha em breve.
          </p>
          <Link to="/login" className="text-sm text-slate-700 font-medium hover:underline mt-2">
            Voltar ao login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-96 flex flex-col gap-3 bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Recuperar senha</h2>
        <p className="text-sm text-slate-500 mb-2">
          Informe seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
        </p>

        <input
          type="email"
          placeholder="E-mail corporativo"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button onClick={handleSubmit} disabled={loading}
          className="mt-1 bg-slate-900 text-white py-2 rounded hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50">
          {loading ? 'Enviando...' : 'Enviar link'}
        </button>

        <p className="text-center text-sm text-slate-500 mt-1">
          <Link to="/login" className="text-slate-800 font-medium hover:underline">Voltar ao login</Link>
        </p>
      </div>
    </div>
  );
}
