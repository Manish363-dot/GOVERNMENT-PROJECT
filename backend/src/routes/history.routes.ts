import { Router } from 'express';
import * as historyController from '../controllers/history.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { getHistorySchema } from '../schemas/history.schema';

const router = Router();

// All history routes require authentication
router.use(authMiddleware, requireAdmin);

router.get('/', validate(getHistorySchema), historyController.getHistory);

export default router;
