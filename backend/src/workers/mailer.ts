import nodemailer from 'nodemailer';
import { buscarPendentes, marcarEnviado, marcarFalha } from '../models/mailQueueModel';

// SMTP sem autenticação — relay interno TIM (espelho do PHPMailer em uso)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 25,
  secure: false,
  auth: false,
  tls: { rejectUnauthorized: false },
} as any);

function limparContornosDoEditor(html: string): string {
  const deveLimpar = /u-row|u-col|u_content|unlayer/i.test(html);
  if (!deveLimpar) return html;

  return html
    .replace(/\sborder=(["'])[^"']*\1/gi, ' border="0"')
    .replace(/style=(["'])(.*?)\1/gis, (_match, quote, style) => {
      const cleaned = style
        .split(';')
        .map((declaration: string) => declaration.trim())
        .filter((declaration: string) => {
          if (!declaration) return false;
          return !/^border(?:-(?:top|right|bottom|left|color|style|width))?\s*:/i.test(declaration);
        })
        .join('; ');

      return cleaned ? `style=${quote}${cleaned}${quote}` : '';
    })
    .replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (_match, attrs, css) => {
      const cleaned = css
        .replace(/border(?:-(?:top|right|bottom|left|color|style|width))?\s*:\s*[^;{}]+;?/gi, '')
        .replace(/([;{])\s*}/g, '$1}');

      return `<style${attrs}>${cleaned}</style>`;
    });
}

function montarHtml(body: string): string {
  const html = limparContornosDoEditor(body);
  if (/<!doctype html|<html\b/i.test(html)) return html;

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"></head><body>${html}</body></html>`;
}

async function processQueue(): Promise<void> {
  try {
    const pending = await buscarPendentes();
    if (!pending.length) return;

    console.log(`[mailer] ${pending.length} email(s) na fila`);

    for (const mail of pending) {
      // cc_email é enviado como segundo destinatário no TO (igual ao addAddress do PHPMailer)
      const toList = [mail.to_email, ...(mail.cc_email ? [mail.cc_email] : [])];

      try {
        await transporter.sendMail({
          from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
          to: toList.join(', '),
          subject: mail.subject,
          html: montarHtml(mail.body),
        });
        await marcarEnviado(mail.id);
        console.log(`[mailer] Enviado → ${toList.join(', ')} (id ${mail.id})`);
      } catch (err) {
        await marcarFalha(mail.id);
        console.error(`[mailer] Falha → ${mail.to_email} (id ${mail.id}):`, err);
      }
    }
  } catch (err) {
    console.error('[mailer] Erro ao consultar fila:', err);
  }
}

export function startMailWorker(): void {
  const INTERVAL_MS = 3 * 60 * 1000;
  console.log('[mailer] Worker iniciado — intervalo: 3 min');
  processQueue();
  setInterval(processQueue, INTERVAL_MS);
}
