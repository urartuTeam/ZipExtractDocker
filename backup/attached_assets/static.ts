import express, { Express } from 'express';
import path from 'path';
import fs from 'fs';

export function serveStatic(app: Express) {
    // В production используем директорию dist/client
    const distPath = path.resolve(process.cwd(), 'dist/client');

    if (!fs.existsSync(distPath)) {
        throw new Error(`Could not find the build directory: ${distPath}`);
    }

    // Обслуживаем статические файлы
    app.use(express.static(distPath));

    // Для всех остальных маршрутов возвращаем index.html
    app.get('*', (req, res, next) => {
        // Исключаем API маршруты
        if (req.path.startsWith('/api')) {
            return next();
        }

        // Отправляем index.html
        res.sendFile(path.join(distPath, 'index.html'));
    });
}