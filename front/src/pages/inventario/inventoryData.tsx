import type { ReactNode } from 'react';

export interface InventoryPbi {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  signal: string;
  accent: string;
  bg: string;
  metrics: string[];
  url: string;
  icon: ReactNode;
}

export const inventoryPbis: InventoryPbi[] = [
  {
    slug: 'hardware',
    title: 'Hardware',
    shortTitle: 'Hardware',
    description: 'Mapa executivo do parque físico, com capacidade, criticidade e ciclo de vida dos ativos.',
    signal: 'Compute layer',
    accent: '#EB0028',
    bg: 'from-red-500/20 via-white to-slate-100',
    metrics: ['Hosts', 'Chassis', 'EOL/EOS'],
    url: 'https://app.powerbi.com/reportEmbed?reportId=ebf5de7d-60b7-427f-bd32-4ea18987c92e&autoAuth=true&ctid=57b8c96e-ac2f-4d78-a149-f1fc6817d3c4',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h10.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25v-7.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 19.5h7.5M9.75 16.5v3m4.5-3v3M8.25 8.25h.008M11.25 8.25h4.5M8.25 11.25h.008M11.25 11.25h4.5" />
      </svg>
    ),
  },
  {
    slug: 'storage',
    title: 'Storage',
    shortTitle: 'Storage',
    description: 'Controle de volumes, crescimento, pools e pontos de atenção para sustentação da NFVI.',
    signal: 'Data gravity',
    accent: '#2563eb',
    bg: 'from-blue-500/20 via-white to-cyan-50',
    metrics: ['Pools', 'Volumes', 'Headroom'],
    url: 'https://app.powerbi.com/reportEmbed?reportId=09c7bb49-10bc-4343-9721-965ebad3c2a1&autoAuth=true&ctid=57b8c96e-ac2f-4d78-a149-f1fc6817d3c4',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75c0-1.243 3.358-2.25 7.5-2.25s7.5 1.007 7.5 2.25-3.358 2.25-7.5 2.25-7.5-1.007-7.5-2.25Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75v5.25c0 1.243 3.358 2.25 7.5 2.25s7.5-1.007 7.5-2.25V6.75M4.5 12v5.25c0 1.243 3.358 2.25 7.5 2.25s7.5-1.007 7.5-2.25V12" />
      </svg>
    ),
  },
  {
    slug: 'switch',
    title: 'Switch',
    shortTitle: 'Switch',
    description: 'Visão da malha de conectividade, portas, redundância e concentração por ambiente.',
    signal: 'Fabric pulse',
    accent: '#14b8a6',
    bg: 'from-teal-500/20 via-white to-emerald-50',
    metrics: ['Portas', 'Uplinks', 'Domínios'],
    url: 'https://app.powerbi.com/reportEmbed?reportId=b2868062-61c1-4378-bcad-00befdce4f21&autoAuth=true&ctid=57b8c96e-ac2f-4d78-a149-f1fc6817d3c4',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 8.25h16.5v7.5H3.75v-7.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 11.25h.008M10.5 11.25h.008M13.5 11.25h.008M16.5 11.25h.008M7.5 14.25h9M6.75 8.25V5.5m10.5 2.75V5.5M6.75 18.5v-2.75m10.5 2.75v-2.75" />
      </svg>
    ),
  },
  {
    slug: 'backup',
    title: 'Backup',
    shortTitle: 'Backup',
    description: 'Acompanhamento de cobertura, sucesso das rotinas, retenção e gaps operacionais.',
    signal: 'Recovery shield',
    accent: '#7c3aed',
    bg: 'from-violet-500/20 via-white to-fuchsia-50',
    metrics: ['Jobs', 'Sucesso', 'Retenção'],
    url: 'https://app.powerbi.com/reportEmbed?reportId=6521cee6-be6f-47b5-9d49-66e7a5a70982&autoAuth=true&ctid=57b8c96e-ac2f-4d78-a149-f1fc6817d3c4',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75 5.25 6v5.25c0 4.213 2.862 8.106 6.75 9 3.888-.894 6.75-4.787 6.75-9V6L12 3.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12.75 11.25 14.25 14.75 10.5" />
      </svg>
    ),
  },
];
