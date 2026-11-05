import { Router } from 'express';
import { ReportController } from './report.controller';
import { optionalAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { CreateReportSchema } from '@bizpockethub/shared';

const router = Router();

router.post(
  '/businesses/:id/report',
  optionalAuth,
  validateBody(CreateReportSchema),
  ReportController.submitReport
);

export default router;
