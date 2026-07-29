export interface NavLink {
  to: string;
  label: string;
  public?: boolean;
  roles?: string[];
  external?: boolean;
  mega?: boolean;
  children?: Omit<NavLink, 'children'>[];
}

export const navLinks: NavLink[] = [
{ to: '/orcamento',   label: 'Orçamento',   public: true, mega: true,
    children: [
      { to: '/orcamento/visao-geral', label: 'Visão Geral', public: true },
      { to: '/orcamento/realizacao-nfv', label: 'Realização NFV', public: true },
      { to: '/orcamento/master-pivot', label: 'Master Pivot', public: true },
    ],
   },
  { to: '/aquisicoes',  label: 'Aquisições',  public: true, mega: true,
    children: [
      { to: '/aquisicoes/visao-geral', label: 'Visão Geral', public: true },
      { to: '/aquisicoes/status-rfx', label: 'Status RFX', public: true },
      { to: '/aquisicoes/orcamento-rfx', label: 'Orçamento RFX', public: true },
    ],
   },
  { to: '/contratos',   label: 'Contratos',   public: true, mega: true,
    children: [
      { to: '/contratos/visao-geral', label: 'Visão Geral', public: true },
      { to: '/contratos/buscar-contratos', label: 'Buscar Contratos', public: true },
      { to: '/contratos/compromissos', label: 'Compromissos', public: true },
      { to: '/contratos/oss2cloud', label: 'OSS2Cloud', public: true },
    ],
   },
  { to: '/projetos',    label: 'Projetos',    public: true, mega: true,
    children: [
      { to: '/projetos/visao-geral',     label: 'Visão Geral',     public: true },
      { to: '/projetos/detalhamento', label: 'Detalhamento', public: true }
    ],
  },
  { to: '/demandas',    label: 'Demandas',    public: true, mega: true,
    children: [
      { to: '/demandas/visao-geral', label: 'Visão Geral', public: true },
      { to: 'https://infracloud/controlededemandas/php/index.php', label: 'Abrir Demanda', external:true,  public: true },
      // { to: '/demandas/relatorio-demandas', label: 'Relatório', public: true },
    ],
   },
  { to: '/inventario',  label: 'Inventário',  public: true },
  { to: '/forum',   label: 'Fórum',   public: true},
  { to: '/tecnologias', label: 'Tecnologias', public: true },
  { to: '/news',        label: 'News',        public: true },
  { to: '/eventos',     label: 'Eventos',     public: true },
  { to: '/sobre',       label: 'Sobre Nós',   public: true },
];
