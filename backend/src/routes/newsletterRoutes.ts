import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { authMiddleware, requireAdmin } from '../middlewares/authMiddleware';
import {
  getSubscribers, addSubscriber, patchSubscriberStatus, removeSubscriber,
} from '../controllers/subscriberController';
import {
  getNewsletters, getNewsletter, createNewsletter, updateNewsletter,
  sendNewsletter, deleteNewsletter, duplicarNewsletterHandler,
} from '../controllers/newsletterController';

const router = Router();

// --- Upload de imagens (Unlayer) ---
const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '../../uploads/newsletter');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post(
  '/upload',
  authMiddleware, requireAdmin,
  upload.single('image'),
  (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ message: 'Nenhuma imagem recebida' });
    const baseUrl = process.env.UPLOAD_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/uploads/newsletter/${req.file.filename}`;
    res.json({ url });
  }
);

// --- Subscribers ---
router.get('/subscribers', authMiddleware, requireAdmin, getSubscribers);
router.post('/subscribers', authMiddleware, requireAdmin, addSubscriber);
router.patch('/subscribers/:id/status', authMiddleware, requireAdmin, patchSubscriberStatus);
router.delete('/subscribers/:id', authMiddleware, requireAdmin, removeSubscriber);

// --- Newsletters ---
router.get('/', authMiddleware, requireAdmin, getNewsletters);
router.get('/:id', authMiddleware, requireAdmin, getNewsletter);
router.post('/', authMiddleware, requireAdmin, createNewsletter);
router.put('/:id', authMiddleware, requireAdmin, updateNewsletter);
router.post('/:id/send', authMiddleware, requireAdmin, sendNewsletter);
router.post('/:id/duplicar', authMiddleware, requireAdmin, duplicarNewsletterHandler);
router.delete('/:id', authMiddleware, requireAdmin, deleteNewsletter);

export default router;
