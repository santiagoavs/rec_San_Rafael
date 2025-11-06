import { Router } from 'express';
import { body } from 'express-validator';
import authController from '../controllers/auth.controller.js';
import { validateRequest } from '../middlewares/validation.middleware.js';

const router = Router();

/**
 * @route   POST /api/registrarPacientes
 * @desc    Registrar nuevo paciente
 * @access  Public
 */
router.post(
  '/registrarPacientes',
  [
    body('nombre')
      .notEmpty().withMessage('El nombre es requerido')
      .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres')
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras'),
    body('correo')
      .notEmpty().withMessage('El correo es requerido')
      .isEmail().withMessage('Debe ser un correo electrónico válido')
      .normalizeEmail(),
    body('contrasena')
      .notEmpty().withMessage('La contraseña es requerida')
      .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('telefono')
      .optional()
      .matches(/^[0-9]{8,15}$/).withMessage('El teléfono debe contener entre 8 y 15 dígitos'),
    body('fechaNacimiento')
      .optional()
      .isISO8601().withMessage('Formato de fecha inválido'),
    validateRequest
  ],
  authController.registrarPacientes
);

/**
 * @route   POST /api/iniciarSesion
 * @desc    Iniciar sesión (pacientes y doctores)
 * @access  Public
 */
router.post(
  '/iniciarSesion',
  [
    body('correo')
      .notEmpty().withMessage('El correo es requerido')
      .isEmail().withMessage('Debe ser un correo electrónico válido')
      .normalizeEmail(),
    body('contrasena')
      .notEmpty().withMessage('La contraseña es requerida'),
    validateRequest
  ],
  authController.iniciarSesion
);

/**
 * @route   POST /api/cerrarSesion
 * @desc    Cerrar sesión
 * @access  Public
 */
router.post('/cerrarSesion', authController.cerrarSesion);

/**
 * @route   POST /api/recuperarContrasena/solicitarCodigo
 * @desc    Solicitar código de recuperación de contraseña
 * @access  Public
 */
router.post(
  '/recuperarContrasena/solicitarCodigo',
  [
    body('correo')
      .notEmpty().withMessage('El correo es requerido')
      .isEmail().withMessage('Debe ser un correo electrónico válido')
      .normalizeEmail(),
    validateRequest
  ],
  authController.solicitarCodigo
);

/**
 * @route   POST /api/recuperarContrasena/verificarCodigo
 * @desc    Verificar código de recuperación
 * @access  Public
 */
router.post(
  '/recuperarContrasena/verificarCodigo',
  [
    body('correo')
      .notEmpty().withMessage('El correo es requerido')
      .isEmail().withMessage('Debe ser un correo electrónico válido')
      .normalizeEmail(),
    body('codigo')
      .notEmpty().withMessage('El código es requerido')
      .isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 dígitos'),
    validateRequest
  ],
  authController.verificarCodigo
);

/**
 * @route   POST /api/recuperarContrasena/nuevaContrasena
 * @desc    Establecer nueva contraseña
 * @access  Public
 */
router.post(
  '/recuperarContrasena/nuevaContrasena',
  [
    body('correo')
      .notEmpty().withMessage('El correo es requerido')
      .isEmail().withMessage('Debe ser un correo electrónico válido')
      .normalizeEmail(),
    body('codigo')
      .notEmpty().withMessage('El código es requerido')
      .isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 dígitos'),
    body('nuevaContrasena')
      .notEmpty().withMessage('La nueva contraseña es requerida')
      .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    validateRequest
  ],
  authController.nuevaContrasena
);

export default router;
