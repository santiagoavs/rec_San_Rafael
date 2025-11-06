import mongoose from 'mongoose';

const departamentoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del departamento es requerido'],
    unique: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: false,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default mongoose.model('Departamento', departamentoSchema);
