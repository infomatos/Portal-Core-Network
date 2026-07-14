import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { authMiddleware, requireAdmin } from '../middlewares/authMiddleware';
import {
  getForumPosts, getForumPost, getForumPostsAdmin, getForumPostAdmin,
  createForumPost, updateForumPost, deleteForumPost,
} from '../controllers/forumController';

const router = Router();

const uploadDir = process.env.FORUM_UPLOAD_DIR
  ? path.resolve(process.env.FORUM_UPLOAD_DIR)
  : path.join(__dirname, '../../uploads/forum');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const allowedExt = new Set([
  '.pdf', '.ppt', '.pptx', '.doc', '.docx', '.xls', '.xlsx',
  '.jpg', '.jpeg', '.png',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExt.has(ext)) return cb(new Error('Tipo de arquivo nao permitido'));
    cb(null, true);
  },
});

function handleUploadError(err: unknown, _req: Request, res: Response, next: Function) {
  if (!err) return next();
  const message = err instanceof Error ? err.message : 'Erro no upload';
  return res.status(400).json({ message });
}

router.get('/', getForumPosts);
router.get('/admin', authMiddleware, requireAdmin, getForumPostsAdmin);
router.get('/admin/:id', authMiddleware, requireAdmin, getForumPostAdmin);
router.post('/', authMiddleware, requireAdmin, upload.single('attachment'), handleUploadError, createForumPost);
router.put('/:id', authMiddleware, requireAdmin, upload.single('attachment'), handleUploadError, updateForumPost);
router.delete('/:id', authMiddleware, requireAdmin, deleteForumPost);
router.get('/:slug', getForumPost);

export default router;
