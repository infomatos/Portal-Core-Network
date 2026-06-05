import { Router } from 'express';
import { getCompromissosData, uploadCompromissos, deleteCompromissos } from '../controllers/compromissosController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', getCompromissosData);
router.post('/upload', authMiddleware, uploadCompromissos);
router.delete('/:id', authMiddleware, deleteCompromissos);

export default router;
