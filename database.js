import mongoose from 'mongoose';
import { config } from './src/config.js';

export const connectDB = async () => {
  try {
    console.log('Conectando a la base de datos...');
    console.log('URI:', config.db.URI ? 'Configurada' : 'No configurada');
    
    const conn = await mongoose.connect(config.db.URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('MongoDB conectado:', conn.connection.host);
    console.log('Base de datos:', conn.connection.name);
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

// Manejo de eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Error de conexión de Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose desconectado de MongoDB');
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Conexión de Mongoose cerrada por terminación de aplicación');
  process.exit(0);
});
