import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function Login() {
  const [matricula, setMatricula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/';
  const { login } = useAuth();

  async function handleLogin() {
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricula, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      login(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    }
  }

  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-80 flex flex-col gap-3 bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Entrar</h2>
        <input
          type="text"
          placeholder="Matrícula (FXXXXXXX)"
          value={matricula}
          onChange={e => setMatricula(e.target.value)}
          className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          onClick={handleLogin}
          className="mt-1 bg-slate-900 text-white py-2 rounded hover:bg-slate-700 transition-colors cursor-pointer"
        >
          Entrar
        </button>

        <div className="flex justify-between text-sm text-slate-500 mt-1">
          <Link to="/forgot-password" className="hover:text-slate-800 hover:underline">
            Esqueci minha senha
          </Link>
          <Link to="/register" className="hover:text-slate-800 hover:underline">
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}
