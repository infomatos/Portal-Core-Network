import { Link } from 'react-router-dom';

const cards = [
  {
    to: '/projetos/visao-geral',
    title: 'Visão Geral',
    description: 'Painel consolidado com o status de todos os projetos em andamento na CNE — progresso, marcos, prazos e responsáveis.',
    badge: 'Power BI',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    to: '/projetos/detalhamento',
    title: 'Detalhamento',
    description: 'Análise detalhada por projeto — cronograma, entregas, riscos e indicadores de desempenho por iniciativa.',
    badge: 'Power BI',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
];

export default function Projetos() {
  return (
    <div className="flex flex-col min-h-full">

      {/* Hero */}
      <div className="bg-slate-900 text-white px-8 py-9">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-[#EB0028]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Projetos</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight mb-3">
            Portfólio de projetos<br className="hidden sm:block" /> Core Network Engineering
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-xl">
            Acompanhe o andamento e o detalhamento de todos os projetos da CNE — do panorama geral aos indicadores individuais de cada iniciativa.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 bg-slate-50 px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto w-full">
          {cards.map(card => (
            <Link
              key={card.to}
              to={card.to}
              className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-400 hover:shadow-md transition-all duration-200"
            >
              <div className="h-1 bg-[#EB0028] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="flex flex-col gap-4 p-6 flex-1">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-200">
                  {card.icon}
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <h2 className="text-base font-semibold text-slate-800">{card.title}</h2>
                  <p className="text-sm text-slate-500 leading-relaxed">{card.description}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                    {card.badge}
                  </span>
                  <span className="text-xs font-medium text-slate-400 group-hover:text-slate-800 transition-colors flex items-center gap-1">
                    Acessar
                    <svg className="w-3.5 h-3.5 -translate-x-0.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
