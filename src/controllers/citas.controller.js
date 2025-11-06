import CitaMedica from '../models/CitaMedica.js';

const citasController = {};

/**
 * Obtener todas las citas
 */
citasController.obtenerTodas = async (req, res) => {
  try {
    const { estado, idPaciente, idDoctor } = req.query;
    
    const filter = {};
    if (estado) filter.estado = estado;
    if (idPaciente) filter.idPaciente = idPaciente;
    if (idDoctor) filter.idDoctor = idDoctor;

    const citas = await CitaMedica.find(filter)
      .populate('idPaciente', 'nombre correo telefono')
      .populate('idDoctor', 'nombre apellido especialidad')
      .sort({ fechaCita: -1 });

    res.status(200).json({
      success: true,
      data: citas,
      total: citas.length
    });
  } catch (error) {
    console.error('Error obteniendo citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas',
      error: error.message
    });
  }
};

/**
 * Obtener una cita por ID
 */
citasController.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const cita = await CitaMedica.findById(id)
      .populate('idPaciente', 'nombre correo telefono fechaNacimiento')
      .populate('idDoctor', 'nombre apellido especialidad');

    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: cita
    });
  } catch (error) {
    console.error('Error obteniendo cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cita',
      error: error.message
    });
  }
};

/**
 * Crear nueva cita
 */
citasController.crear = async (req, res) => {
  try {
    const { idPaciente, idDoctor, fechaCita, notas } = req.body;

    // Verificar que la fecha no sea en el pasado
    if (new Date(fechaCita) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'No se pueden programar citas en el pasado'
      });
    }

    const nuevaCita = new CitaMedica({
      idPaciente,
      idDoctor,
      fechaCita,
      notas,
      estado: 'programada'
    });

    await nuevaCita.save();

    const citaPopulada = await CitaMedica.findById(nuevaCita._id)
      .populate('idPaciente', 'nombre correo')
      .populate('idDoctor', 'nombre apellido especialidad');

    res.status(201).json({
      success: true,
      message: 'Cita creada exitosamente',
      data: citaPopulada
    });
  } catch (error) {
    console.error('Error creando cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cita',
      error: error.message
    });
  }
};

/**
 * Actualizar cita
 */
citasController.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaCita, estado, notas } = req.body;

    const cita = await CitaMedica.findById(id);

    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    // Actualizar campos
    if (fechaCita) {
      if (new Date(fechaCita) < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'No se pueden programar citas en el pasado'
        });
      }
      cita.fechaCita = fechaCita;
    }
    if (estado) cita.estado = estado;
    if (notas !== undefined) cita.notas = notas;

    await cita.save();

    const citaActualizada = await CitaMedica.findById(id)
      .populate('idPaciente', 'nombre correo')
      .populate('idDoctor', 'nombre apellido especialidad');

    res.status(200).json({
      success: true,
      message: 'Cita actualizada exitosamente',
      data: citaActualizada
    });
  } catch (error) {
    console.error('Error actualizando cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cita',
      error: error.message
    });
  }
};

/**
 * Eliminar cita
 */
citasController.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    const cita = await CitaMedica.findByIdAndDelete(id);

    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cita eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cita',
      error: error.message
    });
  }
};

export default citasController;
