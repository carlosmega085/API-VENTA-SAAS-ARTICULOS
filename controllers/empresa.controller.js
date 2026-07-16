import EmpresaService from '../services/empresa.service.js';

class EmpresaController {
  async getMe(req, res) {
    try {
      const empresa = await EmpresaService.getEmpresaById(req.empresa_id);
      res.json({
        success: true,
        data: empresa
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateMe(req, res) {
    try {
      const empresa = await EmpresaService.updateEmpresa(req.empresa_id, req.body);
      res.json({
        success: true,
        message: 'Empresa actualizada correctamente',
        data: empresa
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new EmpresaController();
