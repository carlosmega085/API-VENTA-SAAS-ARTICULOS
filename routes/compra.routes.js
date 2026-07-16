import { Router } from 'express';
import compraController from '../controllers/compra.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación y pertenecer a una empresa (tenant)
router.use(authenticate, tenantMiddleware);

// --- PROVEEDORES ---
router.get('/proveedores', authorize(['admin', 'supervisor']), compraController.listarProveedores);
router.post('/proveedores', authorize(['admin']), compraController.crearProveedor);

// --- COMPRAS ---
router.post('/', authorize(['admin', 'supervisor']), compraController.registrarCompra);

export default router;
