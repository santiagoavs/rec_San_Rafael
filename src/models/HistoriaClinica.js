import mongoose from 'mongoose';

const historiaClinicaSchema = new mongoose.Schema({
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
  diagnostico: {
    type: String,
    required: [true, 'El diagnóstico es requerido'],
    trim: true
  },
  tratamiento: {
    type: String,
    required: false,
    trim: true
  },
  archivosAdjuntos: [{
    type: String,
    required: false
  }],
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar rendimiento
historiaClinicaSchema.index({ idPaciente: 1, fechaRegistro: -1 });
historiaClinicaSchema.index({ idDoctor: 1 });

export default mongoose.model('HistoriaClinica', historiaClinicaSchema);
