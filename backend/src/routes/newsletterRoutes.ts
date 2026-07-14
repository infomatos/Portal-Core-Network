import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { authMiddleware, requireAdminOrModerador } from '../middlewares/authMiddleware';
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
  authMiddleware, requireAdminOrModerador,
  upload.single('image'),
  (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ message: 'Nenhuma imagem recebida' });
    const baseUrl = process.env.UPLOAD_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/uploads/newsletter/${req.file.filename}`;
    res.json({ url });
  }
);

// --- Subscribers ---
router.post('/subscribe', addSubscriber);
router.get('/subscribers', authMiddleware, requireAdminOrModerador, getSubscribers);
router.post('/subscribers', authMiddleware, requireAdminOrModerador, addSubscriber);
router.patch('/subscribers/:id/status', authMiddleware, requireAdminOrModerador, patchSubscriberStatus);
router.delete('/subscribers/:id', authMiddleware, requireAdminOrModerador, removeSubscriber);

// --- Newsletters ---
router.get('/', authMiddleware, requireAdminOrModerador, getNewsletters);
router.get('/:id', authMiddleware, requireAdminOrModerador, getNewsletter);
router.post('/', authMiddleware, requireAdminOrModerador, createNewsletter);
router.put('/:id', authMiddleware, requireAdminOrModerador, updateNewsletter);
router.post('/:id/send', authMiddleware, requireAdminOrModerador, sendNewsletter);
router.post('/:id/duplicar', authMiddleware, requireAdminOrModerador, duplicarNewsletterHandler);
router.delete('/:id', authMiddleware, requireAdminOrModerador, deleteNewsletter);

export default router;
