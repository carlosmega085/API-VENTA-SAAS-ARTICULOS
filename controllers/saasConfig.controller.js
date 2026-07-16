import { SaaSConfig } from '../models/index.js';

const getConfigs = async (req, res) => {
  try {
    const configs = await SaaSConfig.findAll();
    res.json({
      success: true,
      data: configs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateConfig = async (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ success: false, message: 'Key y Value son requeridos' });
    }

    const config = await SaaSConfig.findOne({ where: { key } });

    if (!config) {
      return res.status(404).json({ success: false, message: 'Configuración no encontrada' });
    }

    await config.update({ value: String(value) });

    res.json({
      success: true,
      message: `Configuración ${key} actualizada correctamente`,
      data: config
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getConfigs,
  updateConfig
};
