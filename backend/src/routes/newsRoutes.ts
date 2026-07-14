import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { authMiddleware, requireAdminOrModerador } from '../middlewares/authMiddleware';
import {
  getNoticias, getTop, getNoticia, getRelacionadas,
  getAllAdmin, getNoticiaAdmin,
  createNoticia, updateNoticia, deleteNoticia,
} from '../controllers/newsController';

const router = Router();

// --- Uploads da News ---
const uploadDir = process.env.NEWS_UPLOAD_DIR
  ? path.resolve(process.env.NEWS_UPLOAD_DIR)
  : path.join(__dirname, '../../uploads/news');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadPdf = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Apenas arquivos PDF são permitidos'));
  },
});

router.post(
  '/upload',
  authMiddleware, requireAdminOrModerador,
  upload.single('image'),
  (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ message: 'Nenhuma imagem recebida' });
    const baseUrl = process.env.UPLOAD_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
    res.json({ url: `${baseUrl}/uploads/news/${req.file.filename}` });
  }
);

router.post(
  '/upload-pdf',
  authMiddleware, requireAdminOrModerador,
  uploadPdf.single('pdf'),
  (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ message: 'Nenhum PDF recebido' });
    const baseUrl = process.env.UPLOAD_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
    res.json({
      url: `${baseUrl}/uploads/news/${req.file.filename}`,
      name: req.file.originalname,
      size: req.file.size,
    });
  }
);

// Rotas públicas — devem vir antes de /:slug
router.get('/', getNoticias);
router.get('/top', getTop);
router.get('/relacionadas/:slug', getRelacionadas);

// Rotas de admin — devem vir antes de /:id
router.get('/admin', authMiddleware, requireAdminOrModerador, getAllAdmin);
router.get('/admin/:id', authMiddleware, requireAdminOrModerador, getNoticiaAdmin);
router.post('/', authMiddleware, requireAdminOrModerador, createNoticia);
router.put('/:id', authMiddleware, requireAdminOrModerador, updateNoticia);
router.delete('/:id', authMiddleware, requireAdminOrModerador, deleteNoticia);

// Rota paramétrica — deve ser a última
router.get('/:slug', getNoticia);

export default router;
