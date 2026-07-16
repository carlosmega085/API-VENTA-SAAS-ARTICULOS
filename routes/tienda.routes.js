import { Router } from 'express';
import tiendaController from '../controllers/tienda.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticate, tenantMiddleware);

// Solo administradores pueden gestionar tiendas
router.post('/', authorize('admin'), tiendaController.create);
router.get('/', tiendaController.getAll);
router.put('/:id', authorize('admin'), tiendaController.update);
router.delete('/:id', authorize('admin'), tiendaController.delete);

export default router;
