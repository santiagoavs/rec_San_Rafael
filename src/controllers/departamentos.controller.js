import Departamento from '../models/Departamento.js';

const departamentosController = {};

/**
 * Obtener todos los departamentos
 */
departamentosController.obtenerTodos = async (req, res) => {
  try {
    const departamentos = await Departamento.find().sort({ nombre: 1 });

    res.status(200).json({
      success: true,
      data: departamentos,
      total: departamentos.length
    });
  } catch (error) {
    console.error('Error obteniendo departamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener departamentos',
      error: error.message
    });
  }
};

/**
 * Obtener un departamento por ID
 */
departamentosController.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const departamento = await Departamento.findById(id);

    if (!departamento) {
      return res.status(404).json({
        success: false,
        message: 'Departamento no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: departamento
    });
  } catch (error) {
    console.error('Error obteniendo departamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener departamento',
      error: error.message
    });
  }
};

/**
 * Crear nuevo departamento
 */
departamentosController.crear = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    // Verificar si ya existe un departamento con ese nombre
    const existingDepartamento = await Departamento.findOne({ 
      nombre: { $regex: new RegExp(`^${nombre}$`, 'i') }
    });

    if (existingDepartamento) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un departamento con ese nombre'
      });
    }

    const nuevoDepartamento = new Departamento({
      nombre,
      descripcion
    });

    await nuevoDepartamento.save();

    res.status(201).json({
      success: true,
      message: 'Departamento creado exitosamente',
      data: nuevoDepartamento
    });
  } catch (error) {
    console.error('Error creando departamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear departamento',
      error: error.message
    });
  }
};

/**
 * Actualizar departamento
 */
departamentosController.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const departamento = await Departamento.findById(id);

    if (!departamento) {
      return res.status(404).json({
        success: false,
        message: 'Departamento no encontrado'
      });
    }

    // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
    if (nombre && nombre !== departamento.nombre) {
      const existingDepartamento = await Departamento.findOne({
        nombre: { $regex: new RegExp(`^${nombre}$`, 'i') },
        _id: { $ne: id }
      });

      if (existingDepartamento) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un departamento con ese nombre'
        });
      }
    }

    if (nombre) departamento.nombre = nombre;
    if (descripcion !== undefined) departamento.descripcion = descripcion;

    await departamento.save();

    res.status(200).json({
      success: true,
      message: 'Departamento actualizado exitosamente',
      data: departamento
    });
  } catch (error) {
    console.error('Error actualizando departamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar departamento',
      error: error.message
    });
  }
};

/**
 * Eliminar departamento
 */
departamentosController.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    const departamento = await Departamento.findByIdAndDelete(id);

    if (!departamento) {
      return res.status(404).json({
        success: false,
        message: 'Departamento no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Departamento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando departamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar departamento',
      error: error.message
    });
  }
};

export default departamentosController;
