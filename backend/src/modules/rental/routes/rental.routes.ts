import { Router } from 'express';
import { rentalController } from '../controllers/rental.controller';

const router = Router();

// Module Health & Info
router.get('/', (req, res) => rentalController.getRoot(req, res));
router.get('/health', (req, res) => rentalController.getHealth(req, res));

// Tenant Dues Search / Quick Pay
router.get('/dues/search', (req, res) => rentalController.searchDues(req, res));

// Citizen Feedback / Grievance for Rental Properties
router.post('/feedback', (req, res) => rentalController.submitFeedback(req, res));

// ── Rental Authentication & Role-Based Management Routes ───────────────────
import rentalAuthRoutes from './rentalAuth.routes';
router.use('/auth', rentalAuthRoutes);

// ── Tenant Registration, S3 Documents & Directory Routes ───────────────────
import rentalUserRoutes from './rentalUser.routes';
router.use('/users', rentalUserRoutes);

// ── Commercial Properties & Rent Revisions Routes ───────────────────────────
import rentalPropertyRoutes from './rentalProperty.routes';
router.use('/properties', rentalPropertyRoutes);

// ── Monthly Billing, Arrears & Dues Search Routes ───────────────────────────
import rentalBillingRoutes from './rentalBilling.routes';
router.use('/bills', rentalBillingRoutes);

// ── Payments Gateway & Municipal Counter Collections Routes ─────────────────
import rentalPaymentRoutes from './rentalPayment.routes';
router.use('/payments', rentalPaymentRoutes);

// ── Public & Tenant Notices / Orders Routes ─────────────────────────────────
import rentalNoticeRoutes from './rentalNotice.routes';
router.use('/notices', rentalNoticeRoutes);

export default router;
