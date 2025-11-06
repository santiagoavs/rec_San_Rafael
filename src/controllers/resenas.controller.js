import Resena from '../models/Resena.js';

const resenasController = {};

/**
 * Obtener todas las reseñas
 */
resenasController.obtenerTodas = async (req, res) => {
  try {
    const { idPaciente, idDoctor } = req.query;
    
    const filter = {};
    if (idPaciente) filter.idPaciente = idPaciente;
    if (idDoctor) filter.idDoctor = idDoctor;

    const resenas = await Resena.find(filter)
      .populate('idPaciente', 'nombre')
      .populate('idDoctor', 'nombre apellido especialidad')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: resenas,
      total: resenas.length
    });
  } catch (error) {
    console.error('❌ Error obteniendo reseñas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reseñas',
      error: error.message
    });
  }
};

/**
 * Obtener una reseña por ID
 */
resenasController.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const resena = await Resena.findById(id)
      .populate('idPaciente', 'nombre')
      .populate('idDoctor', 'nombre apellido especialidad');

    if (!resena) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: resena
    });
  } catch (error) {
    console.error('❌ Error obteniendo reseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reseña',
      error: error.message
    });
  }
};

/**
 * Crear nueva reseña
 */
resenasController.crear = async (req, res) => {
  try {
    const { idPaciente, idDoctor, calificacion, comentario } = req.body;

    // Verificar si ya existe una reseña de este paciente para este doctor
    const existingResena = await Resena.findOne({ idPaciente, idDoctor });
    if (existingResena) {
      return res.status(400).json({
        success: false,
        message: 'Ya has dejado una reseña para este doctor. Puedes editarla en su lugar.'
      });
    }

    const nuevaResena = new Resena({
      idPaciente,
      idDoctor,
      calificacion,
      comentario
    });

    await nuevaResena.save();

    const resenaPopulada = await Resena.findById(nuevaResena._id)
      .populate('idPaciente', 'nombre')
      .populate('idDoctor', 'nombre apellido especialidad');

    res.status(201).json({
      success: true,
      message: 'Reseña creada exitosamente',
      data: resenaPopulada
    });
  } catch (error) {
    console.error('❌ Error creando reseña:', error);
    
    // Manejar error de duplicado
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya has dejado una reseña para este doctor'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al crear reseña',
      error: error.message
    });
  }
};

/**
 * Actualizar reseña
 */
resenasController.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { calificacion, comentario } = req.body;

    const resena = await Resena.findById(id);

    if (!resena) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    // Actualizar campos
    if (calificacion) resena.calificacion = calificacion;
    if (comentario !== undefined) resena.comentario = comentario;

    await resena.save();

    const resenaActualizada = await Resena.findById(id)
      .populate('idPaciente', 'nombre')
      .populate('idDoctor', 'nombre apellido especialidad');

    res.status(200).json({
      success: true,
      message: 'Reseña actualizada exitosamente',
      data: resenaActualizada
    });
  } catch (error) {
    console.error('❌ Error actualizando reseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar reseña',
      error: error.message
    });
  }
};

/**
 * Eliminar reseña
 */
resenasController.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    const resena = await Resena.findByIdAndDelete(id);

    if (!resena) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reseña eliminada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error eliminando reseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar reseña',
      error: error.message
    });
  }
};

export default resenasController;
