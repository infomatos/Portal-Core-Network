import { Link } from 'react-router-dom';

const cards = [
  {
    to: '/orcamento/visao-geral',
    title: 'Visão Geral',
    description: 'Painel consolidado de capex e opex por área e projeto. Acompanhe a evolução do orçamento em tempo real com visibilidade total da execução financeira.',
    badge: 'Power BI',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    to: '/orcamento/realizacao-nfv',
    title: 'Realização NFV',
    description: 'Acompanhamento da realização orçamentária e lading plan. Dois relatórios integrados para monitorar a execução versus o planejado ao longo do ano.',
    badge: 'Power BI · 2 relatórios',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
      </svg>
    ),
  },
  {
    to: '/orcamento/master-pivot',
    title: 'Master Pivot',
    description: 'Tabela detalhada de orçamento por área e projeto — NFVi, Database, Packet Core e Voice & Signalling. Publicada quadrimestralmente com resumo CNE e CTD.',
    badge: 'Tabela detalhada',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0c-.621 0-1.125.504-1.125 1.125v1.5m18.375-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M3.375 8.25h17.25" />
      </svg>
    ),
  },
];

export default function Orcamento() {
  return (
    <div className="flex flex-col min-h-full">

      {/* Hero */}
      <div className="bg-slate-900 text-white px-8 py-9">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-[#EB0028]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Orçamento</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight mb-3">
            Gestão orçamentária<br className="hidden sm:block" /> Core Network Engineering
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-xl">
            Acompanhe a execução do orçamento de capex e opex — de painéis consolidados em tempo real até o detalhamento por projeto e elemento, com publicações quadrimestrais.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 bg-slate-50 px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto w-full">
          {cards.map(card => (
            <Link
              key={card.to}
              to={card.to}
              className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-400 hover:shadow-md transition-all duration-200"
            >
              {/* Card top accent */}
              <div className="h-1 bg-[#EB0028] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

              <div className="flex flex-col gap-4 p-6 flex-1">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-200">
                  {card.icon}
                </div>

                {/* Text */}
                <div className="flex flex-col gap-2 flex-1">
                  <h2 className="text-base font-semibold text-slate-800">{card.title}</h2>
                  <p className="text-sm text-slate-500 leading-relaxed">{card.description}</p>
                </div>

                {/* Footer */}
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
