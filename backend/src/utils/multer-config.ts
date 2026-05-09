import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const prefix = `${Date.now()}-${Math.round(Math.random() * 400)}`;
      const filename = `${prefix}-${file.originalname}`;
      cb(null, filename);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedList = /jpeg|jpg|png|webp/;
    const isValid = allowedList.test(extname(file.originalname).toLowerCase());
    if (isValid) cb(null, true);
    else cb(new BadRequestException('Only image files are allowed'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
};
