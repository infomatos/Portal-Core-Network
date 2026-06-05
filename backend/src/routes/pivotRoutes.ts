import { Router } from 'express';
import { getPivotData, uploadPivot, deletePivot } from '../controllers/pivotController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', getPivotData);
router.post('/upload', authMiddleware, uploadPivot);
router.delete('/:id', authMiddleware, deletePivot);

export default router;
