import { Router } from 'express';
import { BusinessController } from './business.controller';
import { requireAuth, optionalAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { CreateBusinessSchema, BusinessLocationSchema } from '@bizpockethub/shared';

const router = Router();

router.get('/', BusinessController.list);
router.get('/featured', BusinessController.getFeatured);
router.get('/recent', BusinessController.getRecent);
router.get('/:slug', optionalAuth, BusinessController.getBySlug);

// Protected routes
router.post('/', requireAuth, validateBody(CreateBusinessSchema), BusinessController.create);
router.patch('/:id', requireAuth, BusinessController.update);
router.delete('/:id', requireAuth, BusinessController.delete);

// Locations routes
router.get('/:id/locations', BusinessController.getLocations);
router.post('/:id/locations', requireAuth, validateBody(BusinessLocationSchema), BusinessController.addLocation);

export default router;
