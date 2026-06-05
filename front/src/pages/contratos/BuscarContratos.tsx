import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

const API_URL = '/grafana-api';
const VTOKEN = '9749d6ff559524cb80f8a650228aefb4d4bc3f4d6e4befee7068e60271290516';

type Contract = {
  cw: string;
  report_diretoria_responsavel: string;
  report_executivo_owner: string;
  report_oc_ref: string;
  fornecedor: string;
  alias: string;
  status0: string;
  renovacao: string;
  envio_suprimentos: string;
  valor_contrato_sem_aditivos: number;
  valor_contrato: number;
  valor_consumido: number;
  competencia_inicio: string;
  competencia_fim: string;
  report_focal_opd: string;
  gerente_responsavel: string;
};

const COLUMNS: { key?: string; label: string; sortable?: boolean; numeric?: boolean; computed?: boolean }[] = [
  { key: 'cw',                            label: 'CW',                   sortable: true  },
  { key: 'report_diretoria_responsavel',   label: 'Diretoria',            sortable: true  },
  { key: 'report_executivo_owner',         label: 'Executive Owner',      sortable: true  },
  { key: 'report_oc_ref',                  label: 'OC',                   sortable: true  },
  { key: 'fornecedor',                     label: 'Fornecedor',           sortable: true  },
  { key: 'alias',                          label: 'Descrição',            sortable: true  },
  { key: 'status0',                        label: 'Status',               sortable: true  },
  { key: 'renovacao',                      label: 'Renovação',            sortable: true  },
  { key: 'envio_suprimentos',              label: 'Envio Suprimentos',    sortable: true  },
  { key: 'valor_contrato_sem_aditivos',    label: 'Contrato S/ Aditivos', sortable: true,  numeric: true },
  { key: 'valor_contrato',                 label: 'Valor Contrato',       sortable: true,  numeric: true },
  { key: 'valor_consumido',                label: 'Valor Consumido',      sortable: true,  numeric: true },
  {                                        label: 'Aditivo',              sortable: false, numeric: true, computed: true },
  {                                        label: 'Saldo',                sortable: false, numeric: true, computed: true },
  {                                        label: 'Consumo (%)',          sortable: false, computed: true },
  { key: 'competencia_inicio',             label: 'Início',               sortable: true  },
  { key: 'competencia_fim',               label: 'Fim',                  sortable: true  },
  { key: 'report_focal_opd',               label: 'Focal OPD',            sortable: true  },
  { key: 'gerente_responsavel',            label: 'Gerente',              sortable: true  },
];

function toNumber(v: unknown): number {
  const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : Number(v);
  return isNaN(n) ? 0 : n;
}

function formatCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function calculateConsumptionPercentage(consumed: number, total: number): number {
  if (!total) return 0;
  return (consumed / total) * 100;
}

const STATUS_COLORS: Record<string, string> = {
  'on going':            'bg-emerald-100 text-emerald-700',
  'contrato ok':         'bg-emerald-100 text-emerald-700',
  ativo:                 'bg-emerald-100 text-emerald-700',
  vigente:               'bg-emerald-100 text-emerald-700',
  assinado:              'bg-emerald-100 text-emerald-700',
  'não iniciado':        'bg-blue-100 text-blue-700',
  upcoming:              'bg-blue-100 text-blue-700',
  'será descontinuado':  'bg-amber-100 text-amber-700',
  'seerá descontinuado': 'bg-amber-100 text-amber-700',
  pendente:              'bg-amber-100 text-amber-700',
  renovação:             'bg-amber-100 text-amber-700',
  suspenso:              'bg-orange-100 text-orange-700',
  descontinuado:         'bg-red-100 text-red-700',
  arquivado:             'bg-slate-200 text-slate-600',
  encerrado:             'bg-red-100 text-red-700',
  vencido:               'bg-red-100 text-red-700',
  cancelado:             'bg-red-100 text-red-700',
};

