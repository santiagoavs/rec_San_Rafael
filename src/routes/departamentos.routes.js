import { Router } from 'express';
import { body, param } from 'express-validator';
import departamentosController from '../controllers/departamentos.controller.js';
import { authRequired, adminRequired } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';

const router = Router();

/**
 * @route   GET /api/departamentos
 * @desc    Obtener todos los departamentos
 * @access  Public
 */
router.get('/', departamentosController.obtenerTodos);

/**
 * @route   GET /api/departamentos/:id
 * @desc    Obtener un departamento por ID
 * @access  Public
 */
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID de departamento inválido'),
    validateRequest
  ],
  departamentosController.obtenerPorId
);

/**
 * @route   POST /api/departamentos
 * @desc    Crear nuevo departamento
 * @access  Private (Admin only)
 */
router.post(
  '/',
  authRequired,
  adminRequired,
  [
    body('nombre')
      .notEmpty().withMessage('El nombre del departamento es requerido')
      .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
    validateRequest
  ],
  departamentosController.crear
);

/**
 * @route   PUT /api/departamentos/:id
 * @desc    Actualizar departamento
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  authRequired,
  adminRequired,
  [
    param('id').isMongoId().withMessage('ID de departamento inválido'),
    body('nombre')
      .optional()
      .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
    validateRequest
  ],
  departamentosController.actualizar
);

/**
 * @route   DELETE /api/departamentos/:id
 * @desc    Eliminar departamento
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authRequired,
  adminRequired,
  [
    param('id').isMongoId().withMessage('ID de departamento inválido'),
    validateRequest
  ],
  departamentosController.eliminar
);

export default router;
