import { Router } from 'express';
import usuarioController from '../controllers/usuario.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import tenantMiddleware from '../middlewares/tenant.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { createUsuarioSchema, updateUsuarioSchema } from '../validations/usuario.validation.js';

const router = Router();
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  next();
};

router.use(authenticate);
router.use(tenantMiddleware);
router.use(authorize(['admin'])); // Only admins can manage users

router.get('/', usuarioController.getAll);
router.post('/', validate(createUsuarioSchema), usuarioController.create);
router.put('/:id', validate(updateUsuarioSchema), usuarioController.update);
router.delete('/:id', usuarioController.delete);

export default router;
