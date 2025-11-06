import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: config.CLOUDINARY.cloudName,
  api_key: config.CLOUDINARY.apiKey,
  api_secret: config.CLOUDINARY.apiSecret
});

// Configurar almacenamiento de Cloudinary para Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determinar la carpeta según el tipo de archivo
    let folder = 'san_rafael/general';
    
    if (req.baseUrl.includes('pacientes')) {
      folder = 'san_rafael/pacientes';
    } else if (req.baseUrl.includes('doctores')) {
      folder = 'san_rafael/doctores';
    } else if (req.baseUrl.includes('historias')) {
      folder = 'san_rafael/historias_clinicas';
    }

    return {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
      transformation: file.mimetype.startsWith('image/') 
        ? [{ width: 800, height: 800, crop: 'limit' }]
        : undefined
    };
  }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG) y documentos (PDF, DOC, DOCX)'), false);
  }
};

// Configurar Multer con Cloudinary
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  }
});

/**
 * Eliminar archivo de Cloudinary
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('🗑️ Archivo eliminado de Cloudinary:', publicId);
    return result;
  } catch (error) {
    console.error('❌ Error eliminando archivo de Cloudinary:', error);
    throw error;
  }
};

/**
 * Extraer public_id de una URL de Cloudinary
 */
export const extractPublicId = (url) => {
  if (!url) return null;
  
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const publicId = filename.split('.')[0];
  
  // Incluir la carpeta en el public_id
  const folderIndex = parts.indexOf('san_rafael');
  if (folderIndex !== -1) {
    const folders = parts.slice(folderIndex, -1);
    return `${folders.join('/')}/${publicId}`;
  }
  
  return publicId;
};

export default {
  cloudinary,
  upload,
  deleteFromCloudinary,
  extractPublicId
};
