import { Router } from 'express';
import catalogoController from '../controllers/catalogo.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticate, tenantMiddleware);

// Categorías
router.get('/categorias', catalogoController.getCategorias);
router.post('/categorias', authorize('admin'), catalogoController.createCategoria);
router.put('/categorias/:id', authorize('admin'), catalogoController.updateCategoria);
router.delete('/categorias/:id', authorize('admin'), catalogoController.deleteCategoria);

// Atributos (Talla, Color, etc)
router.get('/atributos', catalogoController.getAtributos);
router.post('/atributos', authorize('admin'), catalogoController.createAtributo);
router.post('/atributos/:id/valores', authorize('admin'), catalogoController.addValoresAtributo);
router.put('/atributos/valores/:valor_id', authorize('admin'), catalogoController.updateValorAtributo);

export default router;
