import productoService from '../services/producto.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { productoSchema } from '../validations/producto.validation.js';

class ProductoController {
  async getAll(req, res) {
    try {
      const result = await productoService.getAll(req.empresa_id);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async getById(req, res) {
    try {
      const result = await productoService.getById(req.params.id, req.empresa_id);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async create(req, res) {
    try {
      // Nota: El body vendrá con datos anidados si se usa JSON, 
      // pero si se suben archivos (multer), hay que parsear los strings de JSON.
      let { productData, variantsData } = req.body;
      
      if (typeof productData === 'string') productData = JSON.parse(productData);
      if (typeof variantsData === 'string') variantsData = JSON.parse(variantsData);

      const files = req.files || []; // Multer array of files

      // Validar con Joi
      const { error } = productoSchema.validate({ productData, variantsData });
      if (error) {
        return sendError(res, error.details[0].message, 400);
      }

      const result = await productoService.create(req.empresa_id, { productData, variantsData }, files);
      return sendSuccess(res, result, 'Producto y variantes creados exitosamente', 201);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async update(req, res) {
    try {
      let { productData, variantsData } = req.body;
      
      if (typeof productData === 'string') productData = JSON.parse(productData);
      if (typeof variantsData === 'string') variantsData = JSON.parse(variantsData);

      const files = req.files || [];

      // Validar con Joi
      const { error } = productoSchema.validate({ productData, variantsData });
      if (error) {
        return sendError(res, error.details[0].message, 400);
      }

      const result = await productoService.update(req.params.id, req.empresa_id, { productData, variantsData }, files);
      return sendSuccess(res, result, 'Producto actualizado correctamente');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async delete(req, res) {
    try {
      await productoService.delete(req.params.id, req.empresa_id);
      return sendSuccess(res, null, 'Producto eliminado correctamente');
    } catch (error) {
      return sendError(res, error.message);
    }
  }
}

export default new ProductoController();
