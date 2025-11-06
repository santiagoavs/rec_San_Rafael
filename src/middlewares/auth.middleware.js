import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import Paciente from '../models/Paciente.js';
import Doctor from '../models/Doctor.js';

/**
 * Middleware principal para verificar autenticación JWT
 */
export const authRequired = async (req, res, next) => {
  console.log('🔐 Verificando autenticación:', {
    url: req.url,
    method: req.method,
    hasCookie: !!req.cookies.authToken,
    hasHeader: !!req.headers.authorization
  });

  // Obtener token de cookies o header Authorization
  let token = null;
  let tokenSource = '';

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
    tokenSource = 'Authorization header';
  } else if (req.cookies.authToken) {
    token = req.cookies.authToken;
    tokenSource = 'Cookie';
  }

  if (!token) {
    console.log('❌ Token no proporcionado');
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado',
      error: 'NO_TOKEN'
    });
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, config.JWT.secret);

    console.log('🔓 Token decodificado:', {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      type: decoded.type
    });

    if (!decoded.id) {
      console.log('❌ Token inválido - sin ID');
      return res.status(401).json({
        success: false,
        message: 'Token inválido - sin ID de usuario',
        error: 'INVALID_TOKEN'
      });
    }

    // Buscar usuario en la base de datos según el tipo
    let user = null;
    let userType = decoded.type || 'paciente';

    if (userType === 'doctor' || decoded.role === 'doctor' || decoded.role === 'admin') {
      user = await Doctor.findById(decoded.id);
      if (!user) {
        user = await Paciente.findById(decoded.id);
        userType = 'paciente';
      }
    } else {
      user = await Paciente.findById(decoded.id);
      if (!user) {
        user = await Doctor.findById(decoded.id);
        userType = 'doctor';
      }
    }

    if (!user) {
      console.log('❌ Usuario no encontrado en BD:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado',
        error: 'USER_NOT_FOUND'
      });
    }

    if (user.active === false) {
      console.log('❌ Usuario inactivo:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada',
        error: 'ACCOUNT_DISABLED'
      });
    }

    // Actualizar último login
    try {
      if (user.updateLastLogin && typeof user.updateLastLogin === 'function') {
        await user.updateLastLogin();
      } else {
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });
      }
      console.log('📅 LastLogin actualizado para usuario:', user._id);
    } catch (lastLoginError) {
      console.warn('⚠️ Error actualizando lastLogin:', lastLoginError.message);
    }

    // Configurar req.user con la información del usuario
    req.user = {
      _id: decoded.id,
      id: decoded.id,
      type: userType,
      role: decoded.role || user.role,
      email: decoded.email,
      nombre: user.nombre,
      active: user.active !== false
    };

    console.log('✅ Usuario autenticado exitosamente:', {
      id: req.user.id,
      type: req.user.type,
      role: req.user.role,
      email: req.user.email,
      tokenSource
    });

    next();
  } catch (error) {
    console.log('❌ Error verificando token:', {
      message: error.message,
      name: error.name,
      tokenSource
    });

    // Limpiar cookie corrupta si el error viene de cookie
    if (tokenSource === 'Cookie' && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
      console.log('🗑️ Limpiando cookie corrupta');
      res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
        error: 'TOKEN_EXPIRED'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o corrupto',
        error: 'INVALID_TOKEN'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Error de autenticación',
      error: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware para verificar roles específicos
 */
export const roleRequired = (allowedRoles = []) => {
  return (req, res, next) => {
    console.log('🔑 Verificando roles:', {
      required: allowedRoles,
      userRole: req.user?.role
    });

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'NOT_AUTHENTICATED'
      });
    }

    // Normalizar roles permitidos para comparación
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
    const userRole = req.user.role?.toLowerCase();

    if (!normalizedAllowedRoles.includes(userRole)) {
      console.log('❌ Rol insuficiente');
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Rol insuficiente.',
        error: 'INSUFFICIENT_ROLE',
        data: {
          required: allowedRoles,
          current: req.user.role
        }
      });
    }

    console.log('✅ Rol autorizado');
    next();
  };
};

/**
 * Middleware para verificar que el usuario es admin
 */
export const adminRequired = roleRequired(['admin']);

/**
 * Middleware para verificar que el usuario es doctor o admin
 */
export const doctorOrAdminRequired = roleRequired(['doctor', 'admin']);

/**
 * Middleware para verificar propiedad de recurso o ser admin
 */
export const ownershipOrAdminRequired = (resourceIdParam = 'id') => {
  return (req, res, next) => {
    const resourceId = req.params[resourceIdParam];
    const userId = req.user.id;
    const isAdmin = req.user.role?.toLowerCase() === 'admin';

    console.log('🔍 Verificando propiedad:', {
      resourceId,
      userId,
      isAdmin
    });

    if (isAdmin || resourceId === userId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'No tienes permiso para acceder a este recurso',
      error: 'UNAUTHORIZED_ACCESS'
    });
  };
};

/**
 * Middleware opcional - permite acceso sin autenticación pero añade user si existe token
 */
export const authOptional = (req, res, next) => {
  const token = req.cookies.authToken || req.headers.authorization?.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.JWT.secret);
    req.user = {
      _id: decoded.id,
      id: decoded.id,
      type: decoded.type || 'paciente',
      role: decoded.role,
      email: decoded.email,
      nombre: decoded.nombre,
      active: decoded.active !== false
    };
  } catch (error) {
    req.user = null;
  }

  next();
};

export default {
  authRequired,
  roleRequired,
  adminRequired,
  doctorOrAdminRequired,
  ownershipOrAdminRequired,
  authOptional
};
