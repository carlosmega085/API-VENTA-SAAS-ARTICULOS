import { Router } from 'express';
import { 
  crearPlan, 
  listarPlanes, 
  editarPlan, 
  anularPlan 
} from './plan.controller.js';
import { 
  validateCrearPlan, 
  validateEditarPlan, 
  validatePlanId 
} from './plan.validator.js';

const router = Router();

router.post('/', validateCrearPlan, crearPlan);
router.get('/', listarPlanes);
router.put('/:id', validatePlanId, validateEditarPlan, editarPlan);
router.delete('/:id', validatePlanId, anularPlan); // Soft delete

export default router;
