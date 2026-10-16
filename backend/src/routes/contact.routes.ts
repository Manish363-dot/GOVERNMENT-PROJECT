import { Router } from 'express';
import { validate } from '../middleware/validate';
import { contactFormSchema } from '../schemas/contact.schema';
import * as contactController from '../controllers/contact.controller';

const router = Router();

// Public: Citizen inquiry submission
router.post('/', validate(contactFormSchema), contactController.submitInquiry);

export default router;
