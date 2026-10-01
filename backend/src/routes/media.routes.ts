import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { uploadMedia } from '../middleware/upload';
import { validate } from '../middleware/validate';
import { addDailyWorkSchema, mediaIdParamSchema } from '../schemas/media.schema';
import {
  addBlogMedia,
  getBlogMedia,
  deleteBlogMedia,
  addDailyWork,
  getDailyWork,
  deleteDailyWork
} from '../controllers/media.controller';

const router = Router();

// Blog Media
router.post('/blog', authMiddleware, requireAdmin, uploadMedia.single('file'), addBlogMedia);
router.get('/blog', getBlogMedia);
router.delete('/blog/:id', authMiddleware, requireAdmin, validate(mediaIdParamSchema), deleteBlogMedia);

// Daily Work
// Note: validate must come after uploadMedia because multer parses the multipart/form-data body
router.post('/daily-work', authMiddleware, requireAdmin, uploadMedia.single('file'), validate(addDailyWorkSchema), addDailyWork);
router.get('/daily-work', getDailyWork);
router.delete('/daily-work/:id', authMiddleware, requireAdmin, validate(mediaIdParamSchema), deleteDailyWork);

export default router;
