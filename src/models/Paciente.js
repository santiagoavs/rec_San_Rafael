import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const pacienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    match: [
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      'Por favor, ingrese un nombre válido'
    ]
  },
  correo: {
    type: String,
    required: [true, 'El correo es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Por favor, ingrese un correo electrónico válido'
    ]
  },
  contrasena: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  fechaNacimiento: {
    type: Date,
    required: false
  },
  telefono: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        return !v || /^[0-9]{8,15}$/.test(v);
      },
      message: 'El teléfono debe contener entre 8 y 15 dígitos numéricos'
    }
  },
  direccion: {
    type: String,
    required: false,
    trim: true
  },
  fotoPerfilUrl: {
    type: String,
    required: false,
    default: null
  },
  role: {
    type: String,
    enum: ['paciente'],
    default: 'paciente'
  },
  active: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  recoveryData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.contrasena;
      delete ret.__v;
      return ret;
    }
  }
});

// Middleware para encriptar contraseña antes de guardar
pacienteSchema.pre('save', async function(next) {
  if (!this.isModified('contrasena')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.contrasena = await bcrypt.hash(this.contrasena, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
pacienteSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.contrasena);
};

// Método para actualizar último login
pacienteSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save({ validateBeforeSave: false });
};

export default mongoose.model('Paciente', pacienteSchema);
