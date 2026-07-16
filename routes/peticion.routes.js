import { Router } from 'express';
import peticionController from '../controllers/peticion.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import tenantMiddleware from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);

/**
 * Consulta el estado de una petición mediante su request_id.
 * Útil tras un error de red "Network request failed".
 */
router.get('/:request_id', peticionController.confirmar);

export default router;
