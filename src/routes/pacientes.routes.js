import { Router } from 'express';
import { body, param } from 'express-validator';
import pacientesController from '../controllers/pacientes.controller.js';
import { authRequired, adminRequired, ownershipOrAdminRequired } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import { upload } from '../utils/cloudinary.js';

const router = Router();

/**
 * @route   GET /api/pacientes
 * @desc    Obtener todos los pacientes
 * @access  Private (Admin only)
 */
router.get(
  '/',
  authRequired,
  adminRequired,
  pacientesController.obtenerTodos
);

/**
 * @route   GET /api/pacientes/:id
 * @desc    Obtener un paciente por ID
 * @access  Private (Owner or Admin)
 */
router.get(
  '/:id',
  authRequired,
  [
    param('id').isMongoId().withMessage('ID de paciente inválido'),
    validateRequest
  ],
  ownershipOrAdminRequired('id'),
  pacientesController.obtenerPorId
);

/**
 * @route   PUT /api/pacientes/:id
 * @desc    Actualizar paciente
 * @access  Private (Owner or Admin)
 */
router.put(
  '/:id',
  authRequired,
  upload.single('fotoPerfil'),
  [
    param('id').isMongoId().withMessage('ID de paciente inválido'),
    body('nombre')
      .optional()
      .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres')
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras'),
    body('telefono')
      .optional()
      .matches(/^[0-9]{8,15}$/).withMessage('El teléfono debe contener entre 8 y 15 dígitos'),
    body('fechaNacimiento')
      .optional()
      .isISO8601().withMessage('Formato de fecha inválido'),
    validateRequest
  ],
  ownershipOrAdminRequired('id'),
  pacientesController.actualizar
);

/**
 * @route   DELETE /api/pacientes/:id
 * @desc    Eliminar paciente (soft delete)
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authRequired,
  adminRequired,
  [
    param('id').isMongoId().withMessage('ID de paciente inválido'),
    validateRequest
  ],
  pacientesController.eliminar
);

export default router;
