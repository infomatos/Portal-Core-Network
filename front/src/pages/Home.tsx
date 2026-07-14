import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  function handleLogout() {
    logout();
  }

  return (
    <section
      className="relative flex min-h-[calc(100vh-8rem)] items-center overflow-hidden bg-slate-950 px-6 py-24 md:px-12 lg:px-20"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.70) 46%, rgba(15, 23, 42, 0.20) 100%), url('https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      <div className="relative z-10 w-full max-w-4xl">
        <span className="mb-5 inline-flex items-center border-l-4 border-red-600 pl-4 text-sm font-semibold uppercase text-slate-200">
          TIM Brasil
        </span>

        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
          Portal Core Network Engineering
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
          Portal Unificado - acesse ferramentas, relatórios e fique por dentro das novidades de rede, tudo em um só lugar.
        </p>
        
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
          Implantação de novos elementos, desenvolvimento de serviços e projetos, garantia
          de capacidade, evolução tecnológica e eficiência operacional.
        </p>
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="mt-8 rounded border border-white/60 px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-white hover:text-slate-950 cursor-pointer"
          >
            Sair
          </button>
        ) : (
          <button
            onClick={() => navigate('/login', { state: { from: '/' } })}
            className="mt-8 rounded bg-red-600 px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-red-700 cursor-pointer"
          >
            Entrar
          </button>
        )}
      </div>
    </section>
  );
}
