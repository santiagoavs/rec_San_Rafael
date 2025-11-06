import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 4000,
  
  db: {
    URI: process.env.DB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/san_rafael'
  },
  
  JWT: {
    secret: process.env.JWT_SECRET || 'san_rafael_secret_key_2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  CLOUDINARY: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  
  EMAIL: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || `San Rafael <${process.env.EMAIL_USER}>`
  },
  
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  NODE_ENV: process.env.NODE_ENV || 'development'
};
