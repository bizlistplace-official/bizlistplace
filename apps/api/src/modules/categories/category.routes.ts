import { Router } from 'express';
import { CategoryController } from './category.controller';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';
import { validateBody } from '../../middleware/validate';
import { CreateCategorySchema } from '@bizpockethub/shared';

const router = Router();

router.get('/', CategoryController.list);
router.get('/:slug', CategoryController.getBySlug);
router.get('/:slug/businesses', CategoryController.getBusinessesByCategory);

// Admin-only endpoints
router.post(
  '/',
  requireAuth,
  requireRole(['admin']),
  validateBody(CreateCategorySchema),
  CategoryController.create
);

router.put(
  '/:id',
  requireAuth,
  requireRole(['admin']),
  CategoryController.update
);

router.patch(
  '/:id',
  requireAuth,
  requireRole(['admin']),
  CategoryController.update
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(['admin']),
  CategoryController.delete
);

export default router;
