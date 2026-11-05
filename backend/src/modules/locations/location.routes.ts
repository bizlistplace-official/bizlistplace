import { Router } from 'express';
import { LocationController } from './location.controller';

const router = Router();

router.get('/countries', LocationController.listCountries);
router.get('/cities', LocationController.listCities);

export default router;
