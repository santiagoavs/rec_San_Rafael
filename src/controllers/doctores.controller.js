import Doctor from '../models/Doctor.js';
import { deleteFromCloudinary, extractPublicId } from '../utils/cloudinary.js';

const doctoresController = {};

/**
 * Obtener todos los doctores
 */
doctoresController.obtenerTodos = async (req, res) => {
  try {
    const doctores = await Doctor.find({ active: true })
      .select('-contrasena')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: doctores,
      total: doctores.length
    });
  } catch (error) {
    console.error('Error obteniendo doctores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener doctores',
      error: error.message
    });
  }
};

/**
 * Obtener un doctor por ID
 */
doctoresController.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id).select('-contrasena');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('Error obteniendo doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener doctor',
      error: error.message
    });
  }
};

/**
 * Crear nuevo doctor (solo admin)
 */
doctoresController.crear = async (req, res) => {
  try {
    const { nombre, apellido, especialidad, biografia, correo, contrasena, role } = req.body;

    // Verificar si el correo ya existe
    const existingDoctor = await Doctor.findOne({ correo: correo.toLowerCase() });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está registrado'
      });
    }

    const nuevoDoctor = new Doctor({
      nombre,
      apellido,
      especialidad,
      biografia,
      correo: correo.toLowerCase(),
      contrasena,
      role: role || 'doctor'
    });

    // Si hay archivo de imagen
    if (req.file) {
      nuevoDoctor.fotoPerfilUrl = req.file.path;
    }

    await nuevoDoctor.save();

    res.status(201).json({
      success: true,
      message: 'Doctor creado exitosamente',
      data: nuevoDoctor
    });
  } catch (error) {
    console.error('Error creando doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear doctor',
      error: error.message
    });
  }
};

/**
 * Actualizar doctor
 */
doctoresController.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, especialidad, biografia, role } = req.body;

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor no encontrado'
      });
    }

    // Actualizar campos
    if (nombre) doctor.nombre = nombre;
    if (apellido) doctor.apellido = apellido;
    if (especialidad) doctor.especialidad = especialidad;
    if (biografia) doctor.biografia = biografia;
    if (role) doctor.role = role;

    // Si hay archivo de imagen
    if (req.file) {
      // Eliminar imagen anterior si existe
      if (doctor.fotoPerfilUrl) {
        const publicId = extractPublicId(doctor.fotoPerfilUrl);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }
      doctor.fotoPerfilUrl = req.file.path;
    }

    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Doctor actualizado exitosamente',
      data: doctor
    });
  } catch (error) {
    console.error('Error actualizando doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar doctor',
      error: error.message
    });
  }
};

/**
 * Eliminar doctor (soft delete)
 */
doctoresController.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor no encontrado'
      });
    }

    doctor.active = false;
    await doctor.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Doctor eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar doctor',
      error: error.message
    });
  }
};

export default doctoresController;