function StatusBadge({ value }: { value: string }) {
  const key = value?.toLowerCase() ?? '';
  const color = Object.entries(STATUS_COLORS).find(([k]) => key.includes(k))?.[1] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-base font-medium whitespace-nowrap ${color}`}>
      {value || '—'}
    </span>
  );
}

export default function BuscarContratos() {
  const [data, setData] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [neyMelo, setNeyMelo] = useState(true);
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const thRefs = useRef<(HTMLTableCellElement | null)[]>([]);
  const PAGE_SIZE = 7;

  const startResize = useCallback((e: React.MouseEvent, colIndex: number, colKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = thRefs.current[colIndex]?.offsetWidth ?? 100;

    function onMouseMove(ev: MouseEvent) {
      const newWidth = Math.max(60, startWidth + ev.clientX - startX);
      setColWidths(prev => ({ ...prev, [colKey]: newWidth }));
    }
    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vtoken: VTOKEN }),
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        const arr = Array.isArray(json) ? json : Array.isArray(json?.queryset) ? json.queryset : [];
        setData(arr);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let result = data;
    if (neyMelo) result = result.filter(c => c.report_executivo_owner?.toLowerCase().includes('ney melo'));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => Object.values(c).some(v => String(v ?? '').toLowerCase().includes(q)));
    }
    return result;
  }, [data, search, neyMelo]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const va = (a as Record<string, unknown>)[sortKey];
      const vb = (b as Record<string, unknown>)[sortKey];
      const na = toNumber(va), nb = toNumber(vb);
      const isNum = !isNaN(na) && !isNaN(nb) && na !== 0 && nb !== 0;
      let cmp = isNum ? na - nb : String(va ?? '').localeCompare(String(vb ?? ''), 'pt-BR');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  }

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Header */}
      <div className="shrink-0 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-6 py-3 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-1 h-8 rounded-full bg-[#EB0028] shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-slate-800 leading-tight truncate">
                Buscar Contratos · Contratos
              </h1>
              <p className="text-sm text-slate-400 mt-0.5 truncate">
                Consulta e acompanhamento de contratos ativos
              </p>
            </div>
          </div>
          {!loading && !error && (
            <span className="shrink-0 text-sm text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
              {sorted.length} contrato{sorted.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto bg-slate-50">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-[#EB0028] rounded-full animate-spin" />
            <p className="text-base text-slate-400">Carregando contratos…</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div>
              <p className="text-base font-medium text-slate-700">Erro ao carregar dados</p>
              <p className="text-sm text-slate-400 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <p className="text-base text-slate-500">Nenhum contrato encontrado.</p>
          </div>
        )}

        {!loading && !error && sorted.length > 0 && (
          <div className="p-6">
            <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap mb-3">
              <div className="relative flex-1 min-w-48">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar em todos os campos…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-8 pr-3 py-2 text-base border border-slate-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 placeholder:text-slate-400"
                />
              </div>
              <button
                onClick={() => { setNeyMelo(v => !v); setPage(1); }}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-base rounded-lg border shadow-sm transition-colors ${
                  neyMelo
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                Ney Melo
                {neyMelo && <span className="ml-0.5 text-sm opacity-70">✕</span>}
              </button>
            </div>
            <div className="max-w-7xl mx-auto rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-base border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      {COLUMNS.map((col, i) => {
                        const colKey = col.key ?? col.label;
                        return (
                          <th
                            key={colKey}
                            ref={el => { thRefs.current[i] = el; }}
                            onClick={() => col.sortable && col.key && handleSort(col.key)}
                            style={colWidths[colKey] ? { minWidth: colWidths[colKey], width: colWidths[colKey] } : undefined}
                            className={`relative px-4 py-3 text-left text-base font-semibold uppercase tracking-wider whitespace-nowrap select-none border-r border-slate-700 last:border-r-0 ${
                              col.sortable ? 'cursor-pointer hover:bg-slate-700 transition-colors' : ''
                            } ${i === 0 ? 'sticky left-0 z-10 bg-slate-900' : ''}`}
                          >
                            <span className="flex items-center gap-1">
                              {col.label}
                              {col.sortable && col.key && (
                                <span className="opacity-50 text-xs">
                                  {sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                                </span>
                              )}
                            </span>
                            <div
                              className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-white/25 active:bg-white/40"
                              onMouseDown={e => startResize(e, i, colKey)}
                            />
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((c, rowIdx) => {
                      const aditivo = toNumber(c.valor_contrato) - toNumber(c.valor_contrato_sem_aditivos);
                      const saldo = toNumber(c.valor_contrato) - toNumber(c.valor_consumido);
                      const consumoPercent = calculateConsumptionPercentage(toNumber(c.valor_consumido), toNumber(c.valor_contrato));

                      return (
                        <tr
                          key={rowIdx}
                          className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-3 py-2 sticky left-0 z-10 bg-white border-r border-slate-100 font-mono text-sm text-slate-600 whitespace-nowrap hover:bg-slate-50">
                            {c.cw || '—'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-slate-600">{c.report_diretoria_responsavel || '—'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-slate-600">{c.report_executivo_owner || '—'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-slate-600">{c.report_oc_ref || '—'}</td>
                          <td className="px-3 py-2 whitespace-nowrap font-medium text-slate-700">{c.fornecedor || '—'}</td>
                          <td className="px-3 py-2 max-w-xs truncate text-slate-600" title={c.alias}>{c.alias || '—'}</td>
                          <td className="px-3 py-2 whitespace-nowrap"><StatusBadge value={c.status0} /></td>
                          <td className="px-3 py-2 whitespace-nowrap text-slate-600">{c.renovacao || '—'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-slate-600">{c.envio_suprimentos || '—'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-right font-mono text-slate-700">{formatCurrency(toNumber(c.valor_contrato_sem_aditivos))}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-right font-mono text-slate-700">{formatCurrency(toNumber(c.valor_contrato))}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-right font-mono text-slate-700">{formatCurrency(toNumber(c.valor_consumido))}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-right font-mono text-slate-600">{formatCurrency(aditivo)}</td>
                          <td className={`px-3 py-2 whitespace-nowrap text-right font-mono ${saldo < 0 ? 'text-red-600' : 'text-slate-700'}`}>{formatCurrency(saldo)}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-right">
                            <ConsumoBadge percent={consumoPercent} />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-slate-600">{c.competencia_inicio || '—'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-slate-600">{c.competencia_fim || '—'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-slate-600">{c.report_focal_opd || '—'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-slate-600">{c.gerente_responsavel || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginação */}
            <div className="max-w-7xl mx-auto mt-2">
            <div className="flex items-center justify-between px-4 py-3 border border-slate-200 rounded-xl bg-white">
              <span className="text-sm text-slate-500">
                {sorted.length === 0 ? '0 contratos' : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, sorted.length)} de ${sorted.length}`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-2.5 py-1.5 text-sm rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >«</button>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2.5 py-1.5 text-sm rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >‹</button>
                <span className="px-3 py-1.5 text-sm text-slate-700 font-medium">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2.5 py-1.5 text-sm rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >›</button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="px-2.5 py-1.5 text-sm rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >»</button>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConsumoBadge({ percent }: { percent: number }) {
  const color = percent >= 90 ? 'bg-red-100 text-red-700' : percent >= 70 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-base font-medium ${color}`}>
      {percent.toFixed(1)}%
    </span>
  );
}
