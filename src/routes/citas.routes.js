import { Router } from 'express';
import { body, param } from 'express-validator';
import citasController from '../controllers/citas.controller.js';
import { authRequired, doctorOrAdminRequired } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';

const router = Router();

/**
 * @route   GET /api/citas
 * @desc    Obtener todas las citas
 * @access  Private (Doctor or Admin)
 */
router.get(
  '/',
  authRequired,
  doctorOrAdminRequired,
  citasController.obtenerTodas
);

/**
 * @route   GET /api/citas/:id
 * @desc    Obtener una cita por ID
 * @access  Private (Authenticated)
 */
router.get(
  '/:id',
  authRequired,
  [
    param('id').isMongoId().withMessage('ID de cita inválido'),
    validateRequest
  ],
  citasController.obtenerPorId
);

/**
 * @route   POST /api/citas
 * @desc    Crear nueva cita
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
    body('fechaCita')
      .notEmpty().withMessage('La fecha de la cita es requerida')
      .isISO8601().withMessage('Formato de fecha inválido'),
    validateRequest
  ],
  citasController.crear
);

/**
 * @route   PUT /api/citas/:id
 * @desc    Actualizar cita
 * @access  Private (Doctor or Admin)
 */
router.put(
  '/:id',
  authRequired,
  doctorOrAdminRequired,
  [
    param('id').isMongoId().withMessage('ID de cita inválido'),
    body('fechaCita')
      .optional()
      .isISO8601().withMessage('Formato de fecha inválido'),
    body('estado')
      .optional()
      .isIn(['programada', 'completada', 'cancelada']).withMessage('Estado inválido'),
    validateRequest
  ],
  citasController.actualizar
);

/**
 * @route   DELETE /api/citas/:id
 * @desc    Eliminar cita
 * @access  Private (Doctor or Admin)
 */
router.delete(
  '/:id',
  authRequired,
  doctorOrAdminRequired,
  [
    param('id').isMongoId().withMessage('ID de cita inválido'),
    validateRequest
  ],
  citasController.eliminar
);

export default router;
