import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usuarioRoutes from './usuario.routes.js';
import tiendaRoutes from './tienda.routes.js';
import empresaRoutes from './empresa.routes.js';
import peticionRoutes from './peticion.routes.js';

// RETAIL ROUTES
import catalogoRoutes from './catalogo.routes.js';
import productoRoutes from './producto.routes.js';
import inventarioRoutes from './inventario.routes.js';

// FINANCE & SALES ROUTES
import ventaRoutes from './venta.routes.js';
import clienteRoutes from './cliente.routes.js';
import cajaRoutes from './caja.routes.js';
import compraRoutes from './compra.routes.js';
import proRetailRoutes from './pro_retail.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/tiendas', tiendaRoutes);
router.use('/empresa', empresaRoutes);
router.use('/confirmar', peticionRoutes);

// RETAIL ENDPOINTS
router.use('/', catalogoRoutes); // Maneja /categorias, /atributos
router.use('/productos', productoRoutes);
router.use('/inventario', inventarioRoutes);

// FINANCE & SALES ENDPOINTS
router.use('/', ventaRoutes);    // Maneja /ventas, /clientes, /cajas
router.use('/compras', compraRoutes);

// PRO RETAIL MODULES
router.use('/', proRetailRoutes); // Habilita /gastos, /reportes/..., /devoluciones, etc.

export default router;
