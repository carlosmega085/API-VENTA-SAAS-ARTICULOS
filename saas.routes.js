import { Router } from 'express';
import authMiddleware from './middlewares/auth.middleware.js';
import { authorize } from './middlewares/role.middleware.js';

// ─── Imports SaaS Admin ──────────────────────────────
import empresaRoutes from './empresas/empresa.routes.js';
import planRoutes from './planes/plan.routes.js';
import suscripcionRoutes from './suscripciones/suscripcion.routes.js';
import configRoutes from './routes/config.routes.js';

// NEW RETAIL MONITORING
import monitoreoController from './controllers/saas/monitoreo.controller.js';

const router = Router();

// ─── Proteger rutas globales SaaS (vía JWT Local con rol superadmin) ────────
router.use(authMiddleware);
router.use(authorize(['superadmin']));

// ─── Rutas SaaS Admin ────────────────────────────────
router.use('/empresas', empresaRoutes);
router.use('/planes', planRoutes);
router.use('/suscripciones', suscripcionRoutes);
router.use('/config', configRoutes);

// MOTOR OPERATIVO RETAIL
router.get('/monitoreo', monitoreoController.getDashboard);
router.get('/status-empresas', monitoreoController.getEmpresasStatus);
router.post('/categorias-globales', monitoreoController.createGlobalCategory);

export default router;
