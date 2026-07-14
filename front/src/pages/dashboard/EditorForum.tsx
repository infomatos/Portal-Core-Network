import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

const API = import.meta.env.VITE_API_URL;

interface ForumPost {
  title: string;
  forum_date: string;
  participants: string;
  main_topics: string;
  content: string;
  action_items: string;
  status: 'draft' | 'published';
  attachment_name: string | null;
  attachment_size: number | null;
}

const ACCEPT = '.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png';

interface ActionItem {
  action: string;
  responsible: string;
  done: boolean;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function fmtSize(size: number | null) {
  if (!size) return '';
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default function EditorForum() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const actionInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [forumDate, setForumDate] = useState(today());
  const [participants, setParticipants] = useState('');
  const [mainTopics, setMainTopics] = useState('');
  const [content, setContent] = useState('');
  const [actionItems, setActionItems] = useState<ActionItem[]>([{ action: '', responsible: '', done: false }]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentSize, setAttachmentSize] = useState<number | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/forum/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((data: ForumPost) => {
        if (!data?.title) return;
        setTitle(data.title);
        setForumDate(String(data.forum_date).slice(0, 10));
        setParticipants(data.participants ?? '');
        setMainTopics(data.main_topics ?? '');
        setContent(data.content ?? '');
        try {
          const parsed = JSON.parse(data.action_items || '[]');
          setActionItems(Array.isArray(parsed) && parsed.length ? parsed : [{ action: '', responsible: '', done: false }]);
        } catch {
          setActionItems([{ action: '', responsible: '', done: false }]);
        }
        setStatus(data.status ?? 'draft');
        setAttachmentName(data.attachment_name ?? null);
        setAttachmentSize(data.attachment_size ?? null);
      })
      .catch(() => {});
  }, [id, token]);

  const setFile = (file: File | null) => {
    setAttachmentFile(file);
    setRemoveAttachment(false);
    if (file) {
      setAttachmentName(file.name);
      setAttachmentSize(file.size);
    }
  };

  const clearAttachment = () => {
    setAttachmentFile(null);
    setAttachmentName(null);
    setAttachmentSize(null);
    setRemoveAttachment(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateActionItem = (index: number, patch: Partial<ActionItem>) => {
    setActionItems(items => items.map((item, i) => i === index ? { ...item, ...patch } : item));
  };

  const addActionItem = () => {
    setActionItems(items => [...items, { action: '', responsible: '', done: false }]);
  };

  const addActionItemAndFocus = (nextIndex: number) => {
    setActionItems(items => [...items, { action: '', responsible: '', done: false }]);
    window.setTimeout(() => actionInputRefs.current[nextIndex]?.focus(), 0);
  };

  const removeActionItem = (index: number) => {
    setActionItems(items => items.length === 1 ? [{ action: '', responsible: '', done: false }] : items.filter((_, i) => i !== index));
  };

  const normalizedActionItems = () => actionItems
    .map(item => ({
      action: item.action.trim(),
      responsible: item.responsible.trim(),
      done: item.done,
    }))
    .filter(item => item.action || item.responsible);

  const validate = () => {
    if (!forumDate) return 'Data obrigatoria.';
    return '';
  };

  const handleSave = async (targetStatus: 'draft' | 'published') => {
    const error = validate();
    if (error) { setSaveMsg(error); return; }

    setSaving(true);
    setSaveMsg('');
    try {
      const form = new FormData();
      form.append('title', title);
      form.append('forum_date', forumDate);
      form.append('participants', participants);
      form.append('main_topics', mainTopics);
      form.append('content', content);
      form.append('action_items', JSON.stringify(normalizedActionItems()));
      form.append('status', targetStatus);
      if (attachmentFile) form.append('attachment', attachmentFile);
      if (removeAttachment) form.append('remove_attachment', 'true');

      const res = await fetch(isEdit ? `${API}/forum/${id}` : `${API}/forum`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();

      if (!res.ok) {
        setSaveMsg(data.message ?? 'Erro ao salvar.');
      } else {
        setStatus(targetStatus);
        setSaveMsg(targetStatus === 'published' ? 'Publicado com sucesso!' : 'Rascunho salvo!');
        if (!isEdit && data.id) navigate(`/dashboard/forum/${data.id}`, { replace: true });
      }
    } catch {
      setSaveMsg('Erro de conexao.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3500);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-screen bg-slate-50">
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
          <button onClick={() => navigate('/dashboard/forum')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Forum
          </button>
          <div className="w-px h-4 bg-slate-200" />
          <h1 className="text-sm font-semibold text-slate-700 truncate flex-1">{isEdit ? 'Editar registro' : 'Novo registro'}</h1>
          {saveMsg && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${saveMsg.includes('Erro') || saveMsg.includes('obrigatorio') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {saveMsg}
            </span>
          )}
        </div>

        <div className="bg-white border-b border-slate-100 px-8 py-5">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Titulo do registro..."
            className="w-full text-2xl md:text-3xl font-bold text-slate-900 placeholder-slate-300 bg-transparent border-none outline-none"
          />
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <label className="block">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Data do forum</span>
            <input type="date" value={forumDate} onChange={e => setForumDate(e.target.value)} className="block mt-2 w-full max-w-xs border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </label>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-15">
            <label className="block">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Participantes</span>
              <textarea
                value={participants}
                onChange={e => setParticipants(e.target.value)}
                rows={4}
                className="mt-2 w-full h-28 border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none"
                placeholder="Texto livre: nomes, areas, empresas..."
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Principais temas</span>
              <textarea
                value={mainTopics}
                onChange={e => setMainTopics(e.target.value)}
                rows={4}
                className="mt-2 w-full h-28 border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none"
                placeholder="Separe por virgula ou por linha"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conteudo discutido</span>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} className="mt-2 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm leading-relaxed" />
          </label>

          <section>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Plano de acao</span>
              <button type="button" onClick={addActionItem} className="text-xs font-medium text-[#EB0028] hover:underline">
                Adicionar item
              </button>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <div className="min-w-[640px]">
                <div className="grid grid-cols-[44px_1fr_220px_44px] gap-0 bg-slate-50 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <div className="px-3 py-2 text-center">Ok</div>
                  <div className="px-3 py-2">Acao</div>
                  <div className="px-3 py-2 border-l border-slate-100">Responsavel</div>
                  <div className="px-3 py-2" />
                </div>
                {actionItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-[44px_1fr_220px_44px] gap-0 border-b border-slate-100 last:border-b-0">
                    <label className="flex items-center justify-center px-3 py-2">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={e => updateActionItem(index, { done: e.target.checked })}
                        className="accent-[#EB0028]"
                      />
                    </label>
                    <input
                      ref={el => { actionInputRefs.current[index] = el; }}
                      value={item.action}
                      onChange={e => updateActionItem(index, { action: e.target.value })}
                      placeholder="Descreva a acao..."
                      className={`px-3 py-2 text-sm outline-none ${item.done ? 'line-through text-slate-400' : 'text-slate-700'}`}
                    />
                    <input
                      value={item.responsible}
                      onChange={e => updateActionItem(index, { responsible: e.target.value })}
                      onKeyDown={e => {
                        if (e.key !== 'Enter') return;
                        e.preventDefault();
                        if (index === actionItems.length - 1) {
                          addActionItemAndFocus(index + 1);
                        } else {
                          actionInputRefs.current[index + 1]?.focus();
                        }
                      }}
                      placeholder="Responsavel"
                      className={`px-3 py-2 text-sm outline-none border-l border-slate-100 ${item.done ? 'line-through text-slate-400' : 'text-slate-700'}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeActionItem(index)}
                      title="Remover item"
                      className="flex items-center justify-center text-slate-300 hover:text-red-500"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <aside className="lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white flex flex-col">
        <div className="flex-1 p-5 space-y-5">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Publicacao</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleSave('published')} disabled={saving} className="w-full bg-[#EB0028] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-60">
                {status === 'published' ? 'Atualizar' : 'Publicar'}
              </button>
              <button onClick={() => handleSave('draft')} disabled={saving} className="w-full border border-slate-200 text-slate-600 text-sm font-medium py-2 rounded-lg hover:bg-slate-50 disabled:opacity-60">
                {saving ? 'Salvando...' : 'Salvar rascunho'}
              </button>
            </div>
            {status === 'published' && <p className="text-[10px] text-emerald-600 mt-2">Publicado no portal</p>}
          </div>

          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Arquivo complementar</p>
            {attachmentName ? (
              <div className="border border-slate-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94a3 3 0 1 1 4.243 4.243L8.552 18.32a1.5 1.5 0 1 1-2.121-2.121l9.192-9.193" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 truncate">{attachmentName}</p>
                    <p className="text-xs text-slate-400">{fmtSize(attachmentSize)}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 text-xs border border-slate-200 rounded-md px-2 py-1.5 hover:bg-slate-50">Trocar</button>
                  <button type="button" onClick={clearAttachment} className="flex-1 text-xs border border-red-200 text-red-600 rounded-md px-2 py-1.5 hover:bg-red-50">Remover</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-slate-200 rounded-lg p-5 text-center hover:bg-slate-50">
                <svg className="w-6 h-6 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.338-2.32 5.75 5.75 0 0 1 .906 10.985" />
                </svg>
                <p className="text-xs text-slate-400 mt-2">Clique para anexar</p>
                <p className="text-[10px] text-slate-300 mt-1">PDF, PPT, DOCX, XLSX, JPG, PNG</p>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) setFile(f);
              }}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
