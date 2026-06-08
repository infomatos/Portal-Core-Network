import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import pool from './config/database';
import authRoutes from './routes/authRoutes';
import pivotRoutes from './routes/pivotRoutes';
import compromissosRoutes from './routes/compromissosRoutes';
import newsletterRoutes from './routes/newsletterRoutes';
import { startMailWorker } from './workers/mailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const uploadsDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '../uploads/newsletter');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads/newsletter', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/pivot', pivotRoutes);
app.use('/api/compromissos', compromissosRoutes);
app.use('/api/newsletter', newsletterRoutes);

pool.getConnection()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    startMailWorker();
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
