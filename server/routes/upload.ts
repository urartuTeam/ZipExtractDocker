import { Router, Request, Response } from 'express';
import { uploadSingle, processImage } from '../middlewares/upload';
import { db } from '../db';
import { departments } from '@shared/schema';
import { eq } from 'drizzle-orm';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Расширяем интерфейс Request для поддержки поля file, которое добавляет multer
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

const router = Router();

// API для проверки работоспособности
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'API загрузки логотипов работает', 
    endpoints: [
      'GET /api/upload/organization-logo/:id - Получить информацию о логотипе',
      'POST /api/upload/organization-logo/:id - Загрузить логотип',
      'DELETE /api/upload/organization-logo/:id - Удалить логотип'
    ]
  });
});

// API для загрузки логотипа организации
router.post('/organization-logo/:id', (req: Request, res: Response) => {
  // Получаем ID отдела/организации
  const departmentId = parseInt(req.params.id, 10);
  
  if (isNaN(departmentId)) {
    return res.status(400).json({ status: 'error', message: 'Неверный ID организации' });
  }

  // Используем middleware для загрузки файла
  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ 
        status: 'error', 
        message: err instanceof Error ? err.message : 'Неизвестная ошибка при загрузке файла' 
      });
    }

    try {
      // Проверяем, существует ли отдел
      const [department] = await db.select().from(departments).where(eq(departments.department_id, departmentId));
      
      if (!department) {
        return res.status(404).json({ status: 'error', message: 'Организация не найдена' });
      }

      if (!req.file) {
        return res.status(400).json({ status: 'error', message: 'Файл не был загружен' });
      }

      // Обрабатываем изображение через Sharp, чтобы изменить размер до 100x100
      const logoPath = await processImage(req.file);

      // Обновляем запись в базе данных
      await db.update(departments)
        .set({ logo_path: logoPath })
        .where(eq(departments.department_id, departmentId));

      // Возвращаем успешный ответ с информацией о файле
      res.status(200).json({
        status: 'success',
        data: {
          department_id: departmentId,
          logo_path: logoPath,
          mimetype: req.file.mimetype,
          size: req.file.size
        }
      });
    } catch (error) {
      console.error('Ошибка при обработке загрузки файла:', error);
      res.status(500).json({ status: 'error', message: 'Внутренняя ошибка сервера' });
    }
  });
});

// API для получения информации о логотипе организации
router.get('/organization-logo/:id', async (req: Request, res: Response) => {
  try {
    const departmentId = parseInt(req.params.id, 10);
    
    if (isNaN(departmentId)) {
      return res.status(400).json({ status: 'error', message: 'Неверный ID организации' });
    }

    const [department] = await db.select().from(departments).where(eq(departments.department_id, departmentId));
    
    if (!department) {
      return res.status(404).json({ status: 'error', message: 'Организация не найдена' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        department_id: departmentId,
        logo_path: department.logo_path || null
      }
    });
  } catch (error) {
    console.error('Ошибка при получении информации о логотипе:', error);
    res.status(500).json({ status: 'error', message: 'Внутренняя ошибка сервера' });
  }
});

// API для удаления логотипа организации
router.delete('/organization-logo/:id', async (req: Request, res: Response) => {
  try {
    const departmentId = parseInt(req.params.id, 10);
    
    if (isNaN(departmentId)) {
      return res.status(400).json({ status: 'error', message: 'Неверный ID организации' });
    }

    const [department] = await db.select().from(departments).where(eq(departments.department_id, departmentId));
    
    if (!department) {
      return res.status(404).json({ status: 'error', message: 'Организация не найдена' });
    }

    // Удаляем файл изображения, если он существует
    if (department.logo_path) {
      try {
        const filePath = path.join(process.cwd(), 'public', department.logo_path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Ошибка при удалении файла логотипа:', error);
        // Продолжаем выполнение, даже если не удалось удалить файл
      }
    }

    // Обновляем запись в базе данных, очищая поле logo_path
    await db.update(departments)
      .set({ logo_path: null })
      .where(eq(departments.department_id, departmentId));

    res.status(200).json({
      status: 'success',
      message: 'Логотип успешно удален'
    });
  } catch (error) {
    console.error('Ошибка при удалении логотипа:', error);
    res.status(500).json({ status: 'error', message: 'Внутренняя ошибка сервера' });
  }
});

export default router;