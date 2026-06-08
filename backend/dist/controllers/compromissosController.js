"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompromissosData = getCompromissosData;
exports.uploadCompromissos = uploadCompromissos;
exports.deleteCompromissos = deleteCompromissos;
const compromissosModel_1 = require("../models/compromissosModel");
async function getCompromissosData(_req, res) {
    try {
        const uploads = await (0, compromissosModel_1.getAllCompromissos)();
        res.json(uploads.map(u => ({
            id: u.id,
            label: u.label,
            rows: JSON.parse(u.rows_data),
            uploadedAt: u.uploaded_at,
        })));
    }
    catch {
        res.status(500).json({ message: 'Erro ao buscar dados' });
    }
}
async function uploadCompromissos(req, res) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado' });
    }
    const { label, rows } = req.body;
    if (!label || !Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ message: 'Dados incompletos' });
    }
    try {
        await (0, compromissosModel_1.saveCompromissos)(label, rows, req.user.id);
        res.json({ message: 'Publicado com sucesso' });
    }
    catch {
        res.status(500).json({ message: 'Erro ao salvar' });
    }
}
async function deleteCompromissos(req, res) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado' });
    }
    try {
        await (0, compromissosModel_1.removeCompromissos)(Number(req.params.id));
        res.json({ message: 'Removido com sucesso' });
    }
    catch {
        res.status(500).json({ message: 'Erro ao remover' });
    }
}
