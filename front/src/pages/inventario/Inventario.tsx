import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { inventoryPbis } from './inventoryData';

export default function Inventario() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeSlug = getInventorySlug(location.pathname);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [selectedSlug, setSelectedSlug] = useState(() => getValidSlug(routeSlug));
  const [loaded, setLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const reportNotFound = Boolean(routeSlug) && !getValidSlug(routeSlug);

  const activeItem = useMemo(
    () => inventoryPbis.find(item => item.slug === selectedSlug),
    [selectedSlug],
  );

  useEffect(() => {
    setSelectedSlug(getValidSlug(routeSlug));
  }, [routeSlug]);

  useEffect(() => {
    setLoaded(false);
  }, [activeItem?.slug]);

  function selectReport(slug: string) {
    setSelectedSlug(slug);
    navigate(`/inventario/${slug}`);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 text-slate-900">
      <header className="shrink-0 border-b border-slate-200 bg-white">
        <div className="px-5 py-4 sm:px-6">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-[#EB0028]" />
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Inventário NFVi</span>
              </div>
              <h1 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
                Central de relatórios de infraestrutura
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Selecione um PBI e navegue entre os relatórios sem sair da tela.
              </p>
            </div>

            <button
              onClick={toggleFullscreen}
              title={fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
              className="flex h-9 shrink-0 items-center justify-center gap-2 border border-slate-200 px-3 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
            >
              {fullscreen ? <IconCompress /> : <IconExpand />}
              <span>{fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {inventoryPbis.map(item => {
              const active = item.slug === activeItem?.slug;

              return (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => selectReport(item.slug)}
                  className={`group flex min-h-28 cursor-pointer items-stretch border text-left transition-all duration-200 ${
                    active
                      ? 'border-slate-900 bg-slate-900 text-white shadow-lg ring-2 ring-slate-900/10'
                      : 'border-slate-200 bg-white text-slate-900 hover:border-slate-400 hover:shadow-sm'
                  }`}
                >
                  <span className="w-1 shrink-0" style={{ backgroundColor: item.accent }} />
                  <span className="flex min-w-0 flex-1 flex-col justify-between p-4">
                    <span className="flex items-start justify-between gap-3">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center ${active ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-600'}`}>
                        {item.icon}
                      </span>
                      <span className={`text-[11px] font-semibold uppercase tracking-wider ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                        Power BI
                      </span>
                    </span>
                    <span className="mt-4 min-w-0">
                      <span className="block truncate text-base font-bold">{item.title}</span>
                      <span className={`mt-1 block truncate text-xs ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                        {item.signal}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <section className="flex min-h-0 flex-1 flex-col px-5 py-5 sm:px-6">
        {activeItem && (
          <div className="mb-3 flex shrink-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center text-white" style={{ backgroundColor: activeItem.accent }}>
                {activeItem.icon}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-slate-800">
                  {activeItem.title} · Inventário
                </h2>
                <p className="truncate text-xs text-slate-400">{activeItem.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeItem.metrics.map(metric => (
                <span key={metric} className="border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-500">
                  {metric}
                </span>
              ))}
            </div>
          </div>
        )}

        <div ref={wrapperRef} className="relative min-h-[520px] flex-1 overflow-hidden border border-slate-200 bg-white shadow-sm">
          {reportNotFound ? (
            <NotFoundPlaceholder />
          ) : !activeItem ? (
            <IntroPlaceholder onSelect={selectReport} />
          ) : !activeItem.url ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center border border-slate-200 bg-slate-50 text-slate-400">
                {activeItem.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Relatório não configurado</p>
                <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-400">
                  Ao preencher a URL do Power BI para {activeItem.title}, o relatório será aberto aqui nesta mesma área.
                </p>
              </div>
            </div>
          ) : (
            <>
              {!loaded && <LoadingOverlay />}
              <iframe
                key={activeItem.slug}
                src={activeItem.url}
                title={`Inventário · ${activeItem.title}`}
                allowFullScreen
                onLoad={() => setLoaded(true)}
                className="h-full w-full border-0"
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function getInventorySlug(pathname: string) {
  const [, , slug] = pathname.split('/');
  return slug ?? '';
}

function getValidSlug(slug: string) {
  return inventoryPbis.some(item => item.slug === slug) ? slug : '';
}

function IntroPlaceholder({ onSelect }: { onSelect: (slug: string) => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-3xl border border-slate-200 bg-slate-50 p-6 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center bg-slate-900 text-white">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5M3.75 12h16.5M3.75 18.75h16.5" />
          </svg>
        </div>
        <p className="text-base font-semibold text-slate-800">Selecione um relatório para começar</p>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
          Escolha Hardware, Storage, Switch ou Backup nos cards acima. O Power BI será aberto aqui,
          mantendo a navegação direta entre os painéis.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {inventoryPbis.map(item => (
            <button
              key={item.slug}
              type="button"
              onClick={() => onSelect(item.slug)}
              className="border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
            >
              {item.shortTitle}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotFoundPlaceholder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center border border-slate-200 bg-slate-50 text-slate-400">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M10.29 3.86 1.82 18a1.5 1.5 0 0 0 1.29 2.25h17.78A1.5 1.5 0 0 0 22.18 18L13.71 3.86a1.5 1.5 0 0 0-2.42 0Z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700">Nenhum relatório foi encontrado</p>
        <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-400">
          Selecione Hardware, Storage, Switch ou Backup para abrir um painel válido.
        </p>
      </div>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#EB0028]" />
      <p className="text-sm text-slate-400">Carregando relatório...</p>
    </div>
  );
}

function IconExpand() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
  );
}

function IconCompress() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
    </svg>
  );
}
