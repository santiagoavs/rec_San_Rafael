import Paciente from '../models/Paciente.js';
import { deleteFromCloudinary, extractPublicId } from '../utils/cloudinary.js';

const pacientesController = {};

/**
 * Obtener todos los pacientes (solo admin)
 */
pacientesController.obtenerTodos = async (req, res) => {
  try {
    const pacientes = await Paciente.find({ active: true })
      .select('-contrasena')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: pacientes,
      total: pacientes.length
    });
  } catch (error) {
    console.error('Error obteniendo pacientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pacientes',
      error: error.message
    });
  }
};

/**
 * Obtener un paciente por ID
 */
pacientesController.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await Paciente.findById(id).select('-contrasena');

    if (!paciente) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: paciente
    });
  } catch (error) {
    console.error('Error obteniendo paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener paciente',
      error: error.message
    });
  }
};

/**
 * Actualizar paciente
 */
pacientesController.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, direccion, fechaNacimiento } = req.body;

    const paciente = await Paciente.findById(id);

    if (!paciente) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Actualizar campos
    if (nombre) paciente.nombre = nombre;
    if (telefono) paciente.telefono = telefono;
    if (direccion) paciente.direccion = direccion;
    if (fechaNacimiento) paciente.fechaNacimiento = fechaNacimiento;

    // Si hay archivo de imagen
    if (req.file) {
      // Eliminar imagen anterior si existe
      if (paciente.fotoPerfilUrl) {
        const publicId = extractPublicId(paciente.fotoPerfilUrl);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }
      paciente.fotoPerfilUrl = req.file.path;
    }

    await paciente.save();

    res.status(200).json({
      success: true,
      message: 'Paciente actualizado exitosamente',
      data: paciente
    });
  } catch (error) {
    console.error('Error actualizando paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar paciente',
      error: error.message
    });
  }
};

/**
 * Eliminar paciente (soft delete)
 */
pacientesController.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await Paciente.findById(id);

    if (!paciente) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    paciente.active = false;
    await paciente.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Paciente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar paciente',
      error: error.message
    });
  }
};

export default pacientesController;
