import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertDepartmentSchema, 
  insertPositionSchema, 
  insertPositionDepartmentSchema,
  insertEmployeeSchema,
  insertProjectSchema,
  insertEmployeeProjectSchema,
  insertLeaveSchema,
  insertSettingSchema,
  insertSortTreeSchema,
  sort_tree
} from "@shared/schema";
import { db } from "./db";
import { and, eq, sql, isNull, asc, desc, or, ne, inArray, gte, lte, between } from "drizzle-orm";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";

// Промежуточное ПО для проверки аутентификации
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ status: 'error', message: 'Требуется авторизация' });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Настройка авторизации
  setupAuth(app);
  
  // API routes
  const apiRouter = app.route('/api');

  // Users endpoints
  app.get('/api/users', async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json({ status: 'success', data: users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch users' });
    }
  });

  app.get('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid user ID' });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      res.json({ status: 'success', data: user });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch user' });
    }
  });

  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ status: 'error', message: 'Username already exists' });
      }

      const user = await storage.createUser(userData);
      res.status(201).json({ status: 'success', data: user });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ status: 'error', message: validationError.message });
      }
      
      console.error('Error creating user:', error);
      res.status(500).json({ status: 'error', message: 'Failed to create user' });
    }
  });

  app.put('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid user ID' });
      }

      const userData = req.body;
      const updatedUser = await storage.updateUser(id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      res.json({ status: 'success', data: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ status: 'error', message: 'Failed to update user' });
    }
  });

  app.delete('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid user ID' });
      }

      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      res.json({ status: 'success', message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ status: 'error', message: 'Failed to delete user' });
    }
  });

  // Отделы (Departments) endpoints
  app.get('/api/departments', async (req: Request, res: Response) => {
    try {
      const departments = await storage.getAllDepartments();
      
      // Получаем данные сортировки для отделов
      const sortItems = await db.select()
        .from(sort_tree)
        .where(eq(sort_tree.type, 'department'))
        .orderBy(asc(sort_tree.sort));
      
      // Создаем индекс для быстрого поиска sort значения по id отдела и parent_id
      const sortMap = new Map();
      for (const sortItem of sortItems) {
        const key = `${sortItem.type_id}_${sortItem.parent_id || 'null'}`;
        sortMap.set(key, sortItem.sort);
      }
      
      // Сортируем отделы по sort_tree
      const sortedDepartments = [...departments].sort((a, b) => {
        const aKey = `${a.department_id}_${a.parent_department_id || 'null'}`;
        const bKey = `${b.department_id}_${b.parent_department_id || 'null'}`;
        
        const aSort = sortMap.has(aKey) ? sortMap.get(aKey) : 999999;
        const bSort = sortMap.has(bKey) ? sortMap.get(bKey) : 999999;
        
        return aSort - bSort;
      });
      
      res.json({ status: 'success', data: sortedDepartments });
    } catch (error) {
      console.error('Error fetching departments:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch departments' });
    }
  });

  app.get('/api/departments/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid department ID' });
      }

      const department = await storage.getDepartment(id);
      if (!department) {
        return res.status(404).json({ status: 'error', message: 'Department not found' });
      }

      res.json({ status: 'success', data: department });
    } catch (error) {
      console.error('Error fetching department:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch department' });
    }
  });

  app.post('/api/departments', async (req: Request, res: Response) => {
    try {
      const departmentData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(departmentData);
      res.status(201).json({ status: 'success', data: department });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ status: 'error', message: validationError.message });
      }
      
      console.error('Error creating department:', error);
      res.status(500).json({ status: 'error', message: 'Failed to create department' });
    }
  });

  app.put('/api/departments/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid department ID' });
      }

      const departmentData = req.body;
      const updatedDepartment = await storage.updateDepartment(id, departmentData);
      
      if (!updatedDepartment) {
        return res.status(404).json({ status: 'error', message: 'Department not found' });
      }

      res.json({ status: 'success', data: updatedDepartment });
    } catch (error) {
      console.error('Error updating department:', error);
      res.status(500).json({ status: 'error', message: 'Failed to update department' });
    }
  });

  app.delete('/api/departments/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid department ID' });
      }

      const deleted = await storage.deleteDepartment(id);
      if (!deleted) {
        return res.status(404).json({ status: 'error', message: 'Department not found' });
      }

      res.json({ status: 'success', message: 'Department deleted successfully' });
    } catch (error) {
      console.error('Error deleting department:', error);
      res.status(500).json({ status: 'error', message: 'Failed to delete department' });
    }
  });

  // Должности (Positions) endpoints
  app.get('/api/positions', async (req: Request, res: Response) => {
    try {
      const positions = await storage.getAllPositions();
      res.json({ status: 'success', data: positions });
    } catch (error) {
      console.error('Error fetching positions:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch positions' });
    }
  });
  
  // Получаем должности с информацией о связанных отделах и родительских должностях
  app.get('/api/positions/with-departments', async (req: Request, res: Response) => {
    try {
      const positions = await storage.getAllPositions();
      const positionDepartments = await storage.getAllPositionDepartments();
      const departments = await storage.getAllDepartments();
      
      // Получаем данные сортировки для должностей
      const sortItems = await db.select()
        .from(sort_tree)
        .where(eq(sort_tree.type, 'position'))
        .orderBy(asc(sort_tree.sort));
      
      // Создаем индекс для быстрого поиска sort значения по id должности и parent_id
      const sortMap = new Map();
      for (const sortItem of sortItems) {
        const key = `${sortItem.type_id}_${sortItem.parent_id || 'null'}`;
        sortMap.set(key, sortItem.sort);
      }
      
      // Создаем обогащенный список должностей с отделами
      const positionsWithDepts = positions.map(position => {
        // Находим все связи position_department для данной должности
        const links = positionDepartments.filter(pd => pd.position_id === position.position_id);
        
        // Находим соответствующие отделы из связей в таблице position_department
        const linkedDepartments = links.map(link => {
          const dept = departments.find(d => d.department_id === link.department_id);
          return {
            position_link_id: link.position_link_id,
            department_id: link.department_id,
            department_name: dept?.name || 'Неизвестный отдел',
            sort: link.sort,
            vacancies: link.vacancies || 0
          };
        });
        
        // Удалено: обработка department_id из positions, так как теперь это поле не существует
        // и все связи хранятся только в таблице position_department
        
        return {
          ...position,
          departments: linkedDepartments
        };
      });
      
      // Сортируем должности по sort_tree
      const sortedPositions = [...positionsWithDepts].sort((a, b) => {
        // Функция для поиска значения сортировки
        const getSortValue = (position, departmentId) => {
          // Ключ с учетом отдела, если он есть
          const keyWithDept = `${position.position_id}_${departmentId || 'null'}`;
          if (sortMap.has(keyWithDept)) {
            return sortMap.get(keyWithDept);
          }
          
          // Общий ключ для позиции без привязки к отделу
          const keyGeneral = `${position.position_id}_null`;
          if (sortMap.has(keyGeneral)) {
            return sortMap.get(keyGeneral);
          }
          
          return 999999; // Значение по умолчанию, если нет сортировки
        };
        
        // Используем departmentId текущего выбранного отдела для сортировки
        // или null, если мы на странице всех должностей
        const currentDeptId = null; // По умолчанию null, можно получить из запроса
        
        const aSort = getSortValue(a, currentDeptId);
        const bSort = getSortValue(b, currentDeptId);
        
        // Если есть родительская должность, учитываем это в сортировке
        if (a.parent_position_id === b.position_id) return 1;
        if (b.parent_position_id === a.position_id) return -1;
        
        return aSort - bSort;
      });
      
      res.json({ status: 'success', data: sortedPositions });
    } catch (error) {
      console.error('Error fetching positions with departments:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch positions with departments' });
    }
  });
  
  // Связи должностей и отделов (Position Department) endpoints
  app.get('/api/positiondepartments', async (req: Request, res: Response) => {
    try {
      const positionDepartments = await storage.getAllPositionDepartments();
      res.json({ status: 'success', data: positionDepartments });
    } catch (error) {
      console.error('Error fetching position departments:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch position departments' });
    }
  });
  
  // Получение всех связей между должностями (иерархия должностей)
  app.get('/api/positionpositions', async (req: Request, res: Response) => {
    try {
      const positionPositions = await storage.getAllPositionPositions();
      res.json({ status: 'success', data: positionPositions });
    } catch (error) {
      console.error('Error fetching position hierarchy:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch position hierarchy' });
    }
  });
  
  // Получение связей для конкретной должности
  app.get('/api/positionpositions/position/:id', async (req: Request, res: Response) => {
    try {
      const positionId = parseInt(req.params.id);
      
      if (isNaN(positionId)) {
        return res.status(400).json({ status: 'error', message: 'Invalid position ID' });
      }
      
      const positionPositions = await storage.getPositionPositionsByPosition(positionId);
      res.json({ status: 'success', data: positionPositions });
    } catch (error) {
      console.error('Error fetching position relationships:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch position relationships' });
    }
  });
  
  // Получение подчиненных должностей для указанной родительской должности
  app.get('/api/positionpositions/parent/:id', async (req: Request, res: Response) => {
    try {
      const parentPositionId = parseInt(req.params.id);
      
      if (isNaN(parentPositionId)) {
        return res.status(400).json({ status: 'error', message: 'Invalid parent position ID' });
      }
      
      const positionPositions = await storage.getPositionPositionsByParent(parentPositionId);
      res.json({ status: 'success', data: positionPositions });
    } catch (error) {
      console.error('Error fetching subordinate positions:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch subordinate positions' });
    }
  });
  
  // Получение иерархии должностей для конкретного отдела
  app.get('/api/positionpositions/department/:id', async (req: Request, res: Response) => {
    try {
      const departmentId = parseInt(req.params.id);
      
      if (isNaN(departmentId)) {
        return res.status(400).json({ status: 'error', message: 'Invalid department ID' });
      }
      
      const positionPositions = await storage.getPositionPositionsByDepartment(departmentId);
      res.json({ status: 'success', data: positionPositions });
    } catch (error) {
      console.error('Error fetching department position hierarchy:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch department position hierarchy' });
    }
  });
  
  // Получение позиций для конкретного отдела
  app.get('/api/departments/:id/positions', async (req: Request, res: Response) => {
    try {
      const departmentId = parseInt(req.params.id);
      
      if (isNaN(departmentId)) {
        return res.status(400).json({ status: 'error', message: 'Invalid department ID' });
      }
      
      // Получаем все позиции и сотрудников
      const allPositions = await storage.getAllPositions();
      const allEmployees = await storage.getAllEmployees();
      
      // Множество для хранения ID найденных должностей
      const positionIds = new Set<number>();
      
      // 1. Добавляем ID из связей позиция-отдел
      const positionDepartments = await storage.getAllPositionDepartments();
      positionDepartments
        .filter(link => link.department_id === departmentId && !link.deleted)
        .forEach(link => {
          if (link.position_id !== null) {
            positionIds.add(link.position_id);
          }
        });
      
      // 2. Добавляем ID должностей сотрудников, которые работают в этом отделе
      allEmployees
        .filter(emp => emp.department_id === departmentId && emp.position_id !== null && !emp.deleted)
        .forEach(emp => {
          if (emp.position_id) positionIds.add(emp.position_id);
        });
      
      // Если должностей не найдено, возвращаем пустой массив
      if (positionIds.size === 0) {
        return res.json({ status: 'success', data: [] });
      }
      
      // Фильтруем позиции по найденным ID
      const departmentPositions = allPositions.filter(
        position => positionIds.has(position.position_id) && !position.deleted
      );
      
      res.json({ status: 'success', data: departmentPositions });
    } catch (error) {
      console.error('Error fetching department positions:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to fetch department positions' 
      });
    }
  });
  
  // Создание связи должности с отделом
  app.post('/api/positiondepartments', async (req: Request, res: Response) => {
    try {
      const linkData = req.body;
      
      // Проверка наличия обязательных полей
      if (!linkData.position_id || !linkData.department_id) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Position ID and Department ID are required' 
        });
      }
      
      // Создаем связь
      const link = await storage.createPositionDepartment(linkData);
      res.status(201).json({ status: 'success', data: link });
    } catch (error) {
      console.error('Error creating position-department link:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to create position-department link' 
      });
    }
  });
  
  // API для работы с связями должностей и отделов - прямой доступ с коротким URL
  app.get('/api/pd/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Invalid position-department link ID' 
        });
      }

      const link = await storage.getPositionDepartment(id);
      
      if (!link) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Position-department link not found' 
        });
      }

      return res.json({ status: 'success', data: link });
    } catch (error) {
      console.error('Error fetching position-department link:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to fetch position-department link' 
      });
    }
  });
  
  app.put('/api/pd/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Invalid position-department link ID' 
        });
      }

      console.log('Updating position-department link:', id, 'with data:', req.body);

      const updateData = req.body;
      
      const updatedLink = await storage.updatePositionDepartment(id, updateData);
      
      if (!updatedLink) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Position-department link not found' 
        });
      }

      return res.json({ status: 'success', data: updatedLink });
    } catch (error) {
      console.error('Error updating position-department link:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to update position-department link' 
      });
    }
  });

  // Удаление связи должности с отделом
  app.delete('/api/positiondepartments/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid link ID' });
      }
      
      const deleted = await storage.deletePositionDepartment(id);
      if (!deleted) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Position-department link not found' 
        });
      }
      
      res.json({ status: 'success', message: 'Position-department link deleted successfully' });
    } catch (error) {
      console.error('Error deleting position-department link:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to delete position-department link' 
      });
    }
  });

  app.get('/api/positions/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid position ID' });
      }

      const position = await storage.getPosition(id);
      if (!position) {
        return res.status(404).json({ status: 'error', message: 'Position not found' });
      }

      res.json({ status: 'success', data: position });
    } catch (error) {
      console.error('Error fetching position:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch position' });
    }
  });
  
  // Получаем подчиненных должностей для указанной должности
  app.get('/api/positions/:id/subordinates', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid position ID' });
      }
      
      // Проверяем, существует ли должность
      const position = await storage.getPosition(id);
      if (!position) {
        return res.status(404).json({ status: 'error', message: 'Position not found' });
      }
      
      // Получаем подчиненные должности
      const subordinates = await storage.getPositionSubordinates(id);
      
      // Получаем сотрудников для каждой должности
      const employees = await storage.getAllEmployees();
      
      // Создаем результат, включающий информацию о должностях и сотрудниках
      const result = subordinates.map(position => {
        const positionEmployees = employees.filter(emp => emp.position_id === position.position_id);
        return {
          position,
          employees: positionEmployees
        };
      });
      
      // Находим сотрудника для основной должности
      const positionEmployee = employees.find(emp => emp.position_id === position.position_id);
      
      res.json({ 
        status: 'success', 
        data: {
          position,
          employee: positionEmployee || null,
          subordinates: result
        }
      });
    } catch (error) {
      console.error('Error fetching position subordinates:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch position subordinates' });
    }
  });
  
  // Получаем информацию о должности с отделами
  app.get('/api/positions/:id/with-departments', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid position ID' });
      }

      const position = await storage.getPosition(id);
      if (!position) {
        return res.status(404).json({ status: 'error', message: 'Position not found' });
      }
      
      const positionDepartments = await storage.getAllPositionDepartments();
      const departments = await storage.getAllDepartments();
      
      // Находим все связи position_department для данной должности
      const links = positionDepartments.filter(pd => pd.position_id === position.position_id);
      
      // Находим соответствующие отделы из связей в таблице position_department
      const linkedDepartments = links.map(link => {
        const dept = departments.find(d => d.department_id === link.department_id);
        return {
          position_link_id: link.position_link_id,
          department_id: link.department_id,
          department_name: dept?.name || 'Неизвестный отдел',
          sort: link.sort,
          vacancies: link.vacancies || 0
        };
      });
      
      // ВАЖНО: Убираем добавление "неявных" связей должность-отдел
      // Должны отображаться только те связи, которые явно указаны в таблице position_department
      
      const positionWithDepts = {
        ...position,
        departments: linkedDepartments
      };
      
      res.json({ status: 'success', data: positionWithDepts });
    } catch (error) {
      console.error('Error fetching position with departments:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch position with departments' });
    }
  });

  app.post('/api/positions', async (req: Request, res: Response) => {
    try {
      // Создаем копию req.body, чтобы не изменять исходный объект
      const positionDataCopy = { ...req.body };
      
      // Сохраняем department_id из запроса (если есть) и удаляем его из данных для позиции
      const departmentId = positionDataCopy.department_id;
      
      // Удаляем department_id из объекта, так как это поле больше не существует в таблице positions
      if (positionDataCopy.department_id !== undefined) {
        delete positionDataCopy.department_id;
      }
      
      // Валидируем и создаем должность
      const positionData = insertPositionSchema.parse(positionDataCopy);
      const position = await storage.createPosition(positionData);
      
      // Если был указан department_id, создаем связь в таблице position_department
      if (departmentId) {
        try {
          await storage.createPositionDepartment({
            position_id: position.position_id,
            department_id: departmentId,
            sort: 0,
            vacancies: 0,
            staff_units: 0,
            current_count: 0
          });
          console.log(`Создана связь должности ID ${position.position_id} с отделом ID ${departmentId}`);
        } catch (linkError) {
          console.error('Ошибка при создании связи должность-отдел:', linkError);
          // Продолжаем выполнение, так как должность уже создана
        }
      }
      
      res.status(201).json({ status: 'success', data: position });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ status: 'error', message: validationError.message });
      }
      
      console.error('Error creating position:', error);
      res.status(500).json({ status: 'error', message: 'Failed to create position' });
    }
  });

  app.put('/api/positions/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid position ID' });
      }

      const positionData = req.body;
      
      // Сохраняем department_id из запроса (если есть) и удаляем его из данных для позиции
      const departmentId = req.body.department_id;
      
      // Удаляем department_id из позиции, так как это поле больше не существует в таблице positions
      if (positionData.department_id !== undefined) {
        delete positionData.department_id;
      }
      
      const updatedPosition = await storage.updatePosition(id, positionData);
      
      if (!updatedPosition) {
        return res.status(404).json({ status: 'error', message: 'Position not found' });
      }
      
      // Если был указан department_id, проверяем наличие связи в таблице position_department
      if (departmentId) {
        try {
          // Получаем существующие связи для этой должности
          const positionDepartments = await storage.getAllPositionDepartments();
          const existingLink = positionDepartments.find(
            pd => pd.position_id === id && pd.department_id === departmentId
          );
          
          // Если связи нет, создаем ее
          if (!existingLink) {
            await storage.createPositionDepartment({
              position_id: id,
              department_id: departmentId,
              sort: 0,
              vacancies: 0,
              staff_units: 0,
              current_count: 0
            });
            console.log(`Создана связь должности ID ${id} с отделом ID ${departmentId} при обновлении`);
          }
        } catch (linkError) {
          console.error('Ошибка при обновлении связи должность-отдел:', linkError);
          // Продолжаем выполнение, так как должность уже обновлена
        }
      }

      res.json({ status: 'success', data: updatedPosition });
    } catch (error) {
      console.error('Error updating position:', error);
      res.status(500).json({ status: 'error', message: 'Failed to update position' });
    }
  });

  app.delete('/api/positions/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid position ID' });
      }

      const deleted = await storage.deletePosition(id);
      if (!deleted) {
        return res.status(404).json({ status: 'error', message: 'Position not found' });
      }

      res.json({ status: 'success', message: 'Position deleted successfully' });
    } catch (error) {
      console.error('Error deleting position:', error);
      res.status(500).json({ status: 'error', message: 'Failed to delete position' });
    }
  });

  // Сотрудники (Employees) endpoints
  app.get('/api/employees', async (req: Request, res: Response) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json({ status: 'success', data: employees });
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch employees' });
    }
  });

  app.get('/api/employees/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid employee ID' });
      }

      const employee = await storage.getEmployee(id);
      if (!employee) {
        return res.status(404).json({ status: 'error', message: 'Employee not found' });
      }

      res.json({ status: 'success', data: employee });
    } catch (error) {
      console.error('Error fetching employee:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch employee' });
    }
  });

  app.post('/api/employees', async (req: Request, res: Response) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(employeeData);
      res.status(201).json({ status: 'success', data: employee });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ status: 'error', message: validationError.message });
      }
      
      console.error('Error creating employee:', error);
      res.status(500).json({ status: 'error', message: 'Failed to create employee' });
    }
  });

  app.put('/api/employees/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid employee ID' });
      }

      const employeeData = req.body;
      const updatedEmployee = await storage.updateEmployee(id, employeeData);
      
      if (!updatedEmployee) {
        return res.status(404).json({ status: 'error', message: 'Employee not found' });
      }

      res.json({ status: 'success', data: updatedEmployee });
    } catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).json({ status: 'error', message: 'Failed to update employee' });
    }
  });

  app.delete('/api/employees/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid employee ID' });
      }

      const deleted = await storage.deleteEmployee(id);
      if (!deleted) {
        return res.status(404).json({ status: 'error', message: 'Employee not found' });
      }

      res.json({ status: 'success', message: 'Employee deleted successfully' });
    } catch (error) {
      console.error('Error deleting employee:', error);
      res.status(500).json({ status: 'error', message: 'Failed to delete employee' });
    }
  });

  // Проекты (Projects) endpoints
  app.get('/api/projects', async (req: Request, res: Response) => {
    try {
      const projects = await storage.getAllProjects();
      res.json({ status: 'success', data: projects });
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch projects' });
    }
  });

  app.get('/api/projects/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid project ID' });
      }

      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ status: 'error', message: 'Project not found' });
      }

      res.json({ status: 'success', data: project });
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch project' });
    }
  });

  app.post('/api/projects', async (req: Request, res: Response) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json({ status: 'success', data: project });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ status: 'error', message: validationError.message });
      }
      
      console.error('Error creating project:', error);
      res.status(500).json({ status: 'error', message: 'Failed to create project' });
    }
  });

  app.put('/api/projects/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid project ID' });
      }

      const projectData = req.body;
      const updatedProject = await storage.updateProject(id, projectData);
      
      if (!updatedProject) {
        return res.status(404).json({ status: 'error', message: 'Project not found' });
      }

      res.json({ status: 'success', data: updatedProject });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ status: 'error', message: 'Failed to update project' });
    }
  });

  app.delete('/api/projects/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid project ID' });
      }

      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res.status(404).json({ status: 'error', message: 'Project not found' });
      }

      res.json({ status: 'success', message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ status: 'error', message: 'Failed to delete project' });
    }
  });

  // EmployeeProjects endpoints
  app.get('/api/employeeprojects', async (req: Request, res: Response) => {
    try {
      const employeeProjects = await storage.getAllEmployeeProjects();
      res.json({ status: 'success', data: employeeProjects });
    } catch (error) {
      console.error('Error fetching employee projects:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch employee projects' });
    }
  });

  app.get('/api/employeeprojects/employee/:employeeId', async (req: Request, res: Response) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      if (isNaN(employeeId)) {
        return res.status(400).json({ status: 'error', message: 'Invalid employee ID' });
      }

      const employeeProjects = await storage.getEmployeeProjectsByEmployee(employeeId);
      res.json({ status: 'success', data: employeeProjects });
    } catch (error) {
      console.error('Error fetching employee projects:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch employee projects' });
    }
  });

  app.get('/api/employeeprojects/project/:projectId', async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ status: 'error', message: 'Invalid project ID' });
      }

      // Получаем информацию о проекте
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ status: 'error', message: 'Project not found' });
      }

      // Получаем список сотрудников проекта
      const employeeProjects = await storage.getEmployeeProjectsByProject(projectId);

      // Формируем ответ, включающий как информацию о проекте, так и список сотрудников
      res.json({ 
        status: 'success', 
        data: {
          title: project.name,
          description: project.description,
          employees: employeeProjects
        } 
      });
    } catch (error) {
      console.error('Error fetching project details:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch project details' });
    }
  });

  app.post('/api/employeeprojects', async (req: Request, res: Response) => {
    try {
      const employeeProjectData = insertEmployeeProjectSchema.parse(req.body);
      const employeeProject = await storage.createEmployeeProject(employeeProjectData);
      res.status(201).json({ status: 'success', data: employeeProject });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ status: 'error', message: validationError.message });
      }
      
      console.error('Error creating employee project:', error);
      res.status(500).json({ status: 'error', message: 'Failed to create employee project' });
    }
  });

  app.put('/api/employeeprojects/:employeeId/:projectId', async (req: Request, res: Response) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const projectId = parseInt(req.params.projectId);
      
      if (isNaN(employeeId) || isNaN(projectId)) {
        return res.status(400).json({ status: 'error', message: 'Invalid employee or project ID' });
      }

      const employeeProjectData = req.body;
      const updatedEmployeeProject = await storage.updateEmployeeProject(employeeId, projectId, employeeProjectData);
      
      if (!updatedEmployeeProject) {
        return res.status(404).json({ status: 'error', message: 'Employee project not found' });
      }

      res.json({ status: 'success', data: updatedEmployeeProject });
    } catch (error) {
      console.error('Error updating employee project:', error);
      res.status(500).json({ status: 'error', message: 'Failed to update employee project' });
    }
  });

  app.delete('/api/employeeprojects/:employeeId/:projectId', async (req: Request, res: Response) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const projectId = parseInt(req.params.projectId);
      
      if (isNaN(employeeId) || isNaN(projectId)) {
        return res.status(400).json({ status: 'error', message: 'Invalid employee or project ID' });
      }

      const deleted = await storage.deleteEmployeeProject(employeeId, projectId);
      if (!deleted) {
        return res.status(404).json({ status: 'error', message: 'Employee project not found' });
      }

      res.json({ status: 'success', message: 'Employee project deleted successfully' });
    } catch (error) {
      console.error('Error deleting employee project:', error);
      res.status(500).json({ status: 'error', message: 'Failed to delete employee project' });
    }
  });

  // Leaves endpoints
  app.get('/api/leaves', async (req: Request, res: Response) => {
    try {
      const leaves = await storage.getAllLeaves();
      res.json({ status: 'success', data: leaves });
    } catch (error) {
      console.error('Error fetching leaves:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch leaves' });
    }
  });

  app.get('/api/leaves/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid leave ID' });
      }

      const leave = await storage.getLeave(id);
      if (!leave) {
        return res.status(404).json({ status: 'error', message: 'Leave not found' });
      }

      res.json({ status: 'success', data: leave });
    } catch (error) {
      console.error('Error fetching leave:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch leave' });
    }
  });

  app.get('/api/leaves/employee/:employeeId', async (req: Request, res: Response) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      if (isNaN(employeeId)) {
        return res.status(400).json({ status: 'error', message: 'Invalid employee ID' });
      }

      const leaves = await storage.getLeavesByEmployee(employeeId);
      res.json({ status: 'success', data: leaves });
    } catch (error) {
      console.error('Error fetching leaves:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch leaves' });
    }
  });

  app.post('/api/leaves', async (req: Request, res: Response) => {
    try {
      const leaveData = insertLeaveSchema.parse(req.body);
      const leave = await storage.createLeave(leaveData);
      res.status(201).json({ status: 'success', data: leave });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ status: 'error', message: validationError.message });
      }
      
      console.error('Error creating leave:', error);
      res.status(500).json({ status: 'error', message: 'Failed to create leave' });
    }
  });

  app.put('/api/leaves/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid leave ID' });
      }

      const leaveData = req.body;
      const updatedLeave = await storage.updateLeave(id, leaveData);
      
      if (!updatedLeave) {
        return res.status(404).json({ status: 'error', message: 'Leave not found' });
      }

      res.json({ status: 'success', data: updatedLeave });
    } catch (error) {
      console.error('Error updating leave:', error);
      res.status(500).json({ status: 'error', message: 'Failed to update leave' });
    }
  });

  app.delete('/api/leaves/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid leave ID' });
      }

      const deleted = await storage.deleteLeave(id);
      if (!deleted) {
        return res.status(404).json({ status: 'error', message: 'Leave not found' });
      }

      res.json({ status: 'success', message: 'Leave deleted successfully' });
    } catch (error) {
      console.error('Error deleting leave:', error);
      res.status(500).json({ status: 'error', message: 'Failed to delete leave' });
    }
  });

  // Настройки (Settings) endpoints
  app.get('/api/settings', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const settings = await storage.getAllSettings();
      res.json({ status: 'success', data: settings });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch settings' });
    }
  });
  
  // Публичные настройки (без необходимости авторизации)
  app.get('/api/public-settings', async (req: Request, res: Response) => {
    console.log('Public settings endpoint called');
    try {
      const settings = await storage.getAllSettings();
      console.log('Retrieved public settings:', settings);
      res.json({ status: 'success', data: settings });
    } catch (error) {
      console.error('Error fetching public settings:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch public settings' });
    }
  });

  app.get('/api/settings/:key', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const key = req.params.key;
      const setting = await storage.getSetting(key);
      
      if (!setting) {
        return res.status(404).json({ status: 'error', message: 'Setting not found' });
      }

      res.json({ status: 'success', data: setting });
    } catch (error) {
      console.error('Error fetching setting:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch setting' });
    }
  });

  app.post('/api/settings', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { key, value } = req.body;
      
      if (!key || !value) {
        return res.status(400).json({ status: 'error', message: 'Key and value are required' });
      }

      const setting = await storage.createOrUpdateSetting(key, value);
      res.status(201).json({ status: 'success', data: setting });
    } catch (error) {
      console.error('Error creating/updating setting:', error);
      res.status(500).json({ status: 'error', message: 'Failed to create/update setting' });
    }
  });
  
  // Смена пароля пользователя
  app.post('/api/change-password', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'User ID, current password and new password are required' 
        });
      }
      
      // Получаем пользователя
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }
      
      // Проверяем текущий пароль
      const { comparePasswords } = await import('./auth'); // Импортируем функцию сравнения паролей
      const isCorrectPassword = await comparePasswords(currentPassword, user.password);
      
      if (!isCorrectPassword) {
        return res.status(400).json({ status: 'error', message: 'Неверный текущий пароль' });
      }
      
      // Хешируем новый пароль
      const { hashPassword } = await import('./auth'); // Импортируем функцию хеширования
      const hashedPassword = await hashPassword(newPassword);
      
      // Обновляем пароль пользователя
      const updatedUser = await storage.updateUser(userId, { password: hashedPassword });
      
      if (!updatedUser) {
        return res.status(500).json({ status: 'error', message: 'Не удалось обновить пароль' });
      }
      
      res.json({ status: 'success', message: 'Пароль успешно изменен' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ status: 'error', message: 'Failed to change password' });
    }
  });

  // API для работы с сортировкой элементов в дереве организации
  app.get('/api/sort-tree', async (req: Request, res: Response) => {
    try {
      const sortItems = await db.select().from(sort_tree).orderBy(asc(sort_tree.sort));
      res.json({ status: 'success', data: sortItems });
    } catch (error) {
      console.error('Error fetching sort tree items:', error);
      res.status(500).json({ status: 'error', message: 'Не удалось получить данные о сортировке' });
    }
  });

  app.get('/api/sort-tree/:type/:typeId', async (req: Request, res: Response) => {
    try {
      const { type, typeId } = req.params;
      const id = parseInt(typeId);
      
      if (isNaN(id) || !['department', 'position'].includes(type)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Некорректные параметры запроса' 
        });
      }

      const [sortItem] = await db.select()
        .from(sort_tree)
        .where(and(eq(sort_tree.type, type), eq(sort_tree.type_id, id)));

      if (!sortItem) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Запись сортировки не найдена' 
        });
      }

      res.json({ status: 'success', data: sortItem });
    } catch (error) {
      console.error('Error fetching sort tree item:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Не удалось получить данные о сортировке' 
      });
    }
  });

  app.post('/api/sort-tree', async (req: Request, res: Response) => {
    try {
      const sortItemData = insertSortTreeSchema.parse(req.body);
      
      // Проверяем, что не существует записи с таким же type, type_id и parent_id
      // Учитываем случай, когда parent_id может быть null
      // Преобразуем parent_id в null, если значение не определено
      if (sortItemData.parent_id === undefined) {
        sortItemData.parent_id = null;
      }
      
      // Формируем условие выборки
      const baseCondition = and(
        eq(sort_tree.type, sortItemData.type),
        eq(sort_tree.type_id, sortItemData.type_id)
      );
      
      let queryCondition;
      if (sortItemData.parent_id === null) {
        queryCondition = and(
          baseCondition,
          isNull(sort_tree.parent_id)
        );
      } else {
        queryCondition = and(
          baseCondition,
          eq(sort_tree.parent_id, sortItemData.parent_id)
        );
      }
      
      const existingSortItem = await db.select()
        .from(sort_tree)
        .where(queryCondition);

      if (existingSortItem.length > 0) {
        // Вместо ошибки 409, возвращаем существующую запись
        return res.status(200).json({ 
          status: 'success', 
          data: existingSortItem[0],
          message: 'Запись уже существует' 
        });
      }

      console.log("Создаем новую запись сортировки:", sortItemData);
      
      const [sortItem] = await db.insert(sort_tree)
        .values(sortItemData)
        .returning();

      res.status(201).json({ status: 'success', data: sortItem });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ status: 'error', message: validationError.message });
      }
      
      console.error('Error creating sort tree item:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Не удалось создать запись сортировки' 
      });
    }
  });

  app.put('/api/sort-tree/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Некорректный ID записи сортировки' 
        });
      }

      const { sort } = req.body;
      if (typeof sort !== 'number') {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Значение сортировки должно быть числом' 
        });
      }

      const [updated] = await db.update(sort_tree)
        .set({ sort })
        .where(eq(sort_tree.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Запись сортировки не найдена' 
        });
      }

      res.json({ status: 'success', data: updated });
    } catch (error) {
      console.error('Error updating sort tree item:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Не удалось обновить запись сортировки' 
      });
    }
  });

  // API для обновления порядка элементов после перетаскивания
  app.post('/api/sort-tree/reorder', async (req: Request, res: Response) => {
    try {
      const { items } = req.body;
      
      if (!Array.isArray(items) || items.some(item => !item.id || typeof item.sort !== 'number')) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Некорректные данные сортировки' 
        });
      }

      // Используем транзакцию для атомарного обновления всех записей
      const result = await db.transaction(async (tx) => {
        const updated = await Promise.all(
          items.map(async (item) => {
            const [updated] = await tx.update(sort_tree)
              .set({ sort: item.sort })
              .where(eq(sort_tree.id, item.id))
              .returning();
            return updated;
          })
        );
        return updated;
      });

      res.json({ status: 'success', data: result });
    } catch (error) {
      console.error('Error reordering sort tree items:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Не удалось обновить порядок сортировки' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
