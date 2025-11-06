import { validationResult } from 'express-validator';

/**
 * Middleware para validar los resultados de express-validator
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      campo: error.path || error.param,
      mensaje: error.msg,
      valor: error.value
    }));

    console.log('❌ Errores de validación:', formattedErrors);

    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: formattedErrors
    });
  }

  next();
};

export default { validateRequest };
