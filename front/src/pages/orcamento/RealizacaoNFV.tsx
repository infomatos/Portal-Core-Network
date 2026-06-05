import { useState, useRef } from 'react';

const REPORTS = [
  {
    id: 'realizacao',
    label: 'Realização Orçamentária',
    url: 'https://app.powerbi.com/reportEmbed?reportId=e51b576f-5314-4e3e-8dab-d9b8a8257a12&amp;autoAuth=true&amp;ctid=57b8c96e-ac2f-4d78-a149-f1fc6817d3c4',
    meta: {
      periodo: 'Jan – Abr 2025',
      atualizacao: 'Mensal',
      responsavel: 'CNE / Finanças',
    },
  },
  {
    id: 'lading',
    label: 'Lading Plan 2025',
    url: 'https://app.powerbi.com/reportEmbed?reportId=0b858528-e830-434f-9dea-bc1413c194ca&amp;autoAuth=true&amp;ctid=57b8c96e-ac2f-4d78-a149-f1fc6817d3c4',
    meta: {
      periodo: '2025',
      atualizacao: 'Semanal',
      responsavel: 'CNE / Planejamento',
    },
  },
] as const;

type ReportId = (typeof REPORTS)[number]['id'];

export default function RealizacaoNFV() {
  const [active, setActive] = useState<ReportId>('realizacao');
  const [loaded, setLoaded] = useState<Record<ReportId, boolean>>({ realizacao: false, lading: false });
  const [fullscreen, setFullscreen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const report = REPORTS.find(r => r.id === active)!;

  function selectTab(id: ReportId) {
    setActive(id);
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

  function markLoaded(id: ReportId) {
    setLoaded(prev => ({ ...prev, [id]: true }));
  }

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Header */}
      <div className="shrink-0 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-6 pt-3 pb-0 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-1 h-8 rounded-full bg-[#EB0028] shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-slate-800 leading-tight truncate">
                Realização NFV · Orçamento
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                Acompanhamento da realização orçamentária e lading plan
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Chip label="Período" value={report.meta.periodo} />
            <Chip label="Atualização" value={report.meta.atualizacao} />
            <Chip label="Responsável" value={report.meta.responsavel} />
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

        {/* Tabs */}
        <div className="flex items-end gap-0 px-6 mt-3">
          {REPORTS.map(r => (
            <button
              key={r.id}
              onClick={() => selectTab(r.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                active === r.id
                  ? 'border-[#EB0028] text-slate-800'
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* iFrames — ambos montados, apenas um visível, para não recarregar ao trocar de aba */}
      <div ref={wrapperRef} className="flex-1 min-h-0 relative bg-slate-50">
        {REPORTS.map(r => (
          <div
            key={r.id}
            className={`absolute inset-0 ${active === r.id ? 'block' : 'hidden'}`}
          >
            <>
              {!loaded[r.id] && <LoadingOverlay />}
              <iframe
                src={r.url}
                title={r.label}
                allowFullScreen
                onLoad={() => markLoaded(r.id)}
                className="w-full h-full border-0"
              />
            </>
          </div>
        ))}
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

function IconExpand() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
  );
}

function IconCompress() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
    </svg>
  );
}
