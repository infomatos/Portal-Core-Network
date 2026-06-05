import { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EmailEditor } from 'react-email-editor';
import { useAuth } from '../../store/AuthContext';

export default function EditorNewsletter() {
  const { id } = useParams<{ id?: string }>();
  const { token } = useAuth();
  const navegar = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  const API = import.meta.env.VITE_API_URL;
  const cabecalhos = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const [titulo, setTitulo]         = useState('');
  const [carregando, setCarregando] = useState(!!id);
  const [salvando, setSalvando]     = useState(false);
  const [designPendente, setDesignPendente] = useState<object | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/newsletter/${id}`, { headers: cabecalhos })
      .then(r => r.json())
      .then(dados => {
        setTitulo(dados.title);
        if (dados.design) setDesignPendente(JSON.parse(dados.design));
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
  }, [id]);

  function handleEditorPronto(editor: any) {
    editorRef.current = editor;

    if (designPendente) {
      editor.loadDesign(designPendente);
      setDesignPendente(null);
    }

    editor.registerCallback('image', async (arquivo: any, concluido: any) => {
      const formData = new FormData();
      formData.append('image', arquivo.attachments[0]);
      try {
        const res = await fetch(`${API}/newsletter/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const dados = await res.json();
        concluido({ progress: 100, url: dados.url });
      } catch {
        concluido({ progress: 0 });
      }
    });
  }

  useEffect(() => {
    if (!designPendente || !editorRef.current) return;
    editorRef.current.loadDesign(designPendente);
    setDesignPendente(null);
  }, [designPendente]);

  function exportarESalvar(aoSalvar: (html: string, design: string) => Promise<void>) {
    if (!editorRef.current) return;
    editorRef.current.exportHtml(async (dados: any) => {
      await aoSalvar(dados.html, JSON.stringify(dados.design));
    });
  }

  async function handleSalvarRascunho() {
    if (!titulo.trim()) { alert('Informe um título para a newsletter.'); return; }
    setSalvando(true);
    exportarESalvar(async (html, design) => {
      try {
        if (id) {
          await fetch(`${API}/newsletter/${id}`, {
            method: 'PUT', headers: cabecalhos,
            body: JSON.stringify({ title: titulo, body: html, design }),
          });
        } else {
          const res = await fetch(`${API}/newsletter`, {
            method: 'POST', headers: cabecalhos,
            body: JSON.stringify({ title: titulo, body: html, design }),
          });
          const dados = await res.json();
          navegar(`/dashboard/newsletter/${dados.id}`, { replace: true });
        }
      } catch { alert('Erro ao salvar rascunho'); }
      setSalvando(false);
    });
  }

  async function handleEnviar() {
    if (!titulo.trim()) { alert('Informe um título para a newsletter.'); return; }
    if (!confirm(`Enviar "${titulo}" para todos os inscritos ativos? Esta ação não pode ser desfeita.`)) return;
    setSalvando(true);
    exportarESalvar(async (html, design) => {
      try {
        let newsletterId = id;

        if (newsletterId) {
          await fetch(`${API}/newsletter/${newsletterId}`, {
            method: 'PUT', headers: cabecalhos,
            body: JSON.stringify({ title: titulo, body: html, design }),
          });
        } else {
          const res = await fetch(`${API}/newsletter`, {
            method: 'POST', headers: cabecalhos,
            body: JSON.stringify({ title: titulo, body: html, design }),
          });
          const dados = await res.json();
          newsletterId = dados.id;
        }

        const res = await fetch(`${API}/newsletter/${newsletterId}/send`, {
          method: 'POST', headers: cabecalhos,
        });
        const dados = await res.json();
        alert(dados.message);
        navegar('/dashboard/newsletter');
      } catch { alert('Erro ao enviar newsletter'); }
      setSalvando(false);
    });
  }

  return (
    <div className="flex flex-col">

      {/* Barra superior */}
      <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-slate-200">
        <button
          onClick={() => navegar('/dashboard/newsletter')}
          className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          title="Voltar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>

        <input
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          placeholder="Título da newsletter…"
          className="flex-1 text-sm font-medium text-slate-800 bg-transparent border-none focus:outline-none placeholder-slate-300"
        />

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSalvarRascunho}
            disabled={salvando}
            className="px-4 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {salvando ? 'Salvando…' : 'Salvar rascunho'}
          </button>
          <button
            onClick={handleEnviar}
            disabled={salvando}
            className="px-4 py-1.5 text-sm bg-[#EB0028] text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Enviar
          </button>
        </div>
      </div>

      {/* Editor — 64px nav + 56px barra superior = 120px */}
      {carregando ? (
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="w-6 h-6 border-2 border-slate-200 border-t-[#EB0028] rounded-full animate-spin" />
        </div>
      ) : (
        <EmailEditor
          onReady={handleEditorPronto}
          minHeight="calc(100vh - 120px)"
          options={{ locale: 'pt-BR', features: { imageEditor: true } }}
        />
      )}
    </div>
  );
}
