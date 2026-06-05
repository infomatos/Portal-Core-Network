import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

function AcessoRestrito() {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => navigate('/'), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
      <h2 className="text-2xl font-bold text-slate-800">Acesso restrito</h2>
      <p className="text-slate-500">Você não tem permissão para acessar esta página.</p>
      <p className="text-slate-400 text-sm">Redirecionando para a página inicial...</p>
    </div>
  );
}

interface ProtectedRouteProps {
  roles?: string[];
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { token, user } = useAuth();
  const { pathname } = useLocation();

  if (!token) return <Navigate to="/login" state={{ from: pathname }} replace />;
  if (roles && !roles.includes(user?.role ?? '')) return <AcessoRestrito />;

  return <Outlet />;
}
