import { Router } from 'express';
import { rentalController } from './controllers/rental.controller';

const router = Router();

// Module Health & Info
router.get('/', (req, res) => rentalController.getRoot(req, res));
router.get('/health', (req, res) => rentalController.getHealth(req, res));

// Tenant Dues Search / Quick Pay
router.get('/dues/search', (req, res) => rentalController.searchDues(req, res));

// Citizen Feedback / Grievance for Rental Properties
router.post('/feedback', (req, res) => rentalController.submitFeedback(req, res));

export default router;
