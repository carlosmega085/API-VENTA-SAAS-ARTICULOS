import { categoriaService, atributoService } from '../services/catalogo.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

class CatalogoController {
  // Categrias
  async getCategorias(req, res) {
    try {
      const result = await categoriaService.getAll(req.empresa_id);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async createCategoria(req, res) {
    try {
      const result = await categoriaService.create(req.empresa_id, req.body);
      return sendSuccess(res, result, 'Categoría creada');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async updateCategoria(req, res) {
    try {
      const result = await categoriaService.update(req.params.id, req.empresa_id, req.body);
      return sendSuccess(res, result, 'Categoría actualizada');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async deleteCategoria(req, res) {
    try {
      await categoriaService.delete(req.params.id, req.empresa_id);
      return sendSuccess(res, null, 'Categoría eliminada');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  // Atributos
  async getAtributos(req, res) {
    try {
      const result = await atributoService.getAll(req.empresa_id);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async createAtributo(req, res) {
    try {
      const result = await atributoService.create(req.empresa_id, req.body);
      return sendSuccess(res, result, 'Atributo y valores creados');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async addValoresAtributo(req, res) {
    try {
      const { valores, valor } = req.body;
      const input = valores || valor; // Aceptar cualquiera de los dos
      const result = await atributoService.addValores(req.params.id, req.empresa_id, input);
      return sendSuccess(res, result, 'Valores agregados correctamente');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async updateValorAtributo(req, res) {
    try {
      const { valor } = req.body;
      const result = await atributoService.updateValor(req.params.valor_id, req.empresa_id, valor);
      return sendSuccess(res, result, 'Valor actualizado correctamente');
    } catch (error) {
      return sendError(res, error.message);
    }
  }
}

export default new CatalogoController();
