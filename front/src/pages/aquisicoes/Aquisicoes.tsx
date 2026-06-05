import { Link } from 'react-router-dom';

const cards = [
  {
    to: '/aquisicoes/visao-geral',
    title: 'Visão Geral',
    description: 'Painel consolidado do processo de aquisições da CNE. Acompanhe o status geral das compras, fornecedores e entregas em tempo real.',
    badge: 'Power BI',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    to: '/aquisicoes/status-rfx',
    title: 'Status RFX',
    description: 'Acompanhamento em tempo real do status de cada processo RFX — RFI, RFP e RFQ. Visualize etapas, prazos e responsáveis por processo.',
    badge: 'Power BI',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
      </svg>
    ),
  },
  {
    to: '/aquisicoes/orcamento-rfx',
    title: 'Orçamento RFX',
    description: 'Visão orçamentária dos processos de aquisição. Compare valores propostos, negociados e contratados por RFX, fornecedor e categoria.',
    badge: 'Power BI',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
      </svg>
    ),
  },
];

export default function Aquisicoes() {
  return (
    <div className="flex flex-col min-h-full">

      {/* Hero */}
      <div className="bg-slate-900 text-white px-8 py-9">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-[#EB0028]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Aquisições</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight mb-3">
            Gestão de aquisições<br className="hidden sm:block" /> Core Network Engineering
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-xl">
            Acompanhe os processos de aquisição da CNE — do status de cada RFX à visão orçamentária consolidada por fornecedor e categoria de compra.
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
