import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Importar rutas
import authRoutes from './src/routes/auth.routes.js';
import pacientesRoutes from './src/routes/pacientes.routes.js';
import doctoresRoutes from './src/routes/doctores.routes.js';
import citasRoutes from './src/routes/citas.routes.js';
import departamentosRoutes from './src/routes/departamentos.routes.js';
import historiasRoutes from './src/routes/historias.routes.js';
import resenasRoutes from './src/routes/resenas.routes.js';

const app = express();

app.set('trust proxy', 1);

// ==================== CONFIGURACIÓN DE CORS ====================
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Permitir requests sin origin (Postman, apps móviles)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  exposedHeaders: ['set-cookie'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ==================== RATE LIMITING ====================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // límite de requests
  message: 'Demasiadas solicitudes desde esta IP, intente más tarde',
  standardHeaders: true,
  legacyHeaders: false
});

// ==================== MIDDLEWARES GENERALES ====================
app.use(helmet()); // Seguridad HTTP headers
app.use(compression()); // Compresión HTTP
app.use(morgan('dev')); // Logger
app.use(cookieParser()); // Cookies
app.use(limiter); // Rate limiting

// Parsear JSON y URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== MIDDLEWARE DE DEBUGGING ====================
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.url}`, {
      body: Object.keys(req.body || {}).length > 0 ? '✅ Body present' : '❌ No body',
      query: Object.keys(req.query || {}).length > 0 ? req.query : '❌ No query',
      headers: {
        'content-type': req.headers['content-type'],
        'authorization': !!req.headers.authorization
      }
    });
    next();
  });
}

// ==================== RUTAS ====================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🏥 API San Rafael - Sistema Médico',
    version: '1.0.0',
    endpoints: {
      auth: '/api',
      pacientes: '/api/pacientes',
      doctores: '/api/doctores',
      citas: '/api/citas',
      departamentos: '/api/departamentos',
      historias: '/api/historias',
      resenas: '/api/resenas'
    }
  });
});

// Rutas de autenticación
app.use('/api', authRoutes);

// Rutas de recursos
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/doctores', doctoresRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/departamentos', departamentosRoutes);
app.use('/api/historias', historiasRoutes);
app.use('/api/resenas', resenasRoutes);

// ==================== MANEJO DE ERRORES ====================

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    error: 'NOT_FOUND',
    path: req.originalUrl
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  // Error de Multer (archivos)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 5MB',
        error: 'FILE_TOO_LARGE'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Error al subir archivo',
      error: err.code
    });
  }

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      campo: e.path,
      mensaje: e.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors
    });
  }

  // Error de cast de Mongoose (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido',
      error: 'INVALID_ID'
    });
  }

  // Error de duplicado de Mongoose
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `El ${field} ya está registrado`,
      error: 'DUPLICATE_KEY'
    });
  }

  // Error de CORS
  if (err.message === 'No permitido por CORS') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado por CORS',
      error: 'CORS_ERROR'
    });
  }

  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : 'INTERNAL_ERROR'
  });
});

export default app;
