import dotenv from 'dotenv';

// Cargar variables de entorno PRIMERO
dotenv.config();

// Luego importar el resto
import app from './app.js';
import { connectDB } from './database.js';
import { config } from './src/config.js';

// Conectar a la base de datos
connectDB();

// Iniciar servidor
const PORT = config.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🏥  SAN RAFAEL - SISTEMA MÉDICO API');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`🚀  Servidor corriendo en puerto: ${PORT}`);
  console.log(`🌍  Entorno: ${config.NODE_ENV}`);
  console.log(`📡  URL: http://localhost:${PORT}`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('📋  Endpoints disponibles:');
  console.log('   • POST   /api/registrarPacientes');
  console.log('   • POST   /api/iniciarSesion');
  console.log('   • POST   /api/cerrarSesion');
  console.log('   • POST   /api/recuperarContrasena/solicitarCodigo');
  console.log('   • POST   /api/recuperarContrasena/verificarCodigo');
  console.log('   • POST   /api/recuperarContrasena/nuevaContrasena');
  console.log('   • GET    /api/pacientes');
  console.log('   • GET    /api/doctores');
  console.log('   • GET    /api/citas');
  console.log('   • GET    /api/departamentos');
  console.log('   • GET    /api/historias');
  console.log('   • GET    /api/resenas');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
});

// Manejo de errores del servidor
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Error: El puerto ${PORT} ya está en uso`);
    process.exit(1);
  } else {
    console.error('❌ Error del servidor:', error);
    process.exit(1);
  }
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recibido. Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  server.close(() => {
    process.exit(1);
  });
});

export default server;
