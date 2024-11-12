import { diskStorage } from 'multer';
import { extname } from 'path';
import * as crypto from 'crypto';

// Multer configuration for file upload
export const multerOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      let uploadPath = './uploads';

      if (req.url.includes('pets')) {
        uploadPath += '/pets';
      } else if (req.url.includes('auth')) {
        uploadPath += '/avatars';
      } else {
        uploadPath += '/vaccines';
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Hashear el nombre original del archivo
      const hash = crypto
        .createHash('sha256')
        .update(file.originalname + Date.now().toString())
        .digest('hex');

      // Obtener la extensión del archivo
      const fileExtension = extname(file.originalname);
      const newFilename = `${hash}${fileExtension}`; // Nombre del archivo hasheado

      cb(null, newFilename);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // Limitar el tamaño del archivo a 2 MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/; // Tipos de archivo permitidos
    const mimetype = filetypes.test(file.mimetype);
    const extension = filetypes.test(extname(file.originalname));

    if (mimetype && extension) {
      return cb(null, true);
    }

    cb(new Error('Error: Archivo no permitido.'));
  },
};
