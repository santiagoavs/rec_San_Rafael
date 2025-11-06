import { Router } from 'express';
import { body, param } from 'express-validator';
import historiasController from '../controllers/historias.controller.js';
import { authRequired, doctorOrAdminRequired } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import { upload } from '../utils/cloudinary.js';

const router = Router();

/**
 * @route   GET /api/historias
 * @desc    Obtener todas las historias clínicas
 * @access  Private (Doctor or Admin)
 */
router.get(
  '/',
  authRequired,
  doctorOrAdminRequired,
  historiasController.obtenerTodas
);

/**
 * @route   GET /api/historias/:id
 * @desc    Obtener una historia clínica por ID
 * @access  Private (Doctor or Admin)
 */
router.get(
  '/:id',
  authRequired,
  doctorOrAdminRequired,
  [
    param('id').isMongoId().withMessage('ID de historia clínica inválido'),
    validateRequest
  ],
  historiasController.obtenerPorId
);

/**
 * @route   POST /api/historias
 * @desc    Crear nueva historia clínica
 * @access  Private (Doctor or Admin)
 */
router.post(
  '/',
  authRequired,
  doctorOrAdminRequired,
  upload.array('archivosAdjuntos', 5), // Máximo 5 archivos
  [
    body('idPaciente')
      .notEmpty().withMessage('El ID del paciente es requerido')
      .isMongoId().withMessage('ID de paciente inválido'),
    body('idDoctor')
      .notEmpty().withMessage('El ID del doctor es requerido')
      .isMongoId().withMessage('ID de doctor inválido'),
    body('diagnostico')
      .notEmpty().withMessage('El diagnóstico es requerido')
      .isLength({ min: 10 }).withMessage('El diagnóstico debe tener al menos 10 caracteres'),
    validateRequest
  ],
  historiasController.crear
);

/**
 * @route   PUT /api/historias/:id
 * @desc    Actualizar historia clínica
 * @access  Private (Doctor or Admin)
 */
router.put(
  '/:id',
  authRequired,
  doctorOrAdminRequired,
  upload.array('archivosAdjuntos', 5),
  [
    param('id').isMongoId().withMessage('ID de historia clínica inválido'),
    body('diagnostico')
      .optional()
      .isLength({ min: 10 }).withMessage('El diagnóstico debe tener al menos 10 caracteres'),
    validateRequest
  ],
  historiasController.actualizar
);

/**
 * @route   DELETE /api/historias/:id
 * @desc    Eliminar historia clínica
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authRequired,
  doctorOrAdminRequired,
  [
    param('id').isMongoId().withMessage('ID de historia clínica inválido'),
    validateRequest
  ],
  historiasController.eliminar
);

export default router;
