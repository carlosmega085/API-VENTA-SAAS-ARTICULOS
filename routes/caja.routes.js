import { Router } from 'express';
import cajaController from '../controllers/caja.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();
router.use(authenticate, tenantMiddleware);

router.get('/', cajaController.getByTienda);
router.post('/abrir', cajaController.abrirCaja);
router.post('/cerrar/:id', cajaController.cerrarCaja);
router.post('/:id/cerrar', cajaController.cerrarCaja);

export default router;
