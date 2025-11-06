import mongoose from 'mongoose';

const resenaSchema = new mongoose.Schema({
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
  calificacion: {
    type: Number,
    required: [true, 'La calificación es requerida'],
    min: [1, 'La calificación mínima es 1'],
    max: [5, 'La calificación máxima es 5']
  },
  comentario: {
    type: String,
    required: false,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar rendimiento
resenaSchema.index({ idDoctor: 1, createdAt: -1 });
resenaSchema.index({ idPaciente: 1 });

// Índice compuesto para evitar reseñas duplicadas del mismo paciente al mismo doctor
resenaSchema.index({ idPaciente: 1, idDoctor: 1 }, { unique: true });

export default mongoose.model('Resena', resenaSchema);
