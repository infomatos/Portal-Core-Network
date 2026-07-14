import { Router } from 'express';
import { consultarAssistenteDemandas } from '../controllers/demandasController';

const router = Router();

router.post('/assistente', consultarAssistenteDemandas);

export default router;
