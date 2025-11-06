import { Router } from 'express';
import { body, param } from 'express-validator';
import doctoresController from '../controllers/doctores.controller.js';
import { authRequired, adminRequired } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import { upload } from '../utils/cloudinary.js';

const router = Router();

/**
 * @route   GET /api/doctores
 * @desc    Obtener todos los doctores
 * @access  Public
 */
router.get('/', doctoresController.obtenerTodos);

/**
 * @route   GET /api/doctores/:id
 * @desc    Obtener un doctor por ID
 * @access  Public
 */
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID de doctor inválido'),
    validateRequest
  ],
  doctoresController.obtenerPorId
);

/**
 * @route   POST /api/doctores
 * @desc    Crear nuevo doctor
 * @access  Private (Admin only)
 */
router.post(
  '/',
  authRequired,
  adminRequired,
  upload.single('fotoPerfil'),
  [
    body('nombre')
      .notEmpty().withMessage('El nombre es requerido')
      .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
    body('apellido')
      .notEmpty().withMessage('El apellido es requerido')
      .isLength({ min: 2 }).withMessage('El apellido debe tener al menos 2 caracteres'),
    body('especialidad')
      .notEmpty().withMessage('La especialidad es requerida'),
    body('correo')
      .notEmpty().withMessage('El correo es requerido')
      .isEmail().withMessage('Debe ser un correo electrónico válido')
      .normalizeEmail(),
    body('contrasena')
      .notEmpty().withMessage('La contraseña es requerida')
      .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('role')
      .optional()
      .isIn(['doctor', 'admin']).withMessage('Rol inválido'),
    validateRequest
  ],
  doctoresController.crear
);

/**
 * @route   PUT /api/doctores/:id
 * @desc    Actualizar doctor
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  authRequired,
  adminRequired,
  upload.single('fotoPerfil'),
  [
    param('id').isMongoId().withMessage('ID de doctor inválido'),
    body('nombre')
      .optional()
      .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
    body('apellido')
      .optional()
      .isLength({ min: 2 }).withMessage('El apellido debe tener al menos 2 caracteres'),
    body('role')
      .optional()
      .isIn(['doctor', 'admin']).withMessage('Rol inválido'),
    validateRequest
  ],
  doctoresController.actualizar
);

/**
 * @route   DELETE /api/doctores/:id
 * @desc    Eliminar doctor (soft delete)
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authRequired,
  adminRequired,
  [
    param('id').isMongoId().withMessage('ID de doctor inválido'),
    validateRequest
  ],
  doctoresController.eliminar
);

export default router;
