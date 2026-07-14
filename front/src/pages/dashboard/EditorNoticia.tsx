import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useAuth } from '../../store/AuthContext';

const API = import.meta.env.VITE_API_URL;
const CATEGORIES = ['NFVi', 'Database', 'Packet Core', 'Voice & Signalling'] as const;
type Category = typeof CATEGORIES[number];
type ContentType = 'article' | 'presentation';

function formatBytes(bytes: number | null) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

const NewsImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: null,
        parseHTML: element => element.getAttribute('data-align'),
        renderHTML: attributes => (
          attributes.align ? { 'data-align': attributes.align } : {}
        ),
      },
      largura: {
        default: null,
        parseHTML: element => element.getAttribute('data-largura'),
        renderHTML: attributes => (
          attributes.largura
            ? { 'data-largura': attributes.largura, style: `width: ${attributes.largura}%;` }
            : {}
        ),
      },
    };
  },
});

/* ── Botão de toolbar ──────────────────────────────────────────────────── */
function ToolBtn({
  active, onClick, title, children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        active
          ? 'bg-slate-900 text-white'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
      }`}
    >
      {children}
    </button>
  );
}

/* ── Divisor de toolbar ────────────────────────────────────────────────── */
function Sep() {
  return <div className="w-px h-5 bg-slate-200 mx-1" />;
}

/* ── Toolbar TipTap ────────────────────────────────────────────────────── */
function Toolbar({ editor, onImageUpload }: { editor: any; onImageUpload: () => void }) {
  if (!editor) return null;

  const imagemSelecionada = editor.isActive('image');
  const tamanhosImagem = ['25', '50', '75', '100'];

  const addLink = () => {
    const url = window.prompt('URL do link:');
    if (url) editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
  };

  const definirLarguraImagem = (largura: string) => {
    editor.chain().focus().updateAttributes('image', { largura }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-slate-100 bg-slate-50/60">
      {/* Texto */}
      <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Negrito (Ctrl+B)">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6.75 3.75a.75.75 0 0 1 .75-.75h5.25a4.5 4.5 0 0 1 1.704 8.663 4.5 4.5 0 0 1-1.704 8.587H7.5a.75.75 0 0 1-.75-.75V3.75Zm1.5 8.25V4.5h3.75a3 3 0 0 1 0 6H8.25Zm0 1.5v6h4.5a3 3 0 0 0 0-6H8.25Z" /></svg>
      </ToolBtn>
      <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Itálico (Ctrl+I)">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 5.25a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-2.325l-3.6 12h2.175a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1 0-1.5h2.325l3.6-12H11.25a.75.75 0 0 1-.75-.75Z" /></svg>
      </ToolBtn>
      <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Sublinhado (Ctrl+U)">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M5.25 2.25a.75.75 0 0 1 .75.75v9a6 6 0 0 0 12 0V3a.75.75 0 0 1 1.5 0v9a7.5 7.5 0 0 1-15 0V3a.75.75 0 0 1 .75-.75Zm-.75 17.25a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 0 1.5H5.25a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" /></svg>
      </ToolBtn>
      <ToolBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Tachado">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M5.9 5.15C6.81 3.83 8.31 3 10.16 3c1.3 0 2.48.4 3.38 1.09a4.77 4.77 0 0 1 1.77 2.9.75.75 0 0 1-1.48.25 3.27 3.27 0 0 0-1.21-1.97C11.9 4.73 11.08 4.5 10.16 4.5c-1.28 0-2.25.55-2.77 1.31-.5.74-.57 1.6-.15 2.37.24.44.6.79 1.07 1.06H3.75a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5h-2.56a4.5 4.5 0 0 1 .31 1.64c0 1.34-.52 2.56-1.43 3.42-.91.86-2.17 1.35-3.57 1.35-1.5 0-2.8-.56-3.77-1.48-.5-.47-.89-1.03-1.15-1.64a.75.75 0 0 1 1.38-.59c.17.4.43.77.77 1.08.68.64 1.6 1.03 2.77 1.03 1.04 0 1.93-.34 2.55-.93.61-.58.95-1.38.95-2.24 0-.55-.12-1.07-.33-1.52H5.9Z" clipRule="evenodd" /></svg>
      </ToolBtn>

      <Sep />

      {/* Títulos */}
      <ToolBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Título H1">
        <span className="text-xs font-bold leading-none">H1</span>
      </ToolBtn>
      <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Título H2">
        <span className="text-xs font-bold leading-none">H2</span>
      </ToolBtn>
      <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Título H3">
        <span className="text-xs font-bold leading-none">H3</span>
      </ToolBtn>

      <Sep />

      {/* Listas */}
      <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Lista com marcadores">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      </ToolBtn>
      <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Lista numerada">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <line x1="10" y1="6"  x2="21" y2="6"  strokeLinecap="round" />
          <line x1="10" y1="12" x2="21" y2="12" strokeLinecap="round" />
          <line x1="10" y1="18" x2="21" y2="18" strokeLinecap="round" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h1v4H4m1 0H3m2 6H3.5a.5.5 0 0 1 0-1 1 1 0 0 0 0-2H4a.5.5 0 0 0 0 1M4 18h1v-1H4v-1h1" />
        </svg>
      </ToolBtn>
      <ToolBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citação">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
        </svg>
      </ToolBtn>
      <ToolBtn active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Linha horizontal">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
        </svg>
      </ToolBtn>

      <Sep />

      {/* Alinhamento */}
      <ToolBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Alinhar à esquerda">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h10.5m-10.5 5.25h16.5" />
        </svg>
      </ToolBtn>
      <ToolBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Centralizar">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M6.75 12h10.5m-13.5 5.25h16.5" />
        </svg>
      </ToolBtn>
      <ToolBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Alinhar à direita">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M9.75 12h10.5M3.75 17.25h16.5" />
        </svg>
      </ToolBtn>

      <Sep />

      {/* Link e Imagem */}
      <ToolBtn active={editor.isActive('link')} onClick={addLink} title="Inserir link">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
        </svg>
      </ToolBtn>
      <ToolBtn active={false} onClick={onImageUpload} title="Inserir imagem">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      </ToolBtn>
      <ToolBtn active={editor.isActive('image', { align: 'left' })} onClick={() => editor.chain().focus().updateAttributes('image', { align: 'left' }).run()} title="Imagem à esquerda">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h7v7H4V6Zm11 1h5M15 11h5M4 17h16" />
        </svg>
      </ToolBtn>
      <ToolBtn active={editor.isActive('image', { align: 'center' })} onClick={() => editor.chain().focus().updateAttributes('image', { align: 'center' }).run()} title="Imagem centralizada">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 6h7v7h-7V6ZM4 17h16M6 3h12" />
        </svg>
      </ToolBtn>
      <ToolBtn active={editor.isActive('image', { align: 'right' })} onClick={() => editor.chain().focus().updateAttributes('image', { align: 'right' }).run()} title="Imagem à direita">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 6h7v7h-7V6ZM4 7h5M4 11h5M4 17h16" />
        </svg>
      </ToolBtn>

      <div className="flex items-center gap-0.5 ml-1">
        {tamanhosImagem.map(largura => (
          <ToolBtn
            key={largura}
            active={editor.isActive('image', { largura })}
            onClick={() => definirLarguraImagem(largura)}
            title={imagemSelecionada ? `Imagem com ${largura}% da largura` : 'Selecione uma imagem para redimensionar'}
          >
            <span className="text-[10px] font-semibold leading-none">{largura}%</span>
          </ToolBtn>
        ))}
      </div>

      <Sep />

      {/* Desfazer / Refazer */}
      <ToolBtn active={false} onClick={() => editor.chain().focus().undo().run()} title="Desfazer (Ctrl+Z)">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
        </svg>
      </ToolBtn>
      <ToolBtn active={false} onClick={() => editor.chain().focus().redo().run()} title="Refazer (Ctrl+Y)">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
        </svg>
      </ToolBtn>
    </div>
  );
}

/* ── Editor principal ─────────────────────────────────────────────────── */
export default function EditorNoticia() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEdit = Boolean(id);

  const [title, setTitle]         = useState('');
  const [excerpt, setExcerpt]     = useState('');
  const [category, setCategory]   = useState<Category>('NFVi');
  const [coverImage, setCoverImage] = useState('');
  const [contentType, setContentType] = useState<ContentType>('article');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [pdfSize, setPdfSize] = useState<number | null>(null);
  const [featured, setFeatured]   = useState(false);
  const [status, setStatus]       = useState<'draft' | 'published'>('draft');
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      NewsImage.configure({ inline: false, allowBase64: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Comece a escrever a matéria...' }),
    ],
    editorProps: {
      attributes: { class: 'tiptap-editor' },
    },
  });

  /* Carregar matéria existente para edição */
  useEffect(() => {
    if (!id || !editor) return;
    fetch(`${API}/news/admin/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data?.title) {
          setTitle(data.title);
          setExcerpt(data.excerpt ?? '');
          setCategory(data.category ?? 'NFVi');
          setCoverImage(data.cover_image ?? '');
          setContentType(data.content_type === 'presentation' ? 'presentation' : 'article');
          setPdfUrl(data.pdf_url ?? '');
          setPdfName(data.pdf_name ?? '');
          setPdfSize(data.pdf_size ?? null);
          setFeatured(data.featured === 1);
          setStatus(data.status ?? 'draft');
          editor.commands.setContent(data.body ?? '');
        }
      })
      .catch(() => {});
  }, [id, editor, token]);

  /* Upload de imagem no corpo do editor */
  const handleEditorImageUpload = useCallback(async (file: File) => {
    if (!editor) return;
    setUploadingImg(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const r = await fetch(`${API}/news/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const { url } = await r.json();
      if (url) editor.chain().focus().setImage({ src: url }).run();
    } finally {
      setUploadingImg(false);
    }
  }, [editor, token]);

  /* Upload de imagem de capa */
  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const r = await fetch(`${API}/news/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const { url } = await r.json();
      if (url) setCoverImage(url);
    } finally {
      setUploadingCover(false);
    }
  };

  const handlePdfUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setSaveMsg('Envie um arquivo PDF.');
      return;
    }

    setUploadingPdf(true);
    setSaveMsg('');
    try {
      const form = new FormData();
      form.append('pdf', file);
      const r = await fetch(`${API}/news/upload-pdf`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await r.json();
      if (!r.ok) {
        setSaveMsg(data.message ?? 'Erro ao enviar PDF.');
        return;
      }
      setPdfUrl(data.url ?? '');
      setPdfName(data.name ?? file.name);
      setPdfSize(data.size ?? file.size);
    } catch {
      setSaveMsg('Erro ao enviar PDF.');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSave = async (targetStatus?: 'draft' | 'published') => {
    if (!title.trim()) { setSaveMsg('O título é obrigatório.'); return; }
    if (contentType === 'presentation' && !pdfUrl) { setSaveMsg('Envie o PDF da apresentação.'); return; }
    if (!editor) return;

    const body = editor.getHTML();
    const finalStatus = targetStatus ?? status;

    setSaving(true);
    setSaveMsg('');
    try {
      const payload = {
        title, excerpt,
        body: contentType === 'article' ? body : null,
        content_type: contentType,
        pdf_url: contentType === 'presentation' ? pdfUrl : null,
        pdf_name: contentType === 'presentation' ? pdfName : null,
        pdf_size: contentType === 'presentation' ? pdfSize : null,
        cover_image: coverImage || null,
        category, status: finalStatus, featured,
      };

      const url   = isEdit ? `${API}/news/${id}` : `${API}/news`;
      const method = isEdit ? 'PUT' : 'POST';

      const r = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await r.json();
      if (!r.ok) {
        setSaveMsg(data.message ?? 'Erro ao salvar.');
      } else {
        setStatus(finalStatus);
        setSaveMsg(finalStatus === 'published' ? 'Publicado com sucesso!' : 'Rascunho salvo!');
        if (!isEdit && data.id) {
          navigate(`/dashboard/noticias/${data.id}`, { replace: true });
        }
      }
    } catch {
      setSaveMsg('Erro de conexão.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3500);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-screen bg-slate-50">

      {/* ── Editor (coluna principal) ──────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* Cabeçalho */}
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
          <button
            onClick={() => navigate('/dashboard/noticias')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Notícias
          </button>
          <div className="w-px h-4 bg-slate-200" />
          <h1 className="text-sm font-semibold text-slate-700 truncate flex-1">
            {isEdit ? 'Editar matéria' : 'Nova matéria'}
          </h1>
          {saveMsg && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              saveMsg.includes('Erro') || saveMsg.includes('obrigatório')
                ? 'bg-red-50 text-red-600'
                : 'bg-emerald-50 text-emerald-600'
            }`}>
              {saveMsg}
            </span>
          )}
        </div>

        {/* Campo de título */}
        <div className="bg-white border-b border-slate-100 px-8 py-5">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título da matéria..."
            className="w-full text-2xl md:text-3xl font-bold text-slate-900 placeholder-slate-300 bg-transparent border-none outline-none resize-none"
          />
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            placeholder="Resumo / subtítulo da matéria (aparece nos cards e no artigo)..."
            rows={2}
            className="w-full mt-3 text-base text-slate-500 placeholder-slate-300 bg-transparent border-none outline-none resize-none leading-relaxed"
          />
          <div className="mt-5 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setContentType('article')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                contentType === 'article'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Matéria com texto
            </button>
            <button
              type="button"
              onClick={() => setContentType('presentation')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                contentType === 'presentation'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Apresentação PDF
            </button>
          </div>
        </div>

        {/* Toolbar + Editor */}
        <div className="flex-1 bg-white">
          {contentType === 'article' ? (
            <>
              <div className="tiptap-editor">
                <Toolbar editor={editor} onImageUpload={() => imageInputRef.current?.click()} />
                <EditorContent editor={editor} />
              </div>
              {uploadingImg && (
                <div className="flex items-center gap-2 px-5 py-2 text-xs text-slate-400">
                  <div className="animate-spin w-3 h-3 rounded-full border border-slate-300 border-t-slate-600" />
                  Carregando imagem...
                </div>
              )}
            </>
          ) : (
            <div className="p-8">
              {pdfUrl ? (
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-950 shadow-sm">
                  <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border-b border-slate-200">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{pdfName || 'Apresentação PDF'}</p>
                      <p className="text-xs text-slate-400">{formatBytes(pdfSize)} · PDF anexado</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => pdfInputRef.current?.click()}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        Trocar PDF
                      </button>
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-700"
                      >
                        Abrir
                      </a>
                    </div>
                  </div>
                  <iframe
                    title="Preview da apresentação"
                    src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`}
                    className="w-full h-[620px] bg-slate-100"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={uploadingPdf}
                  className="w-full min-h-[360px] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-4 hover:border-[#EB0028]/40 hover:bg-red-50/30 transition-all disabled:opacity-60"
                >
                  {uploadingPdf ? (
                    <div className="animate-spin w-8 h-8 rounded-full border-2 border-slate-300 border-t-[#EB0028]" />
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-[#EB0028]/10 text-[#EB0028] flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5A3.375 3.375 0 0 0 10.125 2.25H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-700">Anexar apresentação em PDF</p>
                        <p className="text-sm text-slate-400 mt-1">Use o PDF exportado do PowerPoint. Limite de 50 MB.</p>
                      </div>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) { handleEditorImageUpload(f); e.target.value = ''; }
          }}
        />
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) { handlePdfUpload(f); e.target.value = ''; }
          }}
        />
      </div>

      {/* ── Painel lateral de metadados ────────────────────────────── */}
      <aside className="lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white flex flex-col">
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Status e ações */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Publicação</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="w-full bg-[#EB0028] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && status !== 'draft' ? (
                  <div className="animate-spin w-3.5 h-3.5 rounded-full border border-white/40 border-t-white" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.338-2.32 5.75 5.75 0 0 1 .906 10.985" />
                  </svg>
                )}
                {status === 'published' ? 'Atualizar' : 'Publicar'}
              </button>
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="w-full border border-slate-200 text-slate-600 text-sm font-medium py-2 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-60"
              >
                {saving ? 'Salvando...' : 'Salvar rascunho'}
              </button>
            </div>
            {status === 'published' && (
              <p className="text-[10px] text-emerald-600 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" /></svg>
                Publicado no portal
              </p>
            )}
          </div>

          {/* Destaque */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Destaque</p>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-600">Exibir como destaque</span>
              <button
                type="button"
                onClick={() => setFeatured(v => !v)}
                className={`relative w-10 h-5.5 rounded-full transition-colors ${featured ? 'bg-[#EB0028]' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${featured ? 'translate-x-4.5' : ''}`} />
              </button>
            </label>
            <p className="text-[10px] text-slate-400 mt-1">Aparece no hero da página News</p>
          </div>

          {/* Categoria */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Categoria</p>
            <div className="flex flex-col gap-1.5">
              {CATEGORIES.map(cat => (
                <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={category === cat}
                    onChange={() => setCategory(cat)}
                    className="accent-[#EB0028]"
                  />
                  <span className={`text-xs font-medium transition-colors ${category === cat ? 'text-slate-800' : 'text-slate-500 group-hover:text-slate-700'}`}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Imagem de capa */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Imagem de Capa</p>
            {coverImage ? (
              <div className="relative rounded-lg overflow-hidden">
                <img src={coverImage} alt="Capa" className="w-full aspect-video object-cover rounded-lg" />
                <button
                  onClick={() => setCoverImage('')}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-slate-300 hover:bg-slate-100 transition-all disabled:opacity-60"
              >
                {uploadingCover ? (
                  <div className="animate-spin w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-600" />
                ) : (
                  <>
                    <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    <span className="text-xs text-slate-400">Clique para enviar</span>
                    <span className="text-[10px] text-slate-300">JPG, PNG · max 10 MB</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) { handleCoverUpload(f); e.target.value = ''; }
              }}
            />
            {!coverImage && (
              <div className="mt-2">
                <input
                  type="text"
                  value={coverImage}
                  onChange={e => setCoverImage(e.target.value)}
                  placeholder="ou cole uma URL..."
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
