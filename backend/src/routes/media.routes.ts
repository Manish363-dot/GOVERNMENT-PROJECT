import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { uploadMedia } from '../middleware/upload';
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
router.post('/blog', authMiddleware, uploadMedia.single('file'), addBlogMedia);
router.get('/blog', getBlogMedia);
router.delete('/blog/:id', authMiddleware, deleteBlogMedia);

// Daily Work
router.post('/daily-work', authMiddleware, uploadMedia.single('file'), addDailyWork);
router.get('/daily-work', getDailyWork);
router.delete('/daily-work/:id', authMiddleware, deleteDailyWork);

export default router;
