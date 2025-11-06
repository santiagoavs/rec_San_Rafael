import HistoriaClinica from '../models/HistoriaClinica.js';
import { deleteFromCloudinary, extractPublicId } from '../utils/cloudinary.js';

const historiasController = {};

/**
 * Obtener todas las historias clínicas
 */
historiasController.obtenerTodas = async (req, res) => {
  try {
    const { idPaciente, idDoctor } = req.query;
    
    const filter = {};
    if (idPaciente) filter.idPaciente = idPaciente;
    if (idDoctor) filter.idDoctor = idDoctor;

    const historias = await HistoriaClinica.find(filter)
      .populate('idPaciente', 'nombre correo fechaNacimiento')
      .populate('idDoctor', 'nombre apellido especialidad')
      .sort({ fechaRegistro: -1 });

    res.status(200).json({
      success: true,
      data: historias,
      total: historias.length
    });
  } catch (error) {
    console.error('Error obteniendo historias clínicas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historias clínicas',
      error: error.message
    });
  }
};

/**
 * Obtener una historia clínica por ID
 */
historiasController.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const historia = await HistoriaClinica.findById(id)
      .populate('idPaciente', 'nombre correo fechaNacimiento telefono')
      .populate('idDoctor', 'nombre apellido especialidad');

    if (!historia) {
      return res.status(404).json({
        success: false,
        message: 'Historia clínica no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: historia
    });
  } catch (error) {
    console.error('Error obteniendo historia clínica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historia clínica',
      error: error.message
    });
  }
};

/**
 * Crear nueva historia clínica
 */
historiasController.crear = async (req, res) => {
  try {
    const { idPaciente, idDoctor, diagnostico, tratamiento } = req.body;

    const nuevaHistoria = new HistoriaClinica({
      idPaciente,
      idDoctor,
      diagnostico,
      tratamiento,
      archivosAdjuntos: []
    });

    // Si hay archivos adjuntos
    if (req.files && req.files.length > 0) {
      nuevaHistoria.archivosAdjuntos = req.files.map(file => file.path);
    }

    await nuevaHistoria.save();

    const historiaPopulada = await HistoriaClinica.findById(nuevaHistoria._id)
      .populate('idPaciente', 'nombre correo')
      .populate('idDoctor', 'nombre apellido especialidad');

    res.status(201).json({
      success: true,
      message: 'Historia clínica creada exitosamente',
      data: historiaPopulada
    });
  } catch (error) {
    console.error('Error creando historia clínica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear historia clínica',
      error: error.message
    });
  }
};

/**
 * Actualizar historia clínica
 */
historiasController.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnostico, tratamiento } = req.body;

    const historia = await HistoriaClinica.findById(id);

    if (!historia) {
      return res.status(404).json({
        success: false,
        message: 'Historia clínica no encontrada'
      });
    }

    // Actualizar campos
    if (diagnostico) historia.diagnostico = diagnostico;
    if (tratamiento !== undefined) historia.tratamiento = tratamiento;

    // Si hay nuevos archivos adjuntos
    if (req.files && req.files.length > 0) {
      const nuevosArchivos = req.files.map(file => file.path);
      historia.archivosAdjuntos = [...historia.archivosAdjuntos, ...nuevosArchivos];
    }

    await historia.save();

    const historiaActualizada = await HistoriaClinica.findById(id)
      .populate('idPaciente', 'nombre correo')
      .populate('idDoctor', 'nombre apellido especialidad');

    res.status(200).json({
      success: true,
      message: 'Historia clínica actualizada exitosamente',
      data: historiaActualizada
    });
  } catch (error) {
    console.error('Error actualizando historia clínica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar historia clínica',
      error: error.message
    });
  }
};

/**
 * Eliminar historia clínica
 */
historiasController.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    const historia = await HistoriaClinica.findById(id);

    if (!historia) {
      return res.status(404).json({
        success: false,
        message: 'Historia clínica no encontrada'
      });
    }

    // Eliminar archivos adjuntos de Cloudinary
    if (historia.archivosAdjuntos && historia.archivosAdjuntos.length > 0) {
      for (const url of historia.archivosAdjuntos) {
        const publicId = extractPublicId(url);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }
    }

    await HistoriaClinica.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Historia clínica eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando historia clínica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar historia clínica',
      error: error.message
    });
  }
};

export default historiasController;
