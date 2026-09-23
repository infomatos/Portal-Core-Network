import { useEffect, useState } from 'react';

interface PivotRow {
  area: string;
  macro_project: string;
  project: string;
  element_detail: string;
  orcamento: number;
}

interface CtdItem {
  label: string;
  value: number;
}

interface Upload {
  id: number;
  year: number;
  label: string;
  rows: PivotRow[];
  ctd_summary: CtdItem[];
  uploadedAt: string;
}

// Áreas CNE fixas, na ordem de exibição do resumo
// Para adicionar ou reordenar áreas, edite apenas este array
const CNE_KEYWORDS_ORDERED = ['nfvi', 'database', 'packet', 'voice'];

function isCNEArea(area: string): boolean {
  const lower = area.toLowerCase();
  return CNE_KEYWORDS_ORDERED.some(k => lower.includes(k));
}

function cneSortIndex(area: string): number {
  const lower = area.toLowerCase();
  const idx = CNE_KEYWORDS_ORDERED.findIndex(k => lower.includes(k));
  return idx === -1 ? 999 : idx;
}

function brl(value: number) {
  return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MasterPivot() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/pivot`)
      .then(r => r.json())
      .then(d => { setUploads(d ?? []); setLoading(false); })
      .catch(() => { setError('Erro ao carregar dados'); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-[#EB0028] rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Carregando…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-sm text-red-500">{error}</p>
    </div>
  );

  if (!uploads.length) return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
        <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0c-.621 0-1.125.504-1.125 1.125v1.5" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-600">Nenhum dado publicado</p>
      <p className="text-xs text-slate-400">O administrador ainda não publicou nenhum arquivo.</p>
    </div>
  );

  const byYear = uploads.reduce<Record<number, Upload[]>>((acc, u) => {
    (acc[u.year] ??= []).push(u);
    return acc;
  }, {});
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Header */}
      <div className="shrink-0 border-b border-slate-200 bg-white">
        <div className="flex items-center px-6 py-3 gap-3">
          <div className="w-1 h-8 rounded-full bg-[#EB0028] shrink-0" />
          <div>
            <h1 className="text-base font-semibold text-slate-800">Master Pivot · Orçamento</h1>
            <p className="text-xs text-slate-400 mt-0.5">Realização orçamentária por área e projeto</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto p-6">
        <div className="flex flex-col gap-4 max-w-6xl mx-auto">
          {years.map(year => (
            <YearAccordion key={year} year={year} uploads={byYear[year]} />
          ))}
        </div>
      </div>

    </div>
  );
}

function YearAccordion({ year, uploads }: { year: number; uploads: Upload[] }) {
  const [open, setOpen] = useState(false);
  const total = uploads.reduce((s, u) => s + u.rows.reduce((ss, r) => ss + r.orcamento, 0), 0);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <button onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white hover:bg-slate-800 transition-colors text-left cursor-pointer">
        <div className="flex items-center gap-3">
          <span className="font-bold text-xl">{year}</span>
          <span className="text-slate-400 text-base font-normal">{uploads.length} cenário{uploads.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-4">
          {/* <span className="text-base text-slate-300 font-mono">{brl(total)}</span> */}
          <span className="text-slate-400 text-base">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="flex flex-col divide-y divide-slate-100 bg-white">
          {uploads.map(u => <UploadAccordion key={u.id} upload={u} />)}
        </div>
      )}
    </div>
  );
}

function UploadAccordion({ upload }: { upload: Upload }) {
  const [open, setOpen] = useState(false);

  const total = upload.rows.reduce((s, r) => s + r.orcamento, 0);
  const areas = [...new Set(upload.rows.map(r => r.area))];
  const byArea = Object.fromEntries(areas.map(a => [a, upload.rows.filter(r => r.area === a)]));

  const cneAreas = areas.filter(isCNEArea).sort((a, b) => cneSortIndex(a) - cneSortIndex(b));
  const cneTotal = cneAreas.reduce((s, a) => s + byArea[a].reduce((ss, r) => ss + r.orcamento, 0), 0);

  // CTD: usa o resumo extraído do Excel, substituindo o valor da linha CNE pelo total calculado
  const ctdRows = upload.ctd_summary.map(item => {
    const upper = item.label.toUpperCase();
    const isCneLine = upper.includes('CORE NW') || upper.includes('CORE NETWORK ENG') || upper.includes('CNE');
    return { label: item.label, value: isCneLine ? cneTotal : item.value };
  });
  const ctdTotal = ctdRows.reduce((s, r) => s + r.value, 0);

  return (
    <div>
      <button onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 rounded-full bg-[#EB0028]" />
          <span className="font-medium text-slate-800 text-base">{upload.label}</span>
          <span className="text-sm text-slate-400">{upload.rows.length} linhas</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-base font-mono text-slate-600">{brl(total)}</span>
          <span className="text-slate-400 text-sm">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="p-5 flex flex-col gap-6">

          {/* Tabela principal */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800 text-white">
                  {['Área', 'Macro Project', 'Project', 'Element Detail', 'Orçamento'].map(h => (
                    <th key={h} className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${h === 'Orçamento' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {areas.flatMap(area => [
                  ...byArea[area].map((row, i) => (
                    <tr key={`${area}-${i}`} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} hover:bg-blue-50/20 transition-colors`}>
                      <td className="px-4 py-2 text-slate-600">{row.area}</td>
                      <td className="px-4 py-2 text-slate-500">{row.macro_project}</td>
                      <td className="px-4 py-2 text-slate-700">{row.project}</td>
                      <td className="px-4 py-2 text-slate-700">{row.element_detail}</td>
                      <td className="px-4 py-2 text-right font-mono text-slate-700">{brl(row.orcamento)}</td>
                    </tr>
                  )),
                  <tr key={`${area}-sub`} className="border-b-2 border-slate-300 bg-slate-100">
                    <td colSpan={4} className="px-4 py-2.5 font-bold text-slate-700">Total {area}</td>
                    <td className="px-4 py-2.5 text-right font-bold font-mono text-slate-800">
                      {brl(byArea[area].reduce((s, r) => s + r.orcamento, 0))}
                    </td>
                  </tr>,
                ])}
                <tr className="bg-slate-800 text-white">
                  <td colSpan={4} className="px-4 py-3 font-bold uppercase tracking-wide">Total Geral</td>
                  <td className="px-4 py-3 text-right font-bold font-mono">{brl(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cards de resumo CNE / CTD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SummaryCard
              title="Core Network Engineering"
              color="#002068"
              rows={[
                ...cneAreas.map(a => ({ label: `Total ${a}`, value: byArea[a].reduce((s, r) => s + r.orcamento, 0) })),
              ]}
              total={cneTotal}
            />
            <SummaryCard
              title="Core Technology Development"
              color="#1a5c38"
              rows={ctdRows}
              total={ctdTotal}
            />
          </div>

        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, color, rows, total }: {
  title: string;
  color: string;
  rows: { label: string; value: number }[];
  total: number;
}) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 text-white text-sm font-bold uppercase tracking-wider text-center" style={{ backgroundColor: color }}>
        {title}
      </div>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-slate-100">
              <td className="px-4 py-2.5 text-slate-600">{r.label}</td>
              <td className="px-4 py-2.5 text-right font-mono text-slate-700">{brl(r.value)}</td>
            </tr>
          ))}
          <tr className="font-bold" style={{ backgroundColor: color + '12' }}>
            <td className="px-4 py-3 text-slate-800">Total</td>
            <td className="px-4 py-3 text-right font-mono text-slate-800">{brl(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
