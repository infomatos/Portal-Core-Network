"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const database_1 = __importDefault(require("./config/database"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const pivotRoutes_1 = __importDefault(require("./routes/pivotRoutes"));
const compromissosRoutes_1 = __importDefault(require("./routes/compromissosRoutes"));
const newsletterRoutes_1 = __importDefault(require("./routes/newsletterRoutes"));
const mailer_1 = require("./workers/mailer");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((req, _res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
const uploadsDir = process.env.UPLOAD_DIR
    ? path_1.default.resolve(process.env.UPLOAD_DIR)
    : path_1.default.join(__dirname, '../uploads/newsletter');
if (!fs_1.default.existsSync(uploadsDir))
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads/newsletter', express_1.default.static(uploadsDir));
app.use('/api/auth', authRoutes_1.default);
app.use('/api/pivot', pivotRoutes_1.default);
app.use('/api/compromissos', compromissosRoutes_1.default);
app.use('/api/newsletter', newsletterRoutes_1.default);
database_1.default.getConnection()
    .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    (0, mailer_1.startMailWorker)();
})
    .catch(error => {
    console.error('Erro ao conectar ao banco de dados:', error);
});
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'backend rodando' });
});
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
