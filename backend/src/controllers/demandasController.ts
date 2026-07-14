import { Request, Response } from 'express';
import { consultarAgenteDemandas } from '../services/demandasPythonService';

export async function consultarAssistenteDemandas(req: Request, res: Response) {
  const pergunta = String(req.body?.pergunta || '').trim();

  if (!pergunta) {
    return res.status(400).json({ message: 'Pergunta obrigatoria' });
  }

  try {
    const resultado = await consultarAgenteDemandas(pergunta);
    res.json(resultado);
  } catch (error) {
    console.error('[demandas] consultarAssistenteDemandas:', error);
    res.status(500).json({
      message: 'Erro ao consultar o agente de demandas',
      detail: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
