"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMailWorker = startMailWorker;
const nodemailer_1 = __importDefault(require("nodemailer"));
const mailQueueModel_1 = require("../models/mailQueueModel");
// SMTP sem autenticação — relay interno TIM (espelho do PHPMailer em uso)
const transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 25,
    secure: false,
    auth: false,
    tls: { rejectUnauthorized: false },
});
async function processQueue() {
    try {
        const pending = await (0, mailQueueModel_1.buscarPendentes)();
        if (!pending.length)
            return;
        console.log(`[mailer] ${pending.length} email(s) na fila`);
        for (const mail of pending) {
            // cc_email é enviado como segundo destinatário no TO (igual ao addAddress do PHPMailer)
            const toList = [mail.to_email, ...(mail.cc_email ? [mail.cc_email] : [])];
            try {
                await transporter.sendMail({
                    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
                    to: toList.join(', '),
                    subject: mail.subject,
                    html: `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"></head><body>${mail.body}</body></html>`,
                });
                await (0, mailQueueModel_1.marcarEnviado)(mail.id);
                console.log(`[mailer] Enviado → ${toList.join(', ')} (id ${mail.id})`);
            }
            catch (err) {
                await (0, mailQueueModel_1.marcarFalha)(mail.id);
                console.error(`[mailer] Falha → ${mail.to_email} (id ${mail.id}):`, err);
            }
        }
    }
    catch (err) {
        console.error('[mailer] Erro ao consultar fila:', err);
    }
}
function startMailWorker() {
    const INTERVAL_MS = 3 * 60 * 1000;
    console.log('[mailer] Worker iniciado — intervalo: 3 min');
    processQueue();
    setInterval(processQueue, INTERVAL_MS);
}
