import { Router } from 'express';
import inventarioController from '../controllers/inventario.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticate, tenantMiddleware);

router.get('/stock', inventarioController.getStock);
router.get('/movimientos', inventarioController.getMovimientos);
router.post('/ajuste', authorize('admin'), inventarioController.ajustarStock);

export default router;
