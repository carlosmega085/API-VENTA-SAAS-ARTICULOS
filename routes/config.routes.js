import { Router } from 'express';
import saasConfigController from '../controllers/saasConfig.controller.js';

const router = Router();

// Endpoints para gestión de configuración global SaaS
router.get('/', saasConfigController.getConfigs);
router.put('/', saasConfigController.updateConfig);

export default router;
