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
  insertSettingSchema
} from "@shared/schema";
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
      res.json({ status: 'success', data: departments });
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
      
      // Создаем обогащенный список должностей с отделами
      const positionsWithDepts = positions.map(position => {
        // Находим все связи position_department для данной должности
        const links = positionDepartments.filter(pd => pd.position_id === position.position_id);
        // Находим соответствующие отделы
        const linkedDepartments = links.map(link => {
          const dept = departments.find(d => d.department_id === link.department_id);
          return {
            position_link_id: link.position_link_id,
            department_id: link.department_id,
            department_name: dept?.name || 'Неизвестный отдел',
            sort: link.sort
          };
        });
        
        // Добавляем информацию о родительской должности, если она есть
        return {
          ...position,
          departments: linkedDepartments
        };
      });
      
      res.json({ status: 'success', data: positionsWithDepts });
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
  
  // Получение позиций для конкретного отдела
  app.get('/api/departments/:id/positions', async (req: Request, res: Response) => {
    try {
      const departmentId = parseInt(req.params.id);
      
      if (isNaN(departmentId)) {
        return res.status(400).json({ status: 'error', message: 'Invalid department ID' });
      }
      
      // Получаем все связи позиция-отдел для этого отдела
      const positionDepartments = await storage.getAllPositionDepartments();
      const departmentPositionLinks = positionDepartments.filter(
        link => link.department_id === departmentId
      );
      
      // Если связей нет, возвращаем пустой массив
      if (departmentPositionLinks.length === 0) {
        return res.json({ status: 'success', data: [] });
      }
      
      // Получаем все позиции
      const allPositions = await storage.getAllPositions();
      
      // Фильтруем позиции, которые связаны с этим отделом
      const linkedPositionIds = departmentPositionLinks.map(link => link.position_id);
      const departmentPositions = allPositions.filter(
        position => linkedPositionIds.includes(position.position_id)
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
      // Находим соответствующие отделы
      const linkedDepartments = links.map(link => {
        const dept = departments.find(d => d.department_id === link.department_id);
        return {
          position_link_id: link.position_link_id,
          department_id: link.department_id,
          department_name: dept?.name || 'Неизвестный отдел',
          sort: link.sort
        };
      });
      
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
      const positionData = insertPositionSchema.parse(req.body);
      const position = await storage.createPosition(positionData);
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
      const updatedPosition = await storage.updatePosition(id, positionData);
      
      if (!updatedPosition) {
        return res.status(404).json({ status: 'error', message: 'Position not found' });
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

  const httpServer = createServer(app);
  return httpServer;
}
