import { Router } from 'express';
import productoController from '../controllers/producto.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { upload } from '../utils/multer.js';

const router = Router();

router.use(authenticate, tenantMiddleware);

router.get('/', productoController.getAll);
router.get('/:id', productoController.getById);

// Permitir subir múltiples imágenes (una por variante)
router.post('/', authorize('admin'), upload.array('imagenes'), productoController.create);
router.put('/:id', authorize('admin'), upload.array('imagenes'), productoController.update);
router.delete('/:id', authorize(['admin']), productoController.delete);

export default router;
