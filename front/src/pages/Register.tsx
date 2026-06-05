import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name: '', matricula: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    setError('');
    setSuccess('');

    if (!form.name || !form.matricula || !form.email || !form.password || !form.confirm) {
      return setError('Preencha todos os campos.');
    }
    if (form.password !== form.confirm) {
      return setError('As senhas não coincidem.');
    }
    if (form.password.length < 6) {
      return setError('A senha deve ter pelo menos 6 caracteres.');
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, matricula: form.matricula, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message);
      setSuccess('Cadastro realizado! Aguarde a aprovação do administrador.');
      setTimeout(() => navigate('/login'), 3000);
    } catch {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-96 flex flex-col gap-3 bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Criar conta</h2>
        <p className="text-sm text-slate-500 mb-2">Preencha os dados abaixo para se cadastrar.</p>

        <input name="name" placeholder="Nome completo" value={form.name} onChange={handleChange}
          className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
        <input name="matricula" placeholder="Matrícula" value={form.matricula} onChange={handleChange}
          className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
        <input name="email" type="email" placeholder="E-mail corporativo" value={form.email} onChange={handleChange}
          className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
        <input name="password" type="password" placeholder="Senha" value={form.password} onChange={handleChange}
          className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
        <input name="confirm" type="password" placeholder="Confirmar senha" value={form.confirm} onChange={handleChange}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button onClick={handleSubmit} disabled={loading}
          className="mt-1 bg-slate-900 text-white py-2 rounded hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50">
          {loading ? 'Criando conta...' : 'Criar conta'}
        </button>

        <p className="text-center text-sm text-slate-500 mt-1">
          Já tem conta?{' '}
          <Link to="/login" className="text-slate-800 font-medium hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
