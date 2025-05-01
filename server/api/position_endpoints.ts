import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { insertPositionPositionSchema } from "../../shared/schema";

// Функция для регистрации эндпоинтов для работы с должностями
export function registerPositionEndpoints(app: Express) {
  
  // Получить должности по отделу
  app.get('/api/positions-by-department/:departmentId', async (req: Request, res: Response) => {
    try {
      const departmentId = parseInt(req.params.departmentId);
      if (isNaN(departmentId)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Некорректный ID отдела' 
        });
      }
      
      // Получаем должности в этом отделе с помощью position_department
      const positionDepartments = await storage.getAllPositionDepartments();
      const departmentPositionIds = positionDepartments
        .filter(pd => pd.department_id === departmentId)
        .map(pd => pd.position_id);
      
      // Получаем полные данные о должностях
      const positions = await storage.getAllPositions();
      const departmentPositions = positions
        .filter(pos => departmentPositionIds.includes(pos.position_id));
      
      res.json({ 
        status: 'success', 
        data: departmentPositions 
      });
    } catch (error) {
      console.error("Ошибка при получении должностей отдела:", error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Ошибка сервера при получении должностей отдела' 
      });
    }
  });
  
  // Получить иерархию должностей для отдела
  app.get('/api/position-hierarchy/:departmentId', async (req: Request, res: Response) => {
    try {
      const departmentId = parseInt(req.params.departmentId);
      if (isNaN(departmentId)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Некорректный ID отдела' 
        });
      }
      
      // Получаем все связи position_position для этого отдела
      const positionPositions = await storage.getPositionPositionsByDepartment(departmentId);
      
      res.json({ 
        status: 'success', 
        data: positionPositions
      });
    } catch (error) {
      console.error("Ошибка при получении иерархии должностей:", error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Ошибка сервера при получении иерархии должностей' 
      });
    }
  });
  
  // CRUD для position_position
  
  // Получить все связи position_position
  app.get('/api/positionpositions', async (_req: Request, res: Response) => {
    try {
      const positionPositions = await storage.getAllPositionPositions();
      res.json({ status: 'success', data: positionPositions });
    } catch (error) {
      console.error('Ошибка при получении связей position_position:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Ошибка сервера при получении связей position_position' 
      });
    }
  });
  
  // Получить связь position_position по ID
  app.get('/api/positionpositions/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Некорректный ID связи' 
        });
      }
      
      const positionPosition = await storage.getPositionPosition(id);
      if (!positionPosition) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Связь position_position не найдена' 
        });
      }
      
      res.json({ status: 'success', data: positionPosition });
    } catch (error) {
      console.error('Ошибка при получении связи position_position:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Ошибка сервера при получении связи position_position' 
      });
    }
  });
  
  // Создать новую связь position_position
  app.post('/api/positionpositions', async (req: Request, res: Response) => {
    try {
      const positionPositionData = insertPositionPositionSchema.parse(req.body);
      
      // Проверяем, существуют ли должности
      if (positionPositionData.position_id === undefined) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'ID должности не указан' 
        });
      }
      
      const position = await storage.getPosition(positionPositionData.position_id);
      if (!position) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Должность не найдена' 
        });
      }
      
      if (positionPositionData.parent_position_id === undefined) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'ID родительской должности не указан' 
        });
      }
      
      const parentPosition = await storage.getPosition(positionPositionData.parent_position_id);
      if (!parentPosition) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Родительская должность не найдена' 
        });
      }
      
      // Проверяем, существует ли отдел
      if (positionPositionData.department_id === undefined) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'ID отдела не указан' 
        });
      }
      
      const department = await storage.getDepartment(positionPositionData.department_id);
      if (!department) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Отдел не найден' 
        });
      }
      
      // Проверяем, чтобы не было циклических ссылок
      if (positionPositionData.position_id === positionPositionData.parent_position_id) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Должность не может быть родительской для самой себя' 
        });
      }
      
      // Создаем связь
      const positionPosition = await storage.createPositionPosition(positionPositionData);
      res.status(201).json({ status: 'success', data: positionPosition });
    } catch (error) {
      console.error('Ошибка при создании связи position_position:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Ошибка сервера при создании связи position_position' 
      });
    }
  });
  
  // Обновить связь position_position
  app.put('/api/positionpositions/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Некорректный ID связи' 
        });
      }
      
      const positionPositionData = insertPositionPositionSchema.parse(req.body);
      
      // Проверяем, существует ли связь
      const existingPositionPosition = await storage.getPositionPosition(id);
      if (!existingPositionPosition) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Связь position_position не найдена' 
        });
      }
      
      // Обновляем связь
      const positionPosition = await storage.updatePositionPosition(id, positionPositionData);
      res.json({ status: 'success', data: positionPosition });
    } catch (error) {
      console.error('Ошибка при обновлении связи position_position:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Ошибка сервера при обновлении связи position_position' 
      });
    }
  });
  
  // Удалить связь position_position
  app.delete('/api/positionpositions/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Некорректный ID связи' 
        });
      }
      
      // Проверяем, существует ли связь
      const existingPositionPosition = await storage.getPositionPosition(id);
      if (!existingPositionPosition) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Связь position_position не найдена' 
        });
      }
      
      // Удаляем связь
      await storage.deletePositionPosition(id);
      res.json({ status: 'success', message: 'Связь удалена' });
    } catch (error) {
      console.error('Ошибка при удалении связи position_position:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Ошибка сервера при удалении связи position_position' 
      });
    }
  });
}