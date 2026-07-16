import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';
import { Usuario } from '../models/index.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await Usuario.findByPk(decoded.user_id);
    if (!user || user.estado !== 'activo') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

export const authenticate = authMiddleware;
export default authMiddleware;
