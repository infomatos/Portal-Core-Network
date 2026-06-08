import { useState, useEffect } from 'react';

// ── Configuração ─────────────────────────────────────────────────────────────
// Para arquivo .mp4 no servidor: '/portalCNE/video/institucional.mp4'
// Para YouTube embed:            'https://www.youtube.com/embed/VIDEO_ID'
const VIDEO_URL = '';
const VIDEO_TYPE: 'mp4' | 'youtube' | '' = '';

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Person {
  id: string;
  name: string;
  role: string;
  initials: string;
  accent?: string;
  children?: Person[];
}

// ── Dados da equipe ─────────────────────────────────────────────
const ORG: Person = {
  id: 'gm',
  name: 'Ney Barreiros',
  role: 'Executive manager',
  initials: 'NB',
  accent: '#EB0028',
  children: [
    {
      id: 'GS1',
      name: 'Alisson Cunha',
      role: 'Voice & Signalling Manager',
      initials: 'AC',
      accent: '#3b82f6',
      children: [
        { id: 'a1', name: 'Analista 1', role: 'Analista Sênior', initials: 'A1' },
        { id: 'a2', name: 'Analista 2', role: 'Analista Pleno', initials: 'A2' },
        { id: 'a3', name: 'Analista 3', role: 'Analista Jr.', initials: 'A3' },
      ],
    },
    {
      id: 'GS2',
      name: 'Bruno Mafort',
      role: 'Network Function Manager',
      initials: 'BM',
      accent: '#3b82f6',
      children: [
          { id: 'a4', name: 'Raphael Simonato', role: 'Especialista Sênior', initials: 'RS' },
          { id: 'a5', name: 'Tadeu Villares', role: 'Especialista Senior', initials: 'TV' },
          { id: 'a4', name: 'Ricardo Guimaraes', role: 'Especialista Sênior', initials: 'RG' },
          { id: 'a5', name: 'Flavio Alexandre', role: 'Especialista Pleno', initials: 'FA' },
          { id: 'a4', name: 'Vitor Felix', role: 'Especialista Sênior', initials: 'VF' },
          { id: 'a5', name: 'Elaine Mendonça', role: 'Gestora de Projetos', initials: 'EM' },
          { id: 'a5', name: 'Elias Martins', role: 'Estagiário', initials: 'EM' },
        ],
    },
    {
      id: 'GS3',
      name: 'Camila Vidal',
      role: 'Packet Core Manager',
      initials: 'CV',
      accent: '#3b82f6',
      children: [
        { id: 'a6', name: 'Analista 6', role: 'Analista Sênior', initials: 'A6' },
        { id: 'a7', name: 'Analista 7', role: 'Analista Pleno', initials: 'A7' },
        { id: 'a8', name: 'Analista 8', role: 'Analista Jr.', initials: 'A8' },
      ],
    },
    {
      id: 'GS4',
      name: 'Marcus Rebolças',
      role: 'Database & Services Manager',
      initials: 'MR',
      accent: '#3b82f6',
      children: [
        { id: 'a9', name: 'Analista 9', role: 'Analista Sênior', initials: 'A9' },
        { id: 'a10', name: 'Analista 10', role: 'Analista Pleno', initials: 'A10' },
      ],
    },
  ],
};

const STATS = [
  { label: 'Highlights blabla', value: 14, suffix: '+' },
  { label: 'Highlights blabla', value: 20, suffix: '+' },
  { label: 'Tecnologias blablabla', value: 32, suffix: '' },
  { label: 'Highlights blabla', value: 50, suffix: '+' },
];

