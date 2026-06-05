import { Link } from 'react-router-dom';

const cards = [
  {
    to: '/contratos/visao-geral',
    title: 'Visão Geral',
    description: 'Painel consolidado dos contratos ativos de Core Engineering. Acompanhe volumes, vigências, fornecedores e status de execução em uma visão única.',
    badge: 'Power BI',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    to: '/contratos/buscar-contratos',
    title: 'Buscar Contratos',
    description: 'Consulte contratos por fornecedor, número, vigência ou área. Acesse detalhes, documentos e histórico de aditivos de forma rápida.',
    badge: 'API do Kaiser',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
  },
  {
    to: '/contratos/compromissos',
    title: 'Compromissos',
    description: 'Calendário e lista de compromissos contratuais — vencimentos, renovações, entregas e marcos. Nunca perca um prazo importante.',
    badge: 'Em breve',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
      </svg>
    ),
  },
  {
    to: '/contratos/oss2cloud',
    title: 'OSS2Cloud',
    description: 'Acompanhamento do programa de migração OSS para nuvem. Contratos, marcos de entrega e status de cada iniciativa de cloudificação.',
    badge: 'Power BI',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
      </svg>
    ),
  },
];

export default function Contratos() {
  return (
    <div className="flex flex-col min-h-full">

      {/* Hero */}
      <div className="bg-slate-900 text-white px-8 py-9">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-[#EB0028]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Contratos</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight mb-3">
            Gestão de contratos<br className="hidden sm:block" /> Core Network Engineering
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-xl">
            Consulte, monitore e gerencie os contratos da CNE — de painéis consolidados e buscas detalhadas ao controle de compromissos e iniciativas de cloudificação.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 bg-slate-50 px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto w-full">
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
