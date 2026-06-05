import { useState, useRef } from 'react';

const PBI_URL = 'https://app.powerbi.com/reportEmbed?reportId=a6624afe-7a35-4675-80d8-a49c222bbdfe&autoAuth=true&ctid=57b8c96e-ac2f-4d78-a149-f1fc6817d3c4';

const META = {
  periodo: '—',
  atualizacao: '—',
  responsavel: 'CNE / Aquisições',
};

export default function StatusRFX() {
  const [loaded, setLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
    <div className="flex flex-col h-full min-h-0">

      <div className="shrink-0 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-6 py-3 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-1 h-8 rounded-full bg-[#EB0028] shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-slate-800 leading-tight truncate">
                Status RFX · Aquisições
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                Acompanhamento de status por processo RFX
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Chip label="Período" value={META.periodo} />
            <Chip label="Atualização" value={META.atualizacao} />
            <Chip label="Responsável" value={META.responsavel} />
          </div>

          <button
            onClick={toggleFullscreen}
            title={fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 border border-slate-200 rounded hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
          >
            {fullscreen ? <IconCompress /> : <IconExpand />}
            <span className="hidden sm:inline">{fullscreen ? 'Sair' : 'Tela cheia'}</span>
          </button>
        </div>
      </div>

      <div ref={wrapperRef} className="flex-1 min-h-0 relative bg-slate-50">
        {!PBI_URL ? (
          <Placeholder />
        ) : (
          <>
            {!loaded && <LoadingOverlay />}
            <iframe
              src={PBI_URL}
              title="Aquisições — Status RFX"
              allowFullScreen
              onLoad={() => setLoaded(true)}
              className="w-full h-full border-0"
            />
          </>
        )}
      </div>

    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs">
      <span className="text-slate-400">{label}:</span>
      <span className="text-slate-700 font-medium">{value}</span>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50 z-10">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-[#EB0028] rounded-full animate-spin" />
      <p className="text-sm text-slate-400">Carregando relatório…</p>
    </div>
  );
}

function Placeholder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
        <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-600">Relatório não configurado</p>
        <p className="text-xs text-slate-400 mt-1">
          Defina a constante <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">PBI_URL</code> em{' '}
          <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">StatusRFX.tsx</code>
        </p>
      </div>
    </div>
  );
}

function IconExpand() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
  );
}

function IconCompress() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
    </svg>
  );
}
