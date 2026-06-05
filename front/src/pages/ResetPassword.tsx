import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    if (!password || !confirm) return setError('Preencha todos os campos.');
    if (password !== confirm) return setError('As senhas não coincidem.');
    if (password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres.');

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message);
      setTimeout(() => navigate('/login'), 2000);
      setError('');
    } catch {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-96 bg-white p-8 rounded-lg shadow text-center">
          <p className="text-red-500 text-sm">Link inválido ou expirado.</p>
          <Link to="/forgot-password" className="block mt-4 text-sm text-slate-700 font-medium hover:underline">
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-96 flex flex-col gap-3 bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Nova senha</h2>
        <p className="text-sm text-slate-500 mb-2">Escolha uma nova senha para sua conta.</p>

        <input type="password" placeholder="Nova senha" value={password}
          onChange={e => setPassword(e.target.value)}
          className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
        <input type="password" placeholder="Confirmar nova senha" value={confirm}
          onChange={e => setConfirm(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button onClick={handleSubmit} disabled={loading}
          className="mt-1 bg-slate-900 text-white py-2 rounded hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50">
          {loading ? 'Salvando...' : 'Redefinir senha'}
        </button>
      </div>
    </div>
  );
}
