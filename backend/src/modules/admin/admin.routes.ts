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

// Payments & Subscriptions
router.get('/payments', AdminController.getPayments);

// Customer Reviews Moderation
router.get('/reviews', AdminController.getAllReviews);
router.delete('/reviews/:id', AdminController.deleteReview);

// User Accounts Directory
router.get('/users', AdminController.getAllUsers);
router.patch('/users/:id/role', AdminController.updateUserRole);
router.patch('/users/:id/toggle-status', AdminController.toggleUserStatus);
router.patch('/users/:id/spam', AdminController.spamUser);
router.patch('/users/:id/unspam', AdminController.unspamUser);
router.delete('/users/:id', AdminController.deleteUser);

// Email Management & Diagnostics
router.get('/emails/stats', AdminController.getEmailStats);
router.get('/emails/log', AdminController.getEmailLogs);
router.post('/emails/send', AdminController.sendEmail);
router.post('/test-email', AdminController.testEmail);
router.get('/verify-smtp', AdminController.verifySmtp);

// Activity Stream & Backup Export (Phase 6)
router.get('/activity-log', AdminController.getActivityLogs);
router.get('/export', AdminController.exportBackup);

// Platform & Payment Settings (Phase 7)
router.get('/settings', AdminController.getSettings);
router.patch('/settings', AdminController.updateSettings);

export default router;
