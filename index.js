import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { sequelize } from './models/index.js';
import routes from './routes/index.js';
import cleanupService from './services/cleanup.service.js';

import saasRoutes from './saas.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares Base ────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ─── Ruta base (health check) ────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'RETAIL SAAS API',
    status: 'online',
    version: '1.0.0',
  });
});

// ─── Rutas SAAS Admin ────────────────────────────────
app.use('/api/saas', saasRoutes);

// ─── Rutas principales ───────────────────────────────
app.use('/api', routes);

// ─── 404 Handler ────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    method: req.method,
    url: req.originalUrl,
  });
});

// ─── Error Handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── Server Init ─────────────────────────────────────
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Iniciar Job de limpieza automática
    cleanupService.init();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

startServer();