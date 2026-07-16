import { Router } from 'express';
import EmpresaController from '../controllers/empresa.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import tenantMiddleware from '../middlewares/tenant.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

// Todas las rutas de empresa requieren autenticación y pertenecer a un tenant
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * @route   GET /api/empresa/me
 * @desc    Obtener datos de la empresa actual
 * @access  Admin
 */
router.get('/me', authorize(['admin']), EmpresaController.getMe);

/**
 * @route   PUT /api/empresa/me
 * @desc    Actualizar datos de la empresa actual
 * @access  Admin
 */
router.put('/me', authorize(['admin']), EmpresaController.updateMe);

export default router;
