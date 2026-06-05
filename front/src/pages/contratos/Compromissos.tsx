import { useState, useEffect, useMemo } from 'react';

interface CompromissoRow {
  objeto: string;
  owner: string;
  cw: string;
  compromisso: string;
  data_po: string;
  prazo_pagamento: string;
  prazo_pagamento2: string;
  prazo_nf_fs: string;
  prazo_po: string;
  valor: number;
}

interface Upload {
  id: number;
  label: string;
  rows: CompromissoRow[];
  uploadedAt: string;
}

interface ObjGroup {
  objeto: string;
  rows: CompromissoRow[];
  total: number;
}

function brl(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
}

const CHILD_COLS: { key: keyof CompromissoRow; label: string; mono?: boolean; right?: boolean }[] = [
  { key: 'cw',               label: 'CW',               mono: true               },
  { key: 'compromisso',      label: 'Compromisso'                                 },
  { key: 'data_po',          label: 'Data PO'                                     },
  { key: 'prazo_pagamento',  label: 'Prazo Pagamento'                             },
  { key: 'prazo_pagamento2', label: 'Prazo Pagamento 2'                           },
  { key: 'prazo_nf_fs',      label: 'Prazo NF-FS'                                 },
  { key: 'prazo_po',         label: 'Prazo PO'                                    },
  { key: 'valor',            label: 'Valor',             mono: true, right: true  },
];

function ObjAccordion({ group, index }: { group: ObjGroup; index: number }) {
  const [open, setOpen] = useState(false);
  const pct = index / 10;
  const hue = Math.round(220 + pct * 40);

  return (
    <div className={`rounded-xl border overflow-hidden transition-shadow ${open ? 'border-slate-300 shadow-md' : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'}`}>

      {/* Parent row */}
      <button
        onClick={() => setOpen(p => !p)}
        className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors cursor-pointer ${open ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-50'}`}
      >
        {/* Color dot */}
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: open ? '#EB0028' : `hsl(${hue},60%,50%)` }}
        />

        {/* Nome */}
        <span className={`flex-1 font-semibold text-base truncate ${open ? 'text-white' : 'text-slate-800'}`}>
          {group.objeto}
        </span>

        {/* Badge ocorrências */}
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full tabular-nums ${
          open ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
        }`}>
          {group.rows.length} {group.rows.length === 1 ? 'item' : 'itens'}
        </span>

        {/* Valor */}
        <span className={`shrink-0 font-mono font-bold text-base tabular-nums min-w-44 text-right ${open ? 'text-white' : 'text-slate-800'}`}>
          {brl(group.total)}
        </span>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180 text-white/70' : 'text-slate-400'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>

      {/* Child table */}
      {open && (
        <div className="overflow-auto max-h-[32rem] border-t border-slate-200">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-100 border-b border-slate-200 shadow-sm">
                {CHILD_COLS.map(col => (
                  <th
                    key={col.key}
                    className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap ${col.right ? 'text-right' : 'text-left'}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {group.rows.map((r, i) => (
                <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                  {CHILD_COLS.map(col => {
                    const val = r[col.key];
                    const display = col.key === 'valor' ? brl(Number(val)) : String(val || '—');
                    return (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-slate-600 whitespace-nowrap
                          ${col.mono ? 'font-mono text-xs' : ''}
                          ${col.right ? 'text-right font-semibold text-slate-800' : ''}
                        `}
                      >
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 text-white">
                <td colSpan={CHILD_COLS.length - 1} className="px-4 py-3 text-xs font-bold uppercase tracking-widest">
                  Total {group.objeto}
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold">{brl(group.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

const SORT_OPTIONS = [
  { value: 'occ_desc', label: 'Ocorrências (maior → menor)' },
  { value: 'occ_asc',  label: 'Ocorrências (menor → maior)' },
  { value: 'val_desc', label: 'Valor (maior → menor)'       },
  { value: 'val_asc',  label: 'Valor (menor → maior)'       },
  { value: 'obj_asc',  label: 'Objeto (A → Z)'              },
];

