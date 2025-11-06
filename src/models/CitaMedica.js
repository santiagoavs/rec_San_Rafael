import mongoose from 'mongoose';

const citaMedicaSchema = new mongoose.Schema({
  idPaciente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: [true, 'El ID del paciente es requerido']
  },
  idDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'El ID del doctor es requerido']
  },
  fechaCita: {
    type: Date,
    required: [true, 'La fecha de la cita es requerida']
  },
  estado: {
    type: String,
    enum: ['programada', 'completada', 'cancelada'],
    default: 'programada',
    required: true
  },
  notas: {
    type: String,
    required: false,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar rendimiento de consultas
citaMedicaSchema.index({ idPaciente: 1, fechaCita: -1 });
citaMedicaSchema.index({ idDoctor: 1, fechaCita: -1 });
citaMedicaSchema.index({ estado: 1 });

// Validación personalizada: no permitir citas en el pasado
citaMedicaSchema.pre('save', function(next) {
  if (this.isNew && this.fechaCita < new Date()) {
    return next(new Error('No se pueden programar citas en el pasado'));
  }
  next();
});

export default mongoose.model('CitaMedica', citaMedicaSchema);
