"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPivotData = getPivotData;
exports.uploadPivot = uploadPivot;
exports.deletePivot = deletePivot;
const pivotModel_1 = require("../models/pivotModel");
async function getPivotData(_req, res) {
    try {
        const uploads = await (0, pivotModel_1.getAllUploads)();
        res.json(uploads.map(u => {
            const parsed = JSON.parse(u.rows_data);
            const rows = Array.isArray(parsed) ? parsed : (parsed.rows ?? []);
            const ctd_summary = Array.isArray(parsed) ? [] : (parsed.ctd_summary ?? []);
            return { id: u.id, year: u.year, label: u.label, rows, ctd_summary, uploadedAt: u.uploaded_at };
        }));
    }
    catch {
        res.status(500).json({ message: 'Erro ao buscar dados' });
    }
}
async function uploadPivot(req, res) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado' });
    }
    const { year, label, rows, ctd_summary } = req.body;
    if (!year || !label || !Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ message: 'Dados incompletos' });
    }
    try {
        await (0, pivotModel_1.saveUpload)(Number(year), label, rows, ctd_summary ?? [], req.user.id);
        res.json({ message: 'Publicado com sucesso' });
    }
    catch {
        res.status(500).json({ message: 'Erro ao salvar' });
    }
}
async function deletePivot(req, res) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado' });
    }
    try {
        await (0, pivotModel_1.removeUpload)(Number(req.params.id));
        res.json({ message: 'Removido com sucesso' });
    }
    catch {
        res.status(500).json({ message: 'Erro ao remover' });
    }
}
