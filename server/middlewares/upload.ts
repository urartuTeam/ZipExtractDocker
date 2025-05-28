import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import sharp from 'sharp';

// Убедимся, что директории для загрузки существуют
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
const employeePhotoDir = path.join(process.cwd(), 'client', 'public', 'employee');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(employeePhotoDir)) {
  fs.mkdirSync(employeePhotoDir, { recursive: true });
}

// Размеры для ресайза логотипов
const LOGO_WIDTH = 100;
const LOGO_HEIGHT = 100;

// Временное хранилище для необработанных файлов
const tempStorage = multer.memoryStorage();

// Настройка хранилища для загруженных файлов (не используется напрямую,
// так как мы сначала обрабатываем изображение через Sharp)
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Создаем уникальное имя файла с оригинальным расширением
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'logo-' + uniqueSuffix + ext);
  }
});

// Фильтр файлов - принимаем только изображения
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Недопустимый формат файла. Разрешены только JPEG, PNG, GIF и SVG.'));
  }
};

// Создаем middleware для загрузки
export const upload = multer({
  storage: tempStorage, // Используем хранилище в памяти
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: fileFilter
});

// Функция для обработки и сохранения изображения с заданными размерами
export const processImage = async (file: Express.Multer.File): Promise<string> => {
  // Создаем уникальное имя файла
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const ext = path.extname(file.originalname);
  const filename = 'logo-' + uniqueSuffix + '.png'; // Всегда используем PNG для лучшего качества
  const filepath = path.join(uploadDir, filename);

  // Обрабатываем изображение через Sharp
  // SVG обрабатываем по-особенному, так как это векторный формат
  if (file.mimetype === 'image/svg+xml') {
    // Для SVG просто сохраняем как есть
    fs.writeFileSync(filepath, file.buffer);
  } else {
    // Для растровых изображений используем Sharp для ресайза
    await sharp(file.buffer)
        // .resize(LOGO_WIDTH, LOGO_HEIGHT, {
        //   fit: 'contain', // Содержать всё изображение, добавляя прозрачность
        //   background: { r: 0, g: 0, b: 0, alpha: 0 } // Прозрачный фон
        // })
        .toFormat('png') // Всегда сохраняем как PNG
        .toFile(filepath);
  }

  return `/uploads/${filename}`;
};

// Функция для обработки и сохранения фотографий сотрудников
export const processEmployeePhoto = async (file: Express.Multer.File): Promise<string> => {
  // Создаем уникальное имя файла
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const filename = 'photo-' + uniqueSuffix + '.webp'; // Используем webp для лучшего сжатия
  const filepath = path.join(employeePhotoDir, filename);

  // Обрабатываем фото сотрудника - делаем квадратным с размером 200x200
  await sharp(file.buffer)
      .resize(300, 400, {
        fit: 'cover', // Обрезаем изображение чтобы заполнить указанные размеры
        position: 'centre' // Центрируем изображение
      })
      .toFormat('webp', { quality: 85 }) // Используем webp с хорошим качеством
      .toFile(filepath);

  return `/employee/${filename}`;
};

// Экспортируем middleware для одиночной загрузки
export const uploadSingle = upload.single('logo');

// Middleware для загрузки фото сотрудника
export const uploadEmployeePhoto = upload.single('photo');