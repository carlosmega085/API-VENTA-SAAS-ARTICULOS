import { Router } from 'express';
import clienteController from '../controllers/cliente.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();
router.use(authenticate, tenantMiddleware);

router.get('/', clienteController.getAll);
router.post('/', clienteController.create);
router.get('/:id', clienteController.getHistorial);
router.put('/:id', clienteController.update);
router.delete('/:id', clienteController.delete);
router.get('/:id/historial', clienteController.getHistorial);

export default router;
