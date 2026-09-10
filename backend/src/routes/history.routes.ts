import { Router } from 'express';
import * as historyController from '../controllers/history.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All history routes require authentication
router.use(authMiddleware);

router.get('/', historyController.getHistory);

export default router;
