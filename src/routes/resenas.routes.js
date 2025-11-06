import { Router } from 'express';
import { body, param } from 'express-validator';
import resenasController from '../controllers/resenas.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';

const router = Router();

/**
 * @route   GET /api/resenas
 * @desc    Obtener todas las reseñas
 * @access  Public
 */
router.get('/', resenasController.obtenerTodas);

/**
 * @route   GET /api/resenas/:id
 * @desc    Obtener una reseña por ID
 * @access  Public
 */
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID de reseña inválido'),
    validateRequest
  ],
  resenasController.obtenerPorId
);

/**
 * @route   POST /api/resenas
 * @desc    Crear nueva reseña
 * @access  Private (Authenticated)
 */
router.post(
  '/',
  authRequired,
  [
    body('idPaciente')
      .notEmpty().withMessage('El ID del paciente es requerido')
      .isMongoId().withMessage('ID de paciente inválido'),
    body('idDoctor')
      .notEmpty().withMessage('El ID del doctor es requerido')
      .isMongoId().withMessage('ID de doctor inválido'),
    body('calificacion')
      .notEmpty().withMessage('La calificación es requerida')
      .isInt({ min: 1, max: 5 }).withMessage('La calificación debe estar entre 1 y 5'),
    validateRequest
  ],
  resenasController.crear
);

/**
 * @route   PUT /api/resenas/:id
 * @desc    Actualizar reseña
 * @access  Private (Authenticated)
 */
router.put(
  '/:id',
  authRequired,
  [
    param('id').isMongoId().withMessage('ID de reseña inválido'),
    body('calificacion')
      .optional()
      .isInt({ min: 1, max: 5 }).withMessage('La calificación debe estar entre 1 y 5'),
    validateRequest
  ],
  resenasController.actualizar
);

/**
 * @route   DELETE /api/resenas/:id
 * @desc    Eliminar reseña
 * @access  Private (Authenticated)
 */
router.delete(
  '/:id',
  authRequired,
  [
    param('id').isMongoId().withMessage('ID de reseña inválido'),
    validateRequest
  ],
  resenasController.eliminar
);

export default router;
