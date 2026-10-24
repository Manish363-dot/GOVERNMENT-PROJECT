import { Router } from 'express';
import { validate } from '../middleware/validate';
import { contactFormSchema } from './contact.schema';
import * as contactController from './contact.controller';

const router = Router();

// Public: Citizen inquiry submission
router.post('/', validate(contactFormSchema), contactController.submitInquiry);

export default router;
