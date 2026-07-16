import { EmpresaService } from './empresa.service.js';

export const crearEmpresa = async (req, res, next) => {
  try {
    const result = await EmpresaService.crearEmpresa(req.body);
    res.status(201).json({
      success: true,
      message: 'Empresa creada exitosamente con usuario admin, suscripción pendiente y catálogo de juegos.',
      data: {
        empresa: result.empresa,
        admin: {
          id: result.admin.id,
          nombre: result.admin.nombre,
          username: result.admin.username,
          rol: result.admin.rol
        },
        suscripcion: result.suscripcion
      }
    });
  } catch (error) {
    next(error);
  }
};

export const listarEmpresas = async (req, res, next) => {
  try {
    const empresas = await EmpresaService.obtenerEmpresas();
    res.status(200).json({
      success: true,
      data: empresas
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerEmpresa = async (req, res, next) => {
  try {
    const empresa = await EmpresaService.obtenerEmpresaPorId(req.params.id);
    res.status(200).json({
      success: true,
      data: empresa
    });
  } catch (error) {
    if (error.message === 'Empresa no encontrada') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const editarEmpresa = async (req, res, next) => {
  try {
    const empresa = await EmpresaService.actualizarEmpresa(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Empresa actualizada exitosamente',
      data: empresa
    });
  } catch (error) {
    if (error.message === 'Empresa no encontrada') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const anularEmpresa = async (req, res, next) => {
  try {
    const empresa = await EmpresaService.anularEmpresa(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Empresa anulada (inactiva) exitosamente',
      data: empresa
    });
  } catch (error) {
    if (error.message === 'Empresa no encontrada') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const obtenerAdmin = async (req, res, next) => {
  try {
    const admin = await EmpresaService.obtenerAdmin(req.params.id);
    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    if (error.message === 'Administrador no encontrado para esta empresa') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const actualizarAdmin = async (req, res, next) => {
  try {
    const admin = await EmpresaService.actualizarAdmin(req.params.id, req.params.usuarioId, req.body);
    res.status(200).json({
      success: true,
      message: 'Credenciales de administrador actualizadas exitosamente',
      data: {
        id: admin.id,
        username: admin.username,
        rol: admin.rol
      }
    });
  } catch (error) {
    if (error.message.includes('No encontrado')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};
