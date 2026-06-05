import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../store/AuthContext';

interface PivotRow {
  area: string;
  macro_project: string;
  project: string;
  element_detail: string;
  orcamento: number;
}

interface UploadEntry {
  id: number;
  year: number;
  label: string;
  uploadedAt: string;
}

interface CtdItem {
  label: string;
  value: number;
}

function normalizeKey(s: string) {
  return s.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function parseExcelRows(data: ArrayBuffer): PivotRow[] {
  const wb = XLSX.read(data, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
  if (!json.length) return [];

  const keys = Object.keys(json[0]);
  const norm = keys.map(k => ({ key: k, n: normalizeKey(k) }));
  const find = (re: RegExp) => norm.find(({ n }) => re.test(n))?.key ?? '';

  const areaCol     = find(/^AREA$/);
  const macroCol    = find(/MACRO/);
  const projectCol  = find(/^PROJECT$/);
  const elementCol  = find(/^ELEMENT/);
  const orcCol      = find(/^ORCAMENTO/);

  return json
    .map(row => ({
      area:           String(row[areaCol]    ?? '').trim(),
      macro_project:  String(row[macroCol]   ?? '').trim(),
      project:        String(row[projectCol] ?? '').trim(),
      element_detail: String(row[elementCol] ?? '').trim(),
      orcamento:      Number(row[orcCol]     ?? 0),
    }))
    .filter(r => r.area && r.project && r.element_detail && r.orcamento > 0);
}

// Extrai a tabela de resumo CTD diretamente das células do Excel
function parseCtdSummary(data: ArrayBuffer): CtdItem[] {
  const wb   = XLSX.read(data, { type: 'array' });
  const ws   = wb.Sheets[wb.SheetNames[0]];
  const raw  = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null }) as unknown[][];

  // Encontra a célula com o cabeçalho da tabela CTD
  let headerRow = -1;
  let labelCol  = -1;

  for (let r = 0; r < raw.length && headerRow === -1; r++) {
    for (let c = 0; c < raw[r].length; c++) {
      const text = normalizeKey(String(raw[r][c] ?? ''));
      if (text.includes('CORE TECHNOLOGY') || text.includes('CORE TECH DEV')) {
        headerRow = r;
        labelCol  = c;
        break;
      }
    }
  }

  if (headerRow === -1) return [];

  const result: CtdItem[] = [];

  for (let r = headerRow + 1; r < raw.length; r++) {
    const rawLabel = String(raw[r][labelCol] ?? '').trim();
    if (!rawLabel) break; // linha vazia = fim da tabela

    const upper = rawLabel.toUpperCase();
    // Ignora linhas que são apenas "TOTAL" (total geral sem rótulo de área)
    if (upper === 'TOTAL') continue;
    // Captura apenas linhas que começam com "TOTAL"
    if (!upper.startsWith('TOTAL')) continue;

    // Procura o valor numérico nas colunas seguintes
    let value = 0;
    for (let dc = 1; dc <= 5; dc++) {
      const v = raw[r][labelCol + dc];
      if (typeof v === 'number' && v > 0) { value = v; break; }
    }

    result.push({ label: upper, value });
  }

  return result;
}

export default function MasterPivotEditor() {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging]     = useState(false);
  const [fileName, setFileName]     = useState('');
  const [rows, setRows]             = useState<PivotRow[]>([]);
  const [ctdSummary, setCtdSummary] = useState<CtdItem[]>([]);
  const [year, setYear]             = useState(String(new Date().getFullYear()));
  const [label, setLabel]           = useState('');
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus]         = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [uploads, setUploads]       = useState<UploadEntry[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  async function fetchUploads() {
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/pivot`);
      const data = await res.json() as { id: number; year: number; label: string; uploadedAt: string }[];
      setUploads(data.map(u => ({ id: u.id, year: u.year, label: u.label, uploadedAt: u.uploadedAt })));
    } catch { /* silent */ }
    setLoadingList(false);
  }

  useEffect(() => { fetchUploads(); }, []);

  async function parseFile(file: File) {
    const buf = await file.arrayBuffer();
    setRows(parseExcelRows(buf));
    setCtdSummary(parseCtdSummary(buf));
    setFileName(file.name);
    setStatus(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }

  function clearFile() {
    setRows([]);
    setCtdSummary([]);
    setFileName('');
    setStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handlePublish() {
    if (!rows.length || !year || !label) return;
    setPublishing(true);
    setStatus(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/pivot/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ year: Number(year), label, rows, ctd_summary: ctdSummary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStatus({ type: 'success', msg: 'Publicado com sucesso!' });
      clearFile();
      setLabel('');
      fetchUploads();
    } catch (err) {
      setStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Erro ao publicar' });
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete(id: number, lbl: string) {
    if (!confirm(`Remover "${lbl}"?`)) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/pivot/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUploads();
    } catch { /* silent */ }
  }

  const canPublish = rows.length > 0 && !!year && !!label && !publishing;

  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
        <div className="w-1 h-7 rounded-full bg-[#EB0028]" />
        <div>
          <h2 className="text-base font-semibold text-slate-800">Master Pivot</h2>
          <p className="text-xs text-slate-400 mt-0.5">Gerencie os arquivos de orçamento publicados no portal</p>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-8">

        {/* Upload */}
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Novo upload</p>

          {!rows.length ? (
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors
                ${dragging ? 'border-[#EB0028] bg-red-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50'}`}
            >
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm font-medium text-slate-500">Arraste o arquivo Excel aqui</p>
              <p className="text-xs text-slate-400">ou clique para selecionar · .xlsx, .xls</p>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) parseFile(f); }} />
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
              <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 truncate">{fileName}</p>
                <p className="text-xs text-green-600">{rows.length} linhas importadas</p>
              </div>
              <button onClick={clearFile} className="text-green-400 hover:text-green-700 cursor-pointer text-xl leading-none">×</button>
            </div>
          )}

          <div className="flex gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">Ano</label>
              <input type="number" value={year} onChange={e => setYear(e.target.value)}
                className="w-24 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                placeholder="2025" />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-slate-500 font-medium">Label</label>
              <input value={label} onChange={e => setLabel(e.target.value)}
                className="border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                placeholder="Ex: Orçamento Aprovado, FCST LE 2025" />
            </div>
            <button onClick={handlePublish} disabled={!canPublish}
              className="px-5 py-2 bg-slate-900 text-white text-sm rounded hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              {publishing ? 'Publicando…' : 'Publicar'}
            </button>
          </div>

          {status && (
            <p className={`text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{status.msg}</p>
          )}
        </div>

        {/* List */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Publicações</p>
          {loadingList ? (
            <p className="text-sm text-slate-400">Carregando…</p>
          ) : uploads.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum arquivo publicado ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {uploads.map(u => (
                <div key={u.id} className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{u.label}</p>
                    <p className="text-xs text-slate-400">{u.year} · {new Date(u.uploadedAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <button onClick={() => handleDelete(u.id, u.label)}
                    className="text-slate-300 hover:text-red-400 cursor-pointer transition-colors text-xl leading-none" title="Remover">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
