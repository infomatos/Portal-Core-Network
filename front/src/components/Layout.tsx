import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import UserMenu from './UserMenu';
import MegaMenu from './MegaMenu';
import { useAuth } from '../store/AuthContext';
import { navLinks } from '../config/navLinks';
import type { ReactNode } from 'react';

type NavItem = typeof navLinks[number];

// Mede o container inteiro e desconta o MegaMenu
function NavCenter({
  megaLinks,
  regularLinks,
  pathname,
}: {
  megaLinks: NavItem[];
  regularLinks: NavItem[];
  pathname: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const megaRef     = useRef<HTMLDivElement>(null);
  const itemRefs    = useRef<(HTMLElement | null)[]>([]);
  const moreBtnRef  = useRef<HTMLDivElement>(null);
  const [hiddenFrom, setHiddenFrom]   = useState(regularLinks.length);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => { setDropdownOpen(false); }, [pathname]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const calculate = () => {
      const megaW  = (megaRef.current?.offsetWidth ?? 0) + 4; // gap-1 = 4px
      const moreW  = (moreBtnRef.current?.offsetWidth ?? 80) + 4;
      const avail  = container.offsetWidth - megaW;
      let used = 0;
      let firstHidden = regularLinks.length;
      for (let i = 0; i < regularLinks.length; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;
        used += el.offsetWidth + 4;
        if (used > avail - (i < regularLinks.length - 1 ? moreW : 0)) {
          firstHidden = i;
          break;
        }
      }
      setHiddenFrom(firstHidden);
    };
    const observer = new ResizeObserver(calculate);
    observer.observe(container);
    calculate();
    return () => observer.disconnect();
  }, [regularLinks.length]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const close = (e: MouseEvent) => {
      if (moreBtnRef.current && !moreBtnRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [dropdownOpen]);

  const cls = (active: boolean) =>
    `px-3 py-1.5 text-sm rounded transition-colors whitespace-nowrap ${
      active ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
    }`;

  return (
    <div
      ref={containerRef}
      className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-full max-w-[calc(100%-480px)] items-center justify-center gap-1"
    >
      {/* MegaMenu — ref para medir largura */}
      {megaLinks.length > 0 && (
        <div ref={megaRef} className="shrink-0">
          <MegaMenu sections={megaLinks} pathname={pathname} />
        </div>
      )}

      {/* Links regulares com overflow */}
      {regularLinks.map((link, i) => (
        <span
          key={link.to}
          ref={el => { itemRefs.current[i] = el; }}
          className={i >= hiddenFrom ? 'hidden' : 'shrink-0'}
        >
          {link.external ? (
            <a href={link.to} target="_blank" rel="noreferrer" className={cls(false)}>
              {link.label}
            </a>
          ) : (
            <NavLink
              to={link.to}
              className={({ isActive }) => cls(isActive || pathname.startsWith(link.to + '/'))}
            >
              {link.label}
            </NavLink>
          )}
        </span>
      ))}

      {hiddenFrom < regularLinks.length && (
        <div ref={moreBtnRef} className="relative shrink-0">
          <button
            onClick={() => setDropdownOpen(p => !p)}
            className={`px-3 py-1.5 text-sm rounded transition-colors whitespace-nowrap cursor-pointer ${
              dropdownOpen ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Mais ▾
          </button>
          {dropdownOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl min-w-44 py-1 z-50">
              {regularLinks.slice(hiddenFrom).map(link =>
                link.external ? (
                  <a
                    key={link.to}
                    href={link.to}
                    target="_blank"
                    rel="noreferrer"
                    className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors whitespace-nowrap"
                  >
                    {link.label} ↗
                  </a>
                ) : (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `block px-4 py-2 text-sm transition-colors whitespace-nowrap ${
                        isActive || pathname.startsWith(link.to + '/')
                          ? 'bg-slate-700 text-white font-medium'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sidebarExpanded = sidebarOpen || sidebarHovered;

  const visibleLinks = navLinks.filter(link =>
    link.public || (token && link.roles?.includes(user?.role ?? ''))
  );

  const megaLinks = visibleLinks.filter(l => l.mega);
  const regularLinks = visibleLinks.filter(l => !l.mega);

  const currentSection = visibleLinks.find(link =>
    pathname.startsWith(link.to) && link.to !== '/'
  );

  const sidebarItems = currentSection?.children ?? [];

  useEffect(() => {
    setSidebarOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="flex flex-col min-h-screen">

      {/* Top nav */}
      <nav className="relative z-10 flex items-center px-4 md:px-8 h-16 bg-slate-900 text-white shrink-0 gap-2">
        {/* Esquerda: logo */}
        <NavLink to="/" className="shrink-0 flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="TIM" className="h-8 w-auto" />
          <div className="w-px h-8 bg-slate-600" />
          <div className="flex flex-col leading-none gap-1">
            <span style={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Core Network
            </span>
            <span style={{ fontWeight: 300, fontSize: '0.65rem', color: '#EB0028', letterSpacing: '0.08em' }}>
              Engineering
            </span>
          </div>
        </NavLink>

        <NavCenter megaLinks={megaLinks} regularLinks={regularLinks} pathname={pathname} />

        {/* Direita: user menu */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {token ? (
            <UserMenu onLogout={handleLogout} />
          ) : (
            <button
              onClick={() => navigate('/login', { state: { from: pathname } })}
              className="px-3 py-1.5 text-sm border border-slate-400 rounded hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Entrar
            </button>
          )}

          {/* Hambúrguer — só mobile */}
          <button
            className="md:hidden p-1.5 rounded hover:bg-slate-700 transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            <div className="flex flex-col gap-1.5 w-5">
              <span className={`block h-0.5 bg-white transition-all duration-200 origin-center ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 bg-white transition-all duration-200 ${mobileMenuOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block h-0.5 bg-white transition-all duration-200 origin-center ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 shrink-0">
          {token && (
            <div className="px-4 py-3 text-sm text-slate-300 border-b border-slate-700">
              Olá, {user?.name}
            </div>
          )}
          <nav className="flex flex-col py-1">
            {/* Mega sections expanded inline */}
            {megaLinks.map(section => (
              <div key={section.to}>
                <NavLink
                  to={section.to}
                  className={({ isActive }) =>
                    `px-4 py-2.5 text-sm font-medium transition-colors ${
                      isActive || pathname.startsWith(section.to + '/')
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`
                  }
                >
                  {section.label}
                </NavLink>
                {section.children?.map(child =>
                  child.external ? (
                    <a
                      key={child.to}
                      href={child.to}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between px-8 py-2 text-sm text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      <span>{child.label}</span>
                      <span className="text-xs">↗</span>
                    </a>
                  ) : (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      className={({ isActive }) =>
                        `block px-8 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-slate-700 text-white font-medium'
                            : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`
                      }
                    >
                      {child.label}
                    </NavLink>
                  )
                )}
              </div>
            ))}
            {/* Links regulares */}
            {regularLinks.map(link =>
              link.external ? (
                <a
                  key={link.to}
                  href={link.to}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  {link.label} ↗
                </a>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-4 py-3 text-sm transition-colors ${
                      isActive || pathname.startsWith(link.to + '/')
                        ? 'bg-slate-700 text-white font-medium'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              )
            )}
          </nav>

          {sidebarItems.length > 0 && (
            <div className="border-t border-slate-700 py-1">
              <p className="px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                {currentSection?.label}
              </p>
              <nav className="flex flex-col">
                {sidebarItems.map(item =>
                  item.external ? (
                    <a
                      key={item.to}
                      href={item.to}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-2.5 text-sm text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      {item.label} ↗
                    </a>
                  ) : (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `px-6 py-2.5 text-sm transition-colors ${
                          isActive
                            ? 'bg-slate-700 text-white font-medium'
                            : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  )
                )}
              </nav>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 min-h-0">

        {/* Sidebar retrátil */}
        {sidebarItems.length > 0 && pathname !== currentSection?.to && (
          <aside
            className={`hidden md:block relative shrink-0 bg-slate-100 border-r border-slate-200 transition-all duration-200 ${
              sidebarExpanded ? 'w-52' : 'w-4'
            }`}
            onMouseEnter={() => setSidebarHovered(true)}
            onMouseLeave={() => setSidebarHovered(false)}
          >
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

            <div className={`py-4 overflow-hidden ${sidebarExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-150`}>
              <p className="px-4 mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400 truncate">
                {currentSection?.label}
              </p>
              <nav className="flex flex-col gap-0.5 px-2">
                {sidebarItems.map(item =>
                  item.external ? (
                    <a
                      key={item.to}
                      href={item.to}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded transition-colors truncate"
                    >
                      {item.label} ↗
                    </a>
                  ) : (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `px-3 py-2 text-sm rounded transition-colors truncate ${
                          isActive
                            ? 'bg-slate-900 text-white font-medium'
                            : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  )
                )}
              </nav>
            </div>
          </aside>
        )}

        <main className="flex-1 min-w-0 overflow-auto">
          {children}
        </main>

      </div>

      <footer className="flex items-center justify-center px-8 py-4 bg-slate-900 text-slate-400 text-sm shrink-0">
        © {new Date().getFullYear()} Portal Core Network — TIM Brasil. Todos os direitos reservados.
      </footer>

    </div>
  );
}
