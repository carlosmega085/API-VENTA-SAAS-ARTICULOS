import { Router } from 'express';
import { 
  crearSuscripcion, 
  listarSuscripciones, 
  aprobarSuscripcion, 
  denegarSuscripcion,
  editarSuscripcion 
} from './suscripcion.controller.js';
import { 
  validateCrearSuscripcion, 
  validateEstadoSuscripcion, 
  validateSuscripcionId,
  validateEditarSuscripcion 
} from './suscripcion.validator.js';

const router = Router();

router.post('/', validateCrearSuscripcion, crearSuscripcion);
router.get('/', listarSuscripciones);
router.put('/:id', validateSuscripcionId, validateEditarSuscripcion, editarSuscripcion);
router.put('/:id/aprobar', validateSuscripcionId, validateEstadoSuscripcion, aprobarSuscripcion);
router.put('/:id/denegar', validateSuscripcionId, denegarSuscripcion);

export default router;
