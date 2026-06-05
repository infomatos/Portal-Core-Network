import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  function handleLogout() {
    logout();
  }

  return (
    <section className="flex flex-col items-center justify-center text-center px-6 py-32 gap-6">
      <h1 className="text-5xl font-bold text-slate-800">
        Core Network Engineering
      </h1>
      <p className="text-xl text-slate-500 max-w-xl">
        Portal Unificado — acesse ferramentas, relatórios e fique por dentro das novidades de rede, tudo em um só lugar.
      </p>
      {isAuthenticated ? (
        <button
          onClick={handleLogout}
          className="mt-4 px-8 py-3 border border-slate-400 text-slate-700 text-lg rounded hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Sair
        </button>
      ) : (
        <button
          onClick={() => navigate('/login', { state: { from: '/' } })}
          className="mt-4 px-8 py-3 bg-slate-900 text-white text-lg rounded hover:bg-slate-700 transition-colors cursor-pointer"
        >
          Entrar
        </button>
      )}
    </section>
  );
}
