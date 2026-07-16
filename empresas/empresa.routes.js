import { Router } from 'express';
import { 
  crearEmpresa, 
  listarEmpresas, 
  obtenerEmpresa, 
  editarEmpresa, 
  anularEmpresa,
  obtenerAdmin,
  actualizarAdmin
} from './empresa.controller.js';
import { 
  validateCrearEmpresa, 
  validateEditarEmpresa, 
  validateIdParam,
  validateActualizarAdmin
} from './empresa.validator.js';

const router = Router();

router.post('/', validateCrearEmpresa, crearEmpresa);
router.get('/', listarEmpresas);
router.get('/:id', validateIdParam, obtenerEmpresa);
router.put('/:id', validateIdParam, validateEditarEmpresa, editarEmpresa);
router.delete('/:id', validateIdParam, anularEmpresa); // Soft delete

// Administración de credenciales de usuario Admin de la empresa
router.get('/:id/admin', validateIdParam, obtenerAdmin);
router.put('/:id/admin/:usuarioId', validateIdParam, validateActualizarAdmin, actualizarAdmin);

export default router;
