import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useState, useEffect } from 'react';

const NAV = [
  {
    to: '/dashboard',
    end: true,
    label: 'Visão Geral',
    roles: ['admin'],
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    ),
  },
  {
    to: '/dashboard/editar-master-pivot',
    end: false,
    label: 'Orçamento',
    roles: ['admin', 'moderador'],
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    to: '/dashboard/editar-compromissos',
    end: false,
    label: 'Compromissos',
    roles: ['admin', 'moderador'],
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
  {
    to: '/dashboard/usuarios',
    end: false,
    label: 'Usuários',
    roles: ['admin'],
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
  {
    to: '/dashboard/aprovacoes',
    end: false,
    label: 'Aprovações',
    roles: ['admin'],
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    to: '/dashboard/newsletter',
    end: false,
    label: 'Newsletter',
    roles: ['admin', 'moderador'],
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    to: '/dashboard/noticias',
    end: false,
    label: 'Notícias',
    roles: ['admin', 'moderador'],
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
      </svg>
    ),
  },
  {
    to: '/dashboard/inscritos',
    end: false,
    label: 'Inscritos',
    roles: ['admin'],
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
      </svg>
    ),
  },
  {
    to: '/dashboard/forum',
    end: false,
    label: 'Fórum',
    roles: ['admin'],
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-8.25 6.75V6A2.25 2.25 0 0 1 6 3.75h12A2.25 2.25 0 0 1 20.25 6v8.25A2.25 2.25 0 0 1 18 16.5H8.25L3.75 20.25Z" />
      </svg>
    ),
  },
];

export default function DashboardLayout() {
  const { user, logout, token } = useAuth();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const sidebarExpanded = sidebarOpen || sidebarHovered;

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetch(`${import.meta.env.VITE_API_URL}/auth/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then((d: any[]) => setPendingCount(Array.isArray(d) ? d.length : 0))
      .catch(() => {});
  }, [token, user?.role]);

  if (user?.role === 'moderador' && location.pathname === '/dashboard') {
    return <Navigate to="/dashboard/editar-master-pivot" replace />;
  }

  const navVisivel = NAV.filter(item => item.roles.includes(user?.role ?? ''));

  return (
    <div className="flex h-full min-h-0">

      {/* Inner sidebar */}
      <aside
        className={`relative shrink-0 border-r border-slate-200 bg-white transition-all duration-200 ${
          sidebarExpanded ? 'w-56' : 'w-4'
        }`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(prev => !prev)}
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-7 h-7 bg-white border-2 rounded-full transition-all cursor-pointer shadow-md hover:text-white hover:bg-slate-900 hover:border-slate-900"
          title={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
          style={(!sidebarOpen && !sidebarHovered)
            ? { animation: 'pulse-border 2s ease-in-out infinite', borderColor: '#EB0028', color: '#EB0028' }
            : { borderColor: '#cbd5e1', color: '#64748b' }}
        >
          <span
            className="font-bold"
            style={{ fontSize: '0.85rem', lineHeight: 1, ...((!sidebarOpen && !sidebarHovered) ? { animation: 'nudge 2s ease-in-out infinite' } : {}) }}
          >
            {sidebarOpen ? '‹' : '›'}
          </span>
        </button>

        {/* Sidebar content */}
        <div className={`flex flex-col h-full overflow-hidden transition-opacity duration-150 ${
          sidebarExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>

          {/* Brand header */}
          <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100 shrink-0">
            <div className="w-1 h-5 rounded-full bg-[#EB0028] shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-700">
                {user?.role === 'moderador' ? 'Moderador' : 'Admin'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Portal CNE</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2 overflow-y-auto">
            {navVisivel.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-medium'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`
                }
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.to === '/dashboard/aprovacoes' && pendingCount > 0 && (
                  <span className="ml-auto text-[10px] font-bold bg-[#EB0028] text-white rounded-full px-1.5 py-0.5 leading-none">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User footer */}
          <div className="px-4 py-4 border-t border-slate-100 flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-slate-600">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.matricula}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors cursor-pointer mt-0.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              Sair
            </button>
          </div>

        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 overflow-auto bg-slate-50">
        <Outlet />
      </main>

    </div>
  );
}
