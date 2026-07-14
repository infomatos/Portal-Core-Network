import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';

type Mensagem = {
  autor: 'assistente' | 'usuario';
  texto: string;
};

type EstadoAgente = 'pronto' | 'consultando' | 'erro';

const API = import.meta.env.VITE_API_URL;

const sugestoes = [
  'Quantas demandas uteis existem?',
  'Quantas demandas estao abertas?',
  'Como esta a distribuicao por status?',
  'Quem concentra mais demandas?',
  'Quais demandas abertas tem maior aging?',
  'Como esta a criticidade?',
  'Compare 2025 com 2026',
];

export default function ChatDemandas() {
  const [aberto, setAberto] = useState(false);
  const [pergunta, setPergunta] = useState('');
  const [estadoAgente, setEstadoAgente] = useState<EstadoAgente>('pronto');
  const [mostrarSugestoes, setMostrarSugestoes] = useState(true);
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      autor: 'assistente',
      texto:
        'Oi, eu sou o assistente de demandas. Posso te ajudar a analisar as demandas do seu time. Pergunte algo ou clique em uma das sugestões abaixo.',
    },
  ]);

  const ultimaPergunta = useMemo(
    () => mensagens.filter((mensagem) => mensagem.autor === 'usuario').at(-1)?.texto,
    [mensagens],
  );

  async function enviarPergunta(texto: string) {
    const textoLimpo = texto.trim();
    if (!textoLimpo || estadoAgente === 'consultando') return;

    setMensagens((mensagensAtuais) => [
      ...mensagensAtuais,
      { autor: 'usuario', texto: textoLimpo },
    ]);
    setPergunta('');
    setAberto(true);
    setMostrarSugestoes(false);
    setEstadoAgente('consultando');

    try {
      const resposta = await fetch(`${API}/demandas/assistente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta: textoLimpo }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.detail || dados.message || 'Erro ao consultar agente.');
      }

      setMensagens((mensagensAtuais) => [
        ...mensagensAtuais,
        { autor: 'assistente', texto: dados.resposta || 'O agente respondeu sem texto.' },
      ]);
      setEstadoAgente('pronto');
    } catch (error) {
      setMensagens((mensagensAtuais) => [
        ...mensagensAtuais,
        {
          autor: 'assistente',
          texto: `Nao consegui consultar o agente Python. Detalhe: ${
            error instanceof Error ? error.message : 'erro desconhecido'
          }`,
        },
      ]);
      setEstadoAgente('erro');
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    enviarPergunta(pergunta);
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {aberto && (
        <section className="w-[min(92vw,400px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <header className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-4 py-3 text-white">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Assistente de Demandas</p>
              <p className="truncate text-xs text-slate-300">{obterLegendaAgente(estadoAgente)}</p>
            </div>
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="grid h-8 w-8 place-items-center rounded-full text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              title="Fechar assistente"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                x
              </span>
            </button>
          </header>

          <div className="max-h-[360px] space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
            {mensagens.map((mensagem, index) => (
              <div
                key={`${mensagem.autor}-${index}`}
                className={`flex ${mensagem.autor === 'usuario' ? 'justify-end' : 'justify-start'}`}
              >
                <p
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    mensagem.autor === 'usuario'
                      ? 'bg-[#EB0028] text-white'
                      : 'border border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  {mensagem.texto}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            {mostrarSugestoes ? (
              <div className="mb-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-slate-500">Perguntas sugeridas</p>
                  {ultimaPergunta && (
                    <button
                      type="button"
                      onClick={() => setMostrarSugestoes(false)}
                      className="text-xs text-slate-400 transition-colors hover:text-slate-700"
                    >
                      Ocultar
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sugestoes.map((sugestao) => (
                    <button
                      key={sugestao}
                      type="button"
                      onClick={() => enviarPergunta(sugestao)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                    >
                      {sugestao}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setMostrarSugestoes(true)}
                className="mb-3 flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-800"
                title="Voltar para perguntas sugeridas"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25 3.75 9m0 0L9 3.75M3.75 9H15a6 6 0 0 1 0 12h-3" />
                </svg>
                Perguntas sugeridas
              </button>
            )}

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                value={pergunta}
                onChange={(event) => setPergunta(event.target.value)}
                placeholder="Pergunte sobre demandas"
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400"
              />
              <button
                type="submit"
                disabled={estadoAgente === 'consultando'}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-wait disabled:bg-slate-400"
              >
                {estadoAgente === 'consultando' ? '...' : 'Enviar'}
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setAberto((valorAtual) => !valorAtual)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EB0028] text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-200"
        title={aberto ? 'Ocultar assistente' : 'Abrir assistente'}
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12h.008m3.359 0H12m3.375 0h.008M21 12c0 4.142-4.03 7.5-9 7.5a10.7 10.7 0 0 1-3.644-.627L3 20.25l1.64-4.1A6.918 6.918 0 0 1 3 12c0-4.142 4.03-7.5 9-7.5s9 3.358 9 7.5Z"
          />
        </svg>
      </button>
    </div>
  );
}

function obterLegendaAgente(estado: EstadoAgente) {
  if (estado === 'consultando') return 'Consultando Python';
  if (estado === 'erro') return 'Falha na ultima consulta';
  return 'Beta';
}
