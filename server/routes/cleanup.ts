import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { storage } from '../storage';

const router = Router();

// Эндпоинт для очистки неиспользуемых фотографий сотрудников
router.post('/cleanup-photos', async (req: Request, res: Response) => {
    try {
        // 1. Получаем все фото URL сотрудников из базы данных
        const employees = await storage.getAllEmployees();
        const usedPhotoUrls = new Set();

        // Собираем все используемые пути к фото
        employees.forEach(employee => {
            if (employee.photo_url) {
                // Извлекаем имя файла из URL
                const fileName = employee.photo_url.split('/').pop();
                if (fileName) {
                    usedPhotoUrls.add(fileName);
                }
            }
        });

        // 2. Определяем директорию с фотографиями сотрудников
        const photoDir = path.join(process.cwd(), 'client', 'public', 'employee');

        // Проверяем существование директории
        if (!fs.existsSync(photoDir)) {
            return res.status(404).json({
                status: 'error',
                message: 'Директория с фотографиями не найдена'
            });
        }

        // 3. Получаем список всех файлов в директории
        const files = fs.readdirSync(photoDir);

        // 4. Находим файлы, которые не используются
        const unusedFiles = files.filter(file => {
            // Пропускаем файлы, начинающиеся с точки (скрытые файлы)
            if (file.startsWith('.')) return false;
            return !usedPhotoUrls.has(file);
        });

        // 5. Удаляем неиспользуемые файлы
        let deletedCount = 0;
        const deletedFiles = [];

        for (const file of unusedFiles) {
            try {
                fs.unlinkSync(path.join(photoDir, file));
                deletedFiles.push(file);
                deletedCount++;
            } catch (error) {
                console.error(`Ошибка при удалении файла ${file}:`, error);
            }
        }

        // 6. Возвращаем результат
        return res.json({
            status: 'success',
            data: {
                count: deletedCount,
                deletedFiles
            }
        });
    } catch (error) {
        console.error('Ошибка при очистке фотографий:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ошибка при очистке фотографий'
        });
    }
});

export default router;