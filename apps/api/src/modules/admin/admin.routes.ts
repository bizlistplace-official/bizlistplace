import { Router } from 'express';
import { AdminController } from './admin.controller';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';

const router = Router();

// Protect all admin routes with authentication and role admin
router.use(requireAuth, requireRole(['admin']));

router.get('/stats', AdminController.getStats);
router.get('/businesses', AdminController.getAllBusinesses);
router.get('/businesses/pending', AdminController.getPendingBusinesses);
router.patch('/businesses/:id/approve', AdminController.approveBusiness);
router.patch('/businesses/:id/reject', AdminController.rejectBusiness);
router.patch('/businesses/:id/suspend', AdminController.suspendBusiness);
router.patch('/businesses/:id/toggle-featured', AdminController.toggleFeatured);
router.patch('/businesses/:id/verify', AdminController.setVerification);

router.get('/claims', AdminController.getClaims);
router.patch('/claims/:id/approve', AdminController.approveClaim);
router.patch('/claims/:id/reject', AdminController.rejectClaim);

router.get('/reports', AdminController.getReports);
router.patch('/reports/:id/resolve', AdminController.resolveReport);

router.get('/audit-logs', AdminController.getAuditLogs);

// Email & SMTP Diagnostics
router.post('/test-email', AdminController.testEmail);
router.get('/verify-smtp', AdminController.verifySmtp);

export default router;
