"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscribers = getSubscribers;
exports.addSubscriber = addSubscriber;
exports.patchSubscriberStatus = patchSubscriberStatus;
exports.removeSubscriber = removeSubscriber;
const subscriberModel_1 = require("../models/subscriberModel");
async function getSubscribers(req, res) {
    try {
        const subscribers = await (0, subscriberModel_1.listarSubscribers)();
        res.json(subscribers);
    }
    catch (e) {
        console.error('[subscribers] getSubscribers:', e);
        res.status(500).json({ message: 'Erro ao listar subscribers' });
    }
}
async function addSubscriber(req, res) {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ message: 'Nome e email são obrigatórios' });
    }
    try {
        await (0, subscriberModel_1.adicionarSubscriber)(name.trim(), email.trim().toLowerCase());
        res.status(201).json({ message: 'Subscriber adicionado com sucesso' });
    }
    catch (e) {
        if (e.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Este email já está cadastrado' });
        }
        console.error('[subscribers] addSubscriber:', e);
        res.status(500).json({ message: 'Erro ao adicionar subscriber' });
    }
}
async function patchSubscriberStatus(req, res) {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ message: 'Status inválido' });
    }
    try {
        await (0, subscriberModel_1.alterarStatus)(id, status);
        res.json({ message: 'Status atualizado' });
    }
    catch (e) {
        console.error('[subscribers] patchStatus:', e);
        res.status(500).json({ message: 'Erro ao atualizar status' });
    }
}
async function removeSubscriber(req, res) {
    const id = Number(req.params.id);
    try {
        await (0, subscriberModel_1.deletarSubscriber)(id);
        res.json({ message: 'Subscriber removido' });
    }
    catch (e) {
        console.error('[subscribers] removeSubscriber:', e);
        res.status(500).json({ message: 'Erro ao remover subscriber' });
    }
}
