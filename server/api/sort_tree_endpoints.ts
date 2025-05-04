import type { Express, Request, Response } from "express";
import { storage } from "../storage";

// Функция для регистрации эндпоинтов для работы с сортировкой дерева
export function registerSortTreeEndpoints(app: Express) {
  
  // Получить все записи сортировки дерева
  app.get('/api/sort-tree', async (req: Request, res: Response) => {
    try {
      const sortItems = await storage.getSortTree();
      res.json({ status: 'success', data: sortItems });
    } catch (error) {
      console.error('Ошибка при получении записей сортировки:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Не удалось получить записи сортировки' 
      });
    }
  });
  
  // Создать или получить запись сортировки
  app.post('/api/sort-tree', async (req: Request, res: Response) => {
    try {
      const { type, type_id, parent_id, sort } = req.body;
      
      if (!type || !type_id) {
        return res.status(400).json({
          status: 'error',
          message: 'Не указаны обязательные поля: type, type_id'
        });
      }
      
      // Сначала проверяем существование записи
      const existingItem = await storage.getSortTreeItem(type, type_id, parent_id);
      
      if (existingItem) {
        return res.json({
          status: 'success',
          data: existingItem,
          message: 'Запись уже существует'
        });
      }
      
      // Создаем новую запись
      const newItem = await storage.createSortTreeItem({
        type,
        type_id,
        parent_id,
        sort: sort || 0
      });
      
      res.status(201).json({
        status: 'success',
        data: newItem,
        message: 'Запись создана'
      });
    } catch (error) {
      console.error('Ошибка при создании записи сортировки:', error);
      res.status(500).json({
        status: 'error',
        message: 'Не удалось создать запись сортировки'
      });
    }
  });
  
  // Обновить порядок сортировки для нескольких элементов
  app.post('/api/sort-tree/reorder', async (req: Request, res: Response) => {
    try {
      const { items } = req.body;
      
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({
          status: 'error',
          message: 'Не указан массив элементов для обновления'
        });
      }
      
      // Обновляем каждый элемент
      const results = await Promise.all(
        items.map(item => storage.updateSortTreeItem(item.id, { sort: item.sort }))
      );
      
      res.json({
        status: 'success',
        data: results,
        message: 'Порядок элементов обновлен'
      });
    } catch (error) {
      console.error('Ошибка при обновлении порядка элементов:', error);
      res.status(500).json({
        status: 'error',
        message: 'Не удалось обновить порядок элементов'
      });
    }
  });
}