const VALUES = [
  {
    label: 'Blablabla Lorem ipsum',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
  {
    label: 'Blablabla Lorem ipsum',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    label: 'Blablabla Lorem ipsum',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    label: 'IBlablabla Lorem ipsum',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
];

// ── Contador animado ──────────────────────────────────────────────────────────
function Counter({ to, suffix }: { to: number; suffix: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = Math.max(1, Math.floor(to / 50));
    const interval = setInterval(() => {
      current = Math.min(current + step, to);
      setCount(current);
      if (current >= to) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [to]);
  return <>{count}{suffix}</>;
}

// ── Card de departamento ──────────────────────────────────────────────────────
function DeptCard({ dept }: { dept: Person }) {
  const [open, setOpen] = useState(true);
  const accent = dept.accent ?? '#64748b';
  const team = dept.children ?? [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-200">
      {/* Barra colorida */}
      <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />

      {/* Gestor — clicável para retrair */}
      <button
        onClick={() => team.length > 0 && setOpen(p => !p)}
        className={`px-5 pt-5 pb-4 flex items-center gap-4 w-full text-left transition-colors ${team.length > 0 ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'}`}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md ring-2 ring-white"
          style={{ backgroundColor: accent }}
        >
          {dept.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900 text-sm leading-tight">{dept.name}</p>
          <p
            className="text-xs text-slate-500 mt-0.5 leading-snug"
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {dept.role}
          </p>
        </div>
        {team.length > 0 && (
          <svg
            className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        )}
      </button>

      {/* Equipe — retrátil */}
      {team.length > 0 && open && (
        <>
          <div className="mx-5 border-t border-slate-100" />
          <div className="px-5 pt-3 pb-5 flex flex-col gap-2.5">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-0.5">
              Equipe · {team.length} {team.length === 1 ? 'membro' : 'membros'}
            </p>
            {team.map(member => (
              <div key={member.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{ backgroundColor: accent + 'b3' }}
                >
                  {member.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-700 leading-tight">{member.name}</p>
                  <p className="text-[10px] text-slate-500 leading-tight">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────
export default function Sobre() {
  return (
    <div className="flex flex-col">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.6s ease forwards; }
        .delay-100 { animation-delay: 0.1s; opacity: 0; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
        .delay-400 { animation-delay: 0.4s; opacity: 0; }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative bg-slate-900 text-white py-24 px-6 overflow-hidden"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 70% 40%, rgba(235,0,40,0.10) 0%, transparent 55%),
            radial-gradient(ellipse at 20% 80%, rgba(59,130,246,0.06) 0%, transparent 45%),
            linear-gradient(180deg, #0f172a 0%, #1e293b 100%)
          `,
        }}
      >
        {/* Grid decorativo */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative max-w-5xl mx-auto flex flex-col items-center text-center gap-6">
          {/* Badge */}
          {/* <span className="animate-fade-up inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#EB0028]/30 bg-[#EB0028]/10 text-red-400 text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EB0028] animate-pulse" />
            TIM Brasil — Engenharia de Redes
          </span> */}

          <h1 className="animate-fade-up delay-100 text-5xl md:text-7xl font-extrabold leading-none tracking-tight">
            Core Network
            <span className="block mt-1" style={{ color: '#EB0028' }}>Engineering</span>
          </h1>

          <p className="animate-fade-up delay-200 text-slate-400 text-lg max-w-2xl leading-relaxed">
           Impulsionando a inovação na infraestrutura de telecomunicações
          </p>

          {/* Stats */}
          <div className="animate-fade-up delay-300 grid grid-cols-2 md:grid-cols-4 gap-8 mt-6 w-full max-w-xl">
            {STATS.map(s => (
              <div key={s.label} className="flex flex-col items-center gap-1.5">
                <span className="text-4xl font-black text-white tabular-nums">
                  <Counter to={s.value} suffix={s.suffix} />
                </span>
                <span className="text-[11px] text-slate-500 text-center leading-tight">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Scroll hint */}
          <div className="animate-fade-up delay-400 mt-4 flex flex-col items-center gap-1.5 text-slate-600">
            <span className="text-xs">Conheça a equipe</span>
            <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── Sobre + Vídeo ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-center">

          {/* Texto */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 rounded-full bg-[#EB0028]" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Sobre a Equipe</span>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 leading-tight">
              O que fazemos?
            </h2>

            <p className="text-slate-600 leading-relaxed text-[15px]">
              Core Network Engineering é a área responsável pela gestão nacional das 
              áreas de Voice & Signalling Engineering, Database Engineering, Packet Core 
              Engineering e NFVI Engineering. As principais atividades incluem a implantação de novos elementos, o desenvolvimento de serviços e projetos e a garantia de capacidade, evolução tecnológica e eficiência operacional.
            </p>

            <p className="text-slate-600 leading-relaxed text-[15px]">
              Todas as ações são realizadas em conformidade com as regulamentações da 
              Anatel, atendendo às demandas de negócio e às expectativas dos clientes, 
              além de assegurar a manutenção e o aprimoramento dos indicadores de qualidade 
              dos serviços móveis (ECQ) e fixos da TIM.
            </p>

            <p className="text-slate-600 leading-relaxed text-[15px]">
              Responsável por assegurar o desenho arquitetural, o plano de desenvolvimento, a 
              implementação e a ativação da rede core, das plataformas de serviços de dados 
              e de rede virtualizada.
            </p>

            {/* Pilares */}
            <div className="grid grid-cols-2 gap-2.5 mt-1">
              {VALUES.map(v => (
                <div
                  key={v.label}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <span className="text-[#EB0028] shrink-0">{v.icon}</span>
                  <span className="text-xs font-medium text-slate-700 leading-tight">{v.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vídeo */}
          <div className="flex flex-col gap-3">
            <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border border-slate-800 relative">
              {VIDEO_URL && VIDEO_TYPE === 'mp4' ? (
                <video
                  src={VIDEO_URL}
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                />
              ) : VIDEO_URL && VIDEO_TYPE === 'youtube' ? (
                <iframe
                  src={VIDEO_URL}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `radial-gradient(ellipse at center, rgba(235,0,40,0.12) 0%, transparent 65%)`,
                    }}
                  />
                  <div className="relative flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full border border-slate-700 flex items-center justify-center bg-slate-800/60 backdrop-blur">
                      <svg className="w-7 h-7 text-slate-400 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-300 text-sm font-semibold">Vídeo Institucional</p>
                      <p className="text-slate-600 text-xs mt-1">
                       <code className="text-slate-500 bg-slate-800 px-1 rounded">VIDEO_URL</code>  <code className="text-slate-500 bg-slate-800 px-1 rounded"></code>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400 text-center">Vídeo institucional — Core Network Engineering · TIM Brasil</p>
          </div>
        </div>
      </section>

      {/* ── Organograma ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-10">

          {/* Cabeçalho */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 rounded-full bg-[#EB0028]" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Estrutura da Equipe</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Organograma</h2>
          </div>

          {/* Gerente */}
          <div className="bg-slate-900 border border-[#EB0028]/30 shadow-2xl rounded-2xl flex items-center gap-6 px-8 py-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg"
              style={{ backgroundColor: ORG.accent }}
            >
              {ORG.initials}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#EB0028] mb-1">Gerência Executiva</p>
              <p className="text-white font-bold text-lg leading-tight">{ORG.name}</p>
              <p className="text-slate-400 text-sm mt-1">{ORG.role}</p>
            </div>
          </div>

          {/* Conector */}
          <div className="flex flex-col items-center gap-0 -my-4">
            <div className="w-px h-5 bg-slate-300" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
              Gestores
            </span>
            <div className="w-px h-5 bg-slate-300" />
          </div>

          {/* Grid de departamentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 w-full items-start">
            {ORG.children!.map(dept => (
              <DeptCard key={dept.id} dept={dept} />
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
