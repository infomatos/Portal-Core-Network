"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewsletters = getNewsletters;
exports.getNewsletter = getNewsletter;
exports.createNewsletter = createNewsletter;
exports.updateNewsletter = updateNewsletter;
exports.sendNewsletter = sendNewsletter;
exports.duplicarNewsletterHandler = duplicarNewsletterHandler;
exports.deleteNewsletter = deleteNewsletter;
const newsletterModel_1 = require("../models/newsletterModel");
const subscriberModel_1 = require("../models/subscriberModel");
const mailQueueModel_1 = require("../models/mailQueueModel");
async function getNewsletters(_req, res) {
    try {
        const newsletters = await (0, newsletterModel_1.listarNewsletters)();
        res.json(newsletters);
    }
    catch (e) {
        console.error('[newsletter] getNewsletters:', e);
        res.status(500).json({ message: 'Erro ao listar newsletters' });
    }
}
async function getNewsletter(req, res) {
    const id = Number(req.params.id);
    try {
        const newsletter = await (0, newsletterModel_1.buscarNewsletter)(id);
        if (!newsletter)
            return res.status(404).json({ message: 'Newsletter não encontrada' });
        res.json(newsletter);
    }
    catch (e) {
        console.error('[newsletter] getNewsletter:', e);
        res.status(500).json({ message: 'Erro ao buscar newsletter' });
    }
}
async function createNewsletter(req, res) {
    const { title, body, design } = req.body;
    if (!title || !body || !design) {
        return res.status(400).json({ message: 'Título, body e design são obrigatórios' });
    }
    try {
        const id = await (0, newsletterModel_1.criarNewsletter)(title.trim(), body, design);
        res.status(201).json({ message: 'Rascunho salvo', id });
    }
    catch (e) {
        console.error('[newsletter] createNewsletter:', e);
        res.status(500).json({ message: 'Erro ao criar newsletter' });
    }
}
async function updateNewsletter(req, res) {
    const id = Number(req.params.id);
    const { title, body, design } = req.body;
    if (!title || !body || !design) {
        return res.status(400).json({ message: 'Título, body e design são obrigatórios' });
    }
    try {
        await (0, newsletterModel_1.atualizarNewsletter)(id, title.trim(), body, design);
        res.json({ message: 'Rascunho atualizado' });
    }
    catch (e) {
        console.error('[newsletter] updateNewsletter:', e);
        res.status(500).json({ message: 'Erro ao atualizar newsletter' });
    }
}
async function sendNewsletter(req, res) {
    const id = Number(req.params.id);
    try {
        const newsletter = await (0, newsletterModel_1.buscarNewsletter)(id);
        if (!newsletter)
            return res.status(404).json({ message: 'Newsletter não encontrada' });
        if (newsletter.status === 'sent') {
            return res.status(400).json({ message: 'Esta newsletter já foi enviada' });
        }
        const subscribers = await (0, subscriberModel_1.listarAtivos)();
        if (subscribers.length === 0) {
            return res.status(400).json({ message: 'Nenhum subscriber ativo encontrado' });
        }
        for (const sub of subscribers) {
            await (0, mailQueueModel_1.enfileirar)(sub.email, newsletter.title, newsletter.body);
        }
        await (0, newsletterModel_1.marcarEnviada)(id);
        res.json({ message: `Newsletter enfileirada para ${subscribers.length} subscriber(s)` });
    }
    catch (e) {
        console.error('[newsletter] sendNewsletter:', e);
        res.status(500).json({ message: 'Erro ao enviar newsletter' });
    }
}
async function duplicarNewsletterHandler(req, res) {
    const id = Number(req.params.id);
    try {
        const novoId = await (0, newsletterModel_1.duplicarNewsletter)(id);
        res.status(201).json({ message: 'Newsletter duplicada como rascunho', id: novoId });
    }
    catch (e) {
        console.error('[newsletter] duplicar:', e);
        res.status(500).json({ message: 'Erro ao duplicar newsletter' });
    }
}
async function deleteNewsletter(req, res) {
    const id = Number(req.params.id);
    try {
        await (0, newsletterModel_1.deletarNewsletter)(id);
        res.json({ message: 'Rascunho removido' });
    }
    catch (e) {
        console.error('[newsletter] deleteNewsletter:', e);
        res.status(500).json({ message: 'Erro ao remover newsletter' });
    }
}
