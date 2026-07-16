import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validarCajaAbierta } from '../middlewares/cajaValidation.middleware.js';
import { checkAction } from '../middlewares/actionControl.middleware.js';

// Usaré importación individual para evitar errores si no existe controllers/index.js aún
import vController from '../controllers/venta.controller.js';
import cController from '../controllers/cliente.controller.js';
import boxController from '../controllers/caja.controller.js';

const router = Router();
router.use(authenticate, tenantMiddleware);

// Clientes
router.get('/clientes', cController.getAll);
router.post('/clientes', cController.create);

// Cajas
router.get('/cajas', boxController.getByTienda);
router.get('/cajas/activa', boxController.getActiva);
router.post('/cajas/abrir', boxController.abrirCaja);
router.post('/cajas/:id/cerrar', boxController.cerrarCaja);

// Ventas
router.get('/ventas', vController.getAll);
router.post('/ventas', vController.create);
router.get('/ventas/factura/:numero_factura', authorize(['admin', 'supervisor']), vController.getByFactura);

export default router;
