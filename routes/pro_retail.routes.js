import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validarCajaAbierta } from '../middlewares/cajaValidation.middleware.js';
import { checkAction } from '../middlewares/actionControl.middleware.js';

// Import Controladores
import gastoController from '../controllers/gasto.controller.js';
import devolucionController from '../controllers/devolucion.controller.js';
import creditoController from '../controllers/credito.controller.js';
import transferenciaController from '../controllers/transferencia.controller.js';
import reporteController from '../controllers/reporte.controller.js';
import ventaController from '../controllers/venta.controller.js';

const router = Router();

// Middleware base para todas las rutas pro
router.use(authenticate, tenantMiddleware);

// --- GASTOS ---
router.post('/gastos', authorize(['admin', 'supervisor']), validarCajaAbierta, gastoController.registrarGasto);
router.get('/gastos', authorize(['admin', 'supervisor']), gastoController.listarGastos);

// --- DEVOLUCIONES ---
router.get('/devoluciones', authorize(['admin', 'supervisor']), devolucionController.listarDevoluciones);
router.get('/devoluciones/:id', authorize(['admin', 'supervisor']), devolucionController.obtenerDetalle);
router.post('/devoluciones', authorize(['admin', 'supervisor']), checkAction('procesar_devolucion'), devolucionController.procesarDevolucion);

// --- CRÉDITOS ---
router.post('/creditos/abono', authorize(['admin', 'supervisor', 'vendedor']), validarCajaAbierta, creditoController.registrarAbono);
router.get('/creditos/abonos', authorize(['admin', 'supervisor', 'vendedor']), creditoController.consultarAbonos);
router.get('/creditos', authorize(['admin', 'supervisor', 'vendedor']), creditoController.consultarCreditosPendientes);

// --- LOGÍSTICA ---
router.get('/transferencias', authorize(['admin', 'supervisor']), transferenciaController.listarTransferencias);
router.get('/transferencias/:id', authorize(['admin', 'supervisor']), transferenciaController.obtenerTransferencia);
router.post('/transferencias/enviar', authorize(['admin', 'supervisor']), checkAction('enviar_transferencia'), transferenciaController.enviarTransferencia);
router.post('/transferencias/:id/recibir', authorize(['admin', 'supervisor']), checkAction('recibir_transferencia'), transferenciaController.recibirTransferencia);

// --- REPORTES ---
router.get('/reportes/ventas', authorize(['admin']), reporteController.reporteVentas);
router.get('/reportes/top-productos', authorize(['admin']), reporteController.topProductos);
router.get('/reportes/inventario', authorize(['admin']), reporteController.reporteInventario);
router.get('/reportes/flujo-caja', authorize(['admin', 'supervisor', 'vendedor']), reporteController.flujoCaja);
router.get('/reportes/utilidad', authorize(['admin']), reporteController.reporteUtilidad);
router.get('/reportes/ventas-vendedores', authorize(['admin']), reporteController.ventasPorVendedor);

// --- VENTAS (Búsqueda extra) ---
router.get('/ventas/factura/:numero_factura', authorize(['admin', 'supervisor']), ventaController.getByFactura);

export default router;