export default function Compromissos() {
  const [uploads, setUploads]         = useState<Upload[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [selectedId, setSelectedId]   = useState<number | null>(null);
  const [ownerFilter, setOwnerFilter] = useState('Todos');
  const [sortBy, setSortBy]           = useState('occ_desc');

  function fetchData() {
    setLoading(true);
    setError('');
    fetch(`${import.meta.env.VITE_API_URL}/compromissos`)
      .then(r => r.json())
      .then((d: Upload[]) => {
        setUploads(d ?? []);
        if (d?.length) setSelectedId(d[0].id);
        setLoading(false);
      })
      .catch(() => { setError('Erro ao carregar dados'); setLoading(false); });
  }

  useEffect(() => { fetchData(); }, []);

  const activeUpload = useMemo(
    () => uploads.find(u => u.id === selectedId) ?? null,
    [uploads, selectedId]
  );

  const owners = useMemo(() => {
    if (!activeUpload) return [];
    return ['Todos', ...Array.from(new Set(activeUpload.rows.map(r => r.owner).filter(Boolean))).sort()];
  }, [activeUpload]);

  const groups = useMemo((): ObjGroup[] => {
    if (!activeUpload) return [];
    const rows = ownerFilter === 'Todos'
      ? activeUpload.rows
      : activeUpload.rows.filter(r => r.owner === ownerFilter);

    const map = new Map<string, CompromissoRow[]>();
    rows.forEach(r => {
      if (!map.has(r.objeto)) map.set(r.objeto, []);
      map.get(r.objeto)!.push(r);
    });

    return Array.from(map.entries())
      .map(([objeto, rows]) => ({ objeto, rows, total: rows.reduce((s, r) => s + r.valor, 0) }))
      .sort((a, b) => {
        if (sortBy === 'occ_desc') return b.rows.length - a.rows.length;
        if (sortBy === 'occ_asc')  return a.rows.length - b.rows.length;
        if (sortBy === 'val_desc') return b.total - a.total;
        if (sortBy === 'val_asc')  return a.total - b.total;
        return a.objeto.localeCompare(b.objeto, 'pt-BR');
      });
  }, [activeUpload, ownerFilter, sortBy]);

  const totalFiltrado  = useMemo(() => groups.reduce((s, g) => s + g.total, 0), [groups]);
  const totalItens     = useMemo(() => groups.reduce((s, g) => s + g.rows.length, 0), [groups]);

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Header */}
      <div className="shrink-0 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-6 py-4 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-1 h-8 rounded-full bg-[#EB0028] shrink-0" />
            <div>
              <h1 className="text-lg font-bold text-slate-800">Painel de Compromissos · Contratos</h1>
              <p className="text-sm text-slate-400 mt-0.5">Core Network Engineering</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Recarregar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto bg-slate-50">

        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-[#EB0028] rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Carregando compromissos…</p>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && uploads.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600">Nenhum dado publicado</p>
            <p className="text-xs text-slate-400">O administrador ainda não publicou nenhum arquivo.</p>
          </div>
        )}

        {!loading && !error && uploads.length > 0 && (
          <div className="max-w-[66rem] mx-auto px-6 py-6 flex flex-col gap-6">

            {/* KPIs + filtros */}
            <div className="flex items-start gap-4 flex-wrap">

              {/* KPI cards */}
              <div className="flex gap-3 flex-wrap flex-1">
                <KpiCard label="Objetos" value={String(groups.length)} />
                <KpiCard label="Itens" value={String(totalItens)} />
                <KpiCard label="Total" value={brl(totalFiltrado)} highlight />
              </div>

              {/* Filtros */}
              <div className="flex items-end gap-3 flex-wrap shrink-0">
                {uploads.length > 1 && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-medium">Arquivo</label>
                    <select
                      value={selectedId ?? ''}
                      onChange={e => setSelectedId(Number(e.target.value))}
                      className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                    >
                      {uploads.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                    </select>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-medium">Owner</label>
                  <select
                    value={ownerFilter}
                    onChange={e => setOwnerFilter(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 min-w-40"
                  >
                    {owners.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-medium">Ordenar</label>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 min-w-52"
                  >
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Lista de acordeons */}
            {groups.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-12">Nenhum resultado para este filtro.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {groups.map((g, i) => <ObjAccordion key={g.objeto} group={g} index={i} />)}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex flex-col gap-0.5 px-4 py-3 rounded-xl border min-w-[8rem] ${
      highlight
        ? 'bg-slate-900 border-slate-800 text-white'
        : 'bg-white border-slate-200 text-slate-800'
    }`}>
      <span className={`text-xs font-medium ${highlight ? 'text-slate-400' : 'text-slate-400'}`}>{label}</span>
      <span className={`text-lg font-bold tabular-nums leading-tight ${highlight ? 'text-white' : 'text-slate-800'}`}>
        {value}
      </span>
    </div>
  );
}
