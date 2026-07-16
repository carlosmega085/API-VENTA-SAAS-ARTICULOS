import multer from 'multer';

// Configuramos multer para almacenar archivos en memoria antes de subirlos a Supabase
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  },
  fileFilter: (req, file, cb) => {
    // Aceptamos solo imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPG, PNG, WEBP)'), false);
    }
  }
});

export default upload;
