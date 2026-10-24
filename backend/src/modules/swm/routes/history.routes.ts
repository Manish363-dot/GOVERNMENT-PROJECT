import { Router } from 'express';
import * as historyController from '../controllers/history.controller';
import { authMiddleware, requireAdmin } from '../../../shared/middleware/auth';
import { validate } from '../../../shared/middleware/validate';
import { getHistorySchema } from '../schemas/history.schema';

const router = Router();

// All history routes require authentication
router.use(authMiddleware, requireAdmin);

router.get('/', validate(getHistorySchema), historyController.getHistory);

export default router;
