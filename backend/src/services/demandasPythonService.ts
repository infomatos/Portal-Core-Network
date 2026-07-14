import path from 'path';
import { spawn } from 'child_process';

type AgenteDemandasPayload = {
  pergunta: string;
};

type AgenteDemandasResposta = {
  resposta: string;
  dados?: unknown;
};

const PYTHON_BIN = process.env.PYTHON_BIN || 'python';
const SCRIPT_PATH = path.resolve(__dirname, '../../python/demandas_agent.py');

export function consultarAgenteDemandas(pergunta: string): Promise<AgenteDemandasResposta> {
  return new Promise((resolve, reject) => {
    const processo = spawn(PYTHON_BIN, [SCRIPT_PATH], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    processo.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    processo.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    processo.on('error', (error) => {
      reject(error);
    });

    processo.on('close', (code) => {
      try {
        const resposta = JSON.parse(stdout || '{}');

        if (code !== 0) {
          reject(new Error(resposta.erro || stderr || 'Erro ao executar agente Python.'));
          return;
        }

        resolve(resposta);
      } catch {
        reject(new Error(stderr || stdout || 'Resposta invalida do agente Python.'));
      }
    });

    const payload: AgenteDemandasPayload = { pergunta };
    processo.stdin.write(JSON.stringify(payload));
    processo.stdin.end();
  });
}
