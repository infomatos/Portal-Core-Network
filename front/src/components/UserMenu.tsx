import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador', editor: 'Editor',
  moderador: 'Moderador', user: 'Usuário',
};
const ROLE_STYLE: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  editor: 'bg-blue-100 text-blue-700',
  moderador: 'bg-amber-100 text-amber-700',
  user: 'bg-slate-100 text-slate-600',
};

/* ── Modal base ── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4" onMouseDown={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onMouseDown={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ── Editar nome ── */
function EditNameModal({ onClose }: { onClose: () => void }) {
  const { user, token, updateUser } = useAuth();
  const [name, setName]     = useState(user?.name ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [ok, setOk]         = useState(false);

  async function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true); setError('');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: name.trim() }),
    });
    const data = await res.json();
    if (res.ok) { updateUser({ name: data.name }); setOk(true); setTimeout(onClose, 1200); }
    else setError(data.message ?? 'Erro ao salvar');
    setLoading(false);
  }

  return (
    <Modal title="Editar nome" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Nome completo</label>
          <input
            value={name} onChange={e => setName(e.target.value)} required
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {ok    && <p className="text-sm text-emerald-600">Nome atualizado!</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-800 cursor-pointer">Cancelar</button>
          <button type="submit" disabled={loading || ok}
            className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50">
            {loading ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Alterar senha ── */
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { token } = useAuth();
  const [current, setCurrent]   = useState('');
  const [next, setNext]         = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [ok, setOk]             = useState(false);

  async function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (next !== confirm) { setError('As senhas não coincidem'); return; }
    setLoading(true); setError('');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/change-password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    const data = await res.json();
    if (res.ok) { setOk(true); setTimeout(onClose, 1500); }
    else setError(data.message ?? 'Erro ao alterar senha');
    setLoading(false);
  }

  return (
    <Modal title="Alterar senha" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {[
          { label: 'Senha atual',      value: current,  set: setCurrent  },
          { label: 'Nova senha',       value: next,     set: setNext     },
          { label: 'Confirmar senha',  value: confirm,  set: setConfirm  },
        ].map(f => (
          <div key={f.label} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">{f.label}</label>
            <input type="password" value={f.value} onChange={e => f.set(e.target.value)} required
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400" />
          </div>
        ))}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {ok    && <p className="text-sm text-emerald-600">Senha alterada com sucesso!</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-800 cursor-pointer">Cancelar</button>
          <button type="submit" disabled={loading || ok}
            className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50">
            {loading ? 'Salvando…' : 'Alterar senha'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Solicitar perfil ── */
function RequestRoleModal({ onClose }: { onClose: () => void }) {
  const { user, token } = useAuth();
  const ROLES = [
    { value: 'editor',    label: 'Editor'    },
    { value: 'moderador', label: 'Moderador' },
    { value: 'user',      label: 'Usuário'   },
  ].filter(r => r.value !== user?.role);

  const [role, setRole]       = useState(ROLES[0]?.value ?? 'editor');
  const [reason, setReason]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [ok, setOk]           = useState(false);

  async function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/request-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ requestedRole: role, reason }),
    });
    const data = await res.json();
    if (res.ok) { setOk(true); setTimeout(onClose, 2000); }
    else setError(data.message ?? 'Erro ao enviar');
    setLoading(false);
  }

  return (
    <Modal title="Solicitar alteração de perfil" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
          <span className="text-slate-500">Perfil atual:</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_STYLE[user?.role ?? 'user']}`}>
            {ROLE_LABEL[user?.role ?? 'user']}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Perfil desejado</label>
          <select value={role} onChange={e => setRole(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400">
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Justificativa <span className="text-slate-300">(opcional)</span></label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
            placeholder="Descreva brevemente o motivo da solicitação…"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 resize-none placeholder:text-slate-400" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {ok    && <p className="text-sm text-emerald-600">Solicitação enviada! Os administradores serão notificados.</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-800 cursor-pointer">Cancelar</button>
          <button type="submit" disabled={loading || ok}
            className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50">
            {loading ? 'Enviando…' : 'Enviar solicitação'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Menu principal ── */
type ModalType = 'name' | 'password' | 'role' | null;

export default function UserMenu({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen]   = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  function openModal(m: ModalType) { setModal(m); setOpen(false); }

  const initials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? '?';

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(p => !p)}
          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">{initials}</span>
          </div>
          <span className="hidden lg:block text-sm text-slate-300">{user?.name}</span>
          <svg className={`hidden lg:block w-3 h-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-[100] overflow-hidden">

            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-white">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.matricula}</p>
                </div>
              </div>
              <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_STYLE[user?.role ?? 'user']}`}>
                {ROLE_LABEL[user?.role ?? 'user']}
              </span>
            </div>

            {/* Dashboard — admin e moderador */}
            {(user?.role === 'admin' || user?.role === 'moderador') && (
              <div className="py-1 border-b border-slate-700">
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate(user.role === 'moderador' ? '/dashboard/editar-master-pivot' : '/dashboard');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A.75.75 0 0 1 4.5 5.25h15a.75.75 0 0 1 0 1.5h-15A.75.75 0 0 1 3.75 6Zm0 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z" />
                  </svg>
                  Dashboard
                </button>
              </div>
            )}

            {/* Items */}
            <div className="py-1">
              {[
                { icon: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z', label: 'Editar nome',             action: () => openModal('name')     },
                { icon: 'M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z', label: 'Alterar senha',           action: () => openModal('password') },
                { icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z', label: 'Solicitar mudança de perfil', action: () => openModal('role')     },
              ].map(item => (
                <button key={item.label} onClick={item.action}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer text-left">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.label}
                </button>
              ))}
            </div>

            {/* Logout */}
            <div className="border-t border-slate-700 py-1">
              <button onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-700 hover:text-red-400 transition-colors cursor-pointer">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>
                Sair
              </button>
            </div>
          </div>
        )}
      </div>

      {modal === 'name'     && <EditNameModal       onClose={() => setModal(null)} />}
      {modal === 'password' && <ChangePasswordModal  onClose={() => setModal(null)} />}
      {modal === 'role'     && <RequestRoleModal     onClose={() => setModal(null)} />}
    </>
  );
}
