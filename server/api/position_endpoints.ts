import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { insertPositionPositionSchema } from "../../shared/schema";

// Функция для регистрации эндпоинтов для работы с должностями
export function registerPositionEndpoints(app: Express) {
  
  // Получить должности с информацией об отделах и родительских должностях
  app.get('/api/positions/with-departments', async (req: Request, res: Response) => {
    try {
      // Получаем все должности, отделы и связи
      const positions = await storage.getAllPositions();
      const departments = await storage.getAllDepartments();
      const positionDepartments = await storage.getAllPositionDepartments();
      const positionPositions = await storage.getAllPositionPositions();
      
      // Создаем обогащенный список должностей с отделами и связями
      const positionsWithDepts = positions.map((position) => {
        // Находим все связи position_department для данной должности
        const links = positionDepartments.filter(
          (pd) => pd.position_id === position.position_id,
        );
        
        // Находим соответствующие отделы из связей в таблице position_department
        const linkedDepartments: any[] = [];
        const processedLinks = new Map<string, boolean>(); // Для отслеживания уже обработанных записей
        
        // Для каждой связи из position_department обрабатываем департамент отдельно
        for (const link of links) {
          // Находим информацию об отделе
          const dept = departments.find(
            (d) => d.department_id === link.department_id,
          );
          
          if (!dept) continue;
          
          // Базовая информация о связи с отделом (без родительских должностей)
          const baseDeptInfo = {
            position_link_id: link.position_link_id,
            department_id: link.department_id,
            department_name: dept?.name || "Неизвестный отдел",
            sort: link.sort,
            vacancies: link.vacancies || 0,
          };
          
          // Теперь ищем все родительские позиции для этой должности в этом отделе
          const parentsForDept = positionPositions.filter(
            (pp) => 
              pp.position_id === position.position_id && 
              pp.department_id === link.department_id
          );
          
          // Если нет родительских позиций, добавляем только базовую связь с отделом
          if (parentsForDept.length === 0) {
            const linkKey = `${link.position_link_id}_null_${link.department_id}`;
            if (!processedLinks.has(linkKey)) {
              linkedDepartments.push({
                ...baseDeptInfo,
                parent_positions: [],
                parent_position: null,
                position_position_id: null,
                group_key: `null_${link.department_id}` // Ключ для группировки по отделу без родителя
              });
              processedLinks.set(linkKey, true);
            }
          } else {
            // Для каждой родительской должности создаем отдельную связь
            for (const parentRelation of parentsForDept) {
              const parentPosition = positions.find(
                (p) => p.position_id === parentRelation.parent_position_id,
              );
              
              if (parentPosition) {
                // Создаем уникальный ключ группировки для пары (родительская должность + отдел)
                const groupKey = `${parentPosition.position_id}_${link.department_id}`;
                // Уникальный ключ для этой конкретной связи
                const linkKey = `${link.position_link_id}_${parentPosition.position_id}_${link.department_id}`;
                
                if (!processedLinks.has(linkKey)) {
                  linkedDepartments.push({
                    ...baseDeptInfo,
                    parent_position: {
                      position_id: parentPosition.position_id,
                      name: parentPosition.name,
                    },
                    parent_positions: [{ // Для обратной совместимости
                      position_id: parentPosition.position_id,
                      name: parentPosition.name,
                    }],
                    position_position_id: parentRelation.position_relation_id, // ID связи для удаления
                    group_key: groupKey // Ключ для группировки 
                  });
                  processedLinks.set(linkKey, true);
                }
              }
            }
          }
        }
        
        // Добавляем информацию о родительских должностях из position_position
        // Это информация о том, кому подчиняется эта должность
        const parentRelations = positionPositions.filter(
          (pp) => pp.position_id === position.position_id,
        );
        const parentPositionsInfo = parentRelations
          .map((relation) => {
            const parentPosition = positions.find(
              (p) => p.position_id === relation.parent_position_id,
            );
            if (parentPosition) {
              return {
                position_id: parentPosition.position_id,
                name: parentPosition.name,
                department_id: relation.department_id,
              };
            }
            return null;
          })
          .filter(Boolean);
        
        // Получаем информацию о подчиненных должностях
        const childrenRelations = positionPositions.filter(
          (pp) => pp.parent_position_id === position.position_id,
        );
        const childrenPositionsInfo = childrenRelations
          .map((relation) => {
            const childPosition = positions.find(
              (p) => p.position_id === relation.position_id,
            );
            if (childPosition) {
              return {
                position_id: childPosition.position_id,
                name: childPosition.name,
                department_id: relation.department_id,
              };
            }
            return null;
          })
          .filter(Boolean);
        
        return {
          ...position,
          departments: linkedDepartments,
          parent_positions: parentPositionsInfo,
          children_positions: childrenPositionsInfo,
          // Добавляем флаг, указывающий, является ли должность подчиненной
          is_subordinate: parentRelations.length > 0,
        };
      });
      
      // Выведем первую должность в консоль для отладки
      if (positionsWithDepts.length > 0) {
        console.log("Пример обработанной должности:", 
          JSON.stringify({
            position_id: positionsWithDepts[0].position_id,
            name: positionsWithDepts[0].name,
            departments: positionsWithDepts[0].departments
          }, null, 2)
        );
      }
      
      res.json({ status: 'success', data: positionsWithDepts });
    } catch (error) {
      console.error('Ошибка при получении должностей с отделами:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Ошибка сервера при получении должностей с отделами' 
      });
    }
  });
  
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
      
      if (positionPositionData.position_id === null) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'ID должности не может быть null' 
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
      
      // Проверка, что parent_position_id не равен null
      const parentPositionId = positionPositionData.parent_position_id;
      if (parentPositionId === null) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'ID родительской должности не может быть null' 
        });
      }
      
      const parentPosition = await storage.getPosition(parentPositionId);
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
      
      // Проверка, что department_id не равен null
      const departmentId = positionPositionData.department_id;
      if (departmentId === null) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'ID отдела не может быть null' 
        });
      }
      
      const department = await storage.getDepartment(departmentId);
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

  // CRUD для position_department
  
  // Получить все связи position_department
  app.get('/api/pd', async (_req: Request, res: Response) => {
    try {
      const positionDepartments = await storage.getAllPositionDepartments();
      res.json({ status: 'success', data: positionDepartments });
    } catch (error) {
      console.error('Ошибка при получении связей position_department:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Ошибка сервера при получении связей position_department' 
      });
    }
  });
  
  // Получить связь position_department по ID
  app.get('/api/pd/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Некорректный ID связи' 
        });
      }
      
      const positionDepartment = await storage.getPositionDepartment(id);
      if (!positionDepartment) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Связь position_department не найдена' 
        });
      }
      
      res.json({ status: 'success', data: positionDepartment });
    } catch (error) {
      console.error('Ошибка при получении связи position_department:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Ошибка сервера при получении связи position_department' 
      });
    }
  });
  
  // Создать новую связь position_department
  app.post('/api/pd', async (req: Request, res: Response) => {
    try {
      // Проверяем наличие необходимых полей
      const { position_id, department_id, vacancies, sort } = req.body;
      
      if (position_id === undefined) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'ID должности не указан' 
        });
      }
      
      if (department_id === undefined) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'ID отдела не указан' 
        });
      }
      
      // Проверка существования должности и отдела
      const position = await storage.getPosition(position_id);
      if (!position) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Должность не найдена' 
        });
      }
      
      const department = await storage.getDepartment(department_id);
      if (!department) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Отдел не найден' 
        });
      }
      
      // Создаем связь
      const positionDepartmentData = {
        position_id,
        department_id,
        vacancies: vacancies || 1, // По умолчанию 1 вакансия
        sort: sort || 0 // По умолчанию сортировка 0
      };
      
      const positionDepartment = await storage.createPositionDepartment(positionDepartmentData);
      res.status(201).json({ status: 'success', data: positionDepartment });
    } catch (error) {
      console.error('Ошибка при создании связи position_department:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Ошибка сервера при создании связи position_department' 
      });
    }
  });
  
  // Обновить связь position_department
  app.put('/api/pd/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Некорректный ID связи' 
        });
      }
      
      // Проверяем, существует ли связь
      const existingPositionDepartment = await storage.getPositionDepartment(id);
      if (!existingPositionDepartment) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Связь position_department не найдена' 
        });
      }
      
      // Получаем данные для обновления
      const { position_id, department_id, vacancies, sort } = req.body;
      
      // Создаем объект с данными для обновления
      const updateData: any = {};
      if (position_id !== undefined) updateData.position_id = position_id;
      if (department_id !== undefined) updateData.department_id = department_id;
      if (vacancies !== undefined) updateData.vacancies = vacancies;
      if (sort !== undefined) updateData.sort = sort;
      
      // Обновляем связь
      const positionDepartment = await storage.updatePositionDepartment(id, updateData);
      res.json({ status: 'success', data: positionDepartment });
    } catch (error) {
      console.error('Ошибка при обновлении связи position_department:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Ошибка сервера при обновлении связи position_department' 
      });
    }
  });
  
  // Удалить связь position_department
  app.delete('/api/pd/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Некорректный ID связи' 
        });
      }
      
      // Проверяем, существует ли связь
      const existingPositionDepartment = await storage.getPositionDepartment(id);
      if (!existingPositionDepartment) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Связь position_department не найдена' 
        });
      }
      
      // Удаляем связь
      await storage.deletePositionDepartment(id);
      res.json({ status: 'success', message: 'Связь удалена' });
    } catch (error) {
      console.error('Ошибка при удалении связи position_department:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Ошибка сервера при удалении связи position_department' 
      });
    }
  });
}