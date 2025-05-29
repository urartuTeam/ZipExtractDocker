import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { and, eq, sql } from "drizzle-orm";
import {
  insertUserSchema,
  insertDepartmentSchema,
  insertPositionSchema,
  insertPositionDepartmentSchema,
  insertEmployeeSchema,
  insertProjectSchema,
  insertEmployeeProjectSchema,
  insertLeaveSchema,
  insertRoleSchema,
  departments,
  positions,
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";
import { registerPositionEndpoints } from "./api/position_endpoints";
import { registerSortTreeEndpoints } from "./api/sort_tree_endpoints";
import uploadRoutes from "./routes/upload";
import cleanupRoutes from "./routes/cleanup";
import path from "path";
import express from "express";

// Промежуточное ПО для проверки аутентификации
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ status: "error", message: "Требуется авторизация" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Настройка авторизации
  setupAuth(app);

  // Статические файлы для загруженных изображений
  app.use(
      "/uploads",
      express.static(path.join(process.cwd(), "public", "uploads")),
  );

  // Подключаем маршруты для загрузки файлов
  // Важно: маршруты API должны быть зарегистрированы ДО middleware Vite
  // Добавляем логирование каждого запроса к эндпоинтам загрузки
  app.use("/api/upload", (req, res, next) => {
    console.log(
        `[upload router] Получен запрос: ${req.method} ${req.originalUrl}`,
    );

    // Проверяем если это запрос на загрузку файла, устанавливаем правильные заголовки для CORS и типа ответа
    if (req.method === "POST" || req.method === "DELETE") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
      res.setHeader("Content-Type", "application/json");
    }

    return uploadRoutes(req, res, next);
  });

  // Подключаем маршруты для очистки неиспользуемых фотографий
  app.use("/api", cleanupRoutes);

  // Регистрация специализированных эндпоинтов для должностей
  registerPositionEndpoints(app);

  // Регистрация эндпоинтов для работы с сортировкой дерева
  registerSortTreeEndpoints(app);

  // API routes
  const apiRouter = app.route("/api");

  // Users endpoints
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json({ status: "success", data: users });
    } catch (error) {
      console.error("Error fetching users:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: "error", message: "Invalid user ID" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res
            .status(404)
            .json({ status: "error", message: "User not found" });
      }

      res.json({ status: "success", data: user });
    } catch (error) {
      console.error("Error fetching user:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res
            .status(409)
            .json({ status: "error", message: "Username already exists" });
      }

      const user = await storage.createUser(userData);
      res.status(201).json({ status: "success", data: user });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res
            .status(400)
            .json({ status: "error", message: validationError.message });
      }

      console.error("Error creating user:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: "error", message: "Invalid user ID" });
      }

      const userData = req.body;
      const updatedUser = await storage.updateUser(id, userData);

      if (!updatedUser) {
        return res
            .status(404)
            .json({ status: "error", message: "User not found" });
      }

      res.json({ status: "success", data: updatedUser });
    } catch (error) {
      console.error("Error updating user:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: "error", message: "Invalid user ID" });
      }

      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res
            .status(404)
            .json({ status: "error", message: "User not found" });
      }

      res.json({ status: "success", message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to delete user" });
    }
  });

  // Отделы (Departments) endpoints
  app.get("/api/departments", async (req: Request, res: Response) => {
    try {
      const departments = await storage.getAllDepartments();
      res.json({ status: "success", data: departments });
    } catch (error) {
      console.error("Error fetching departments:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to fetch departments" });
    }
  });

  app.get("/api/departments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: "error", message: "Invalid department ID" });
      }

      const department = await storage.getDepartment(id);
      if (!department) {
        return res
            .status(404)
            .json({ status: "error", message: "Department not found" });
      }

      res.json({ status: "success", data: department });
    } catch (error) {
      console.error("Error fetching department:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to fetch department" });
    }
  });

  app.post("/api/departments", async (req: Request, res: Response) => {
    try {
      const departmentData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(departmentData);
      res.status(201).json({ status: "success", data: department });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res
            .status(400)
            .json({ status: "error", message: validationError.message });
      }

      console.error("Error creating department:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to create department" });
    }
  });

  app.put("/api/departments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: "error", message: "Invalid department ID" });
      }

      const departmentData = req.body;
      const updatedDepartment = await storage.updateDepartment(
          id,
          departmentData,
      );

      if (!updatedDepartment) {
        return res
            .status(404)
            .json({ status: "error", message: "Department not found" });
      }

      res.json({ status: "success", data: updatedDepartment });
    } catch (error) {
      console.error("Error updating department:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to update department" });
    }
  });

  app.delete("/api/departments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: "error", message: "Invalid department ID" });
      }

      const deleted = await storage.deleteDepartment(id);
      if (!deleted) {
        return res
            .status(404)
            .json({ status: "error", message: "Department not found" });
      }

      res.json({
        status: "success",
        message: "Department deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting department:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to delete department" });
    }
  });

  // Обновление порядка сортировки отделов
  app.post(
      "/api/departments/sort",
      isAuthenticated,
      async (req: Request, res: Response) => {
        try {
          const { updates } = req.body;

          if (!Array.isArray(updates)) {
            return res.status(400).json({
              status: "error",
              message: "Ожидается массив обновлений",
            });
          }

          // Проверяем валидность данных
          for (const update of updates) {
            if (!update.department_id || typeof update.sort !== "number") {
              return res.status(400).json({
                status: "error",
                message: "Неверный формат данных обновления",
              });
            }
          }

          // Выполняем обновления
          for (const update of updates) {
            await db
                .update(departments)
                .set({ sort: update.sort })
                .where(eq(departments.department_id, update.department_id))
                .execute();
          }

          res.status(200).json({
            status: "success",
            message: "Порядок сортировки отделов успешно обновлен",
          });
        } catch (error) {
          console.error("Error updating departments sort order:", error);
          res.status(500).json({
            status: "error",
            message: "Ошибка при обновлении порядка сортировки отделов",
          });
        }
      },
  );

  // Organizations endpoints
  app.get("/api/organizations", async (req: Request, res: Response) => {
    try {
      // Используем прямой запрос к базе для получения отделов с флагом is_organization
      const organizations = await db
          .select()
          .from(departments)
          .where(eq(departments.is_organization, true));
      res.json({ status: "success", data: organizations });
    } catch (error) {
      console.error("Error fetching organizations:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to fetch organizations" });
    }
  });

  app.post("/api/organizations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: "error", message: "Invalid department ID" });
      }

      const department = await storage.getDepartment(id);
      if (!department) {
        return res
            .status(404)
            .json({ status: "error", message: "Department not found" });
      }

      const updatedDepartment = await storage.setOrganizationStatus(id, true);
      res.json({ status: "success", data: updatedDepartment });
    } catch (error) {
      console.error("Error setting organization status:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to set organization status",
      });
    }
  });

  app.delete("/api/organizations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: "error", message: "Invalid department ID" });
      }

      const department = await storage.getDepartment(id);
      if (!department) {
        return res
            .status(404)
            .json({ status: "error", message: "Department not found" });
      }

      const updatedDepartment = await storage.setOrganizationStatus(id, false);
      res.json({ status: "success", data: updatedDepartment });
    } catch (error) {
      console.error("Error removing organization status:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to remove organization status",
      });
    }
  });

  // Должности (Positions) endpoints
  app.get("/api/positions", async (req: Request, res: Response) => {
    try {
      const positions = await storage.getAllPositions();
      res.json({ status: "success", data: positions });
    } catch (error) {
      console.error("Error fetching positions:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to fetch positions" });
    }
  });

  app.get("/api/positions/categories", async (req: Request, res: Response) => {
    try {
      // Получаем только должности, которые являются категориями
      const positions = await storage.getPositionCategories();
      res.json({ status: "success", data: positions });
    } catch (error) {
      console.error("Error fetching position categories:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch position categories",
      });
    }
  });

  app.get("/api/positions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: "error", message: "Invalid position ID" });
      }

      const position = await storage.getPosition(id);
      if (!position) {
        return res
            .status(404)
            .json({ status: "error", message: "Position not found" });
      }

      res.json({ status: "success", data: position });
    } catch (error) {
      console.error("Error fetching position:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to fetch position" });
    }
  });

  app.post("/api/positions", async (req: Request, res: Response) => {
    try {
      const positionData = insertPositionSchema.parse(req.body);
      if (positionData.is_category === undefined) {
        positionData.is_category = false;
      }

      const position = await storage.createPosition(positionData);

      res.status(201).json({ status: "success", data: position });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res
            .status(400)
            .json({ status: "error", message: validationError.message });
      }

      console.error("Error creating position:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to create position" });
    }
  });

  app.put("/api/positions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: "error", message: "Invalid position ID" });
      }

      const positionData = req.body;
      const updatedPosition = await storage.updatePosition(id, positionData);

      if (!updatedPosition) {
        return res
            .status(404)
            .json({ status: "error", message: "Position not found" });
      }

      res.json({ status: "success", data: updatedPosition });
    } catch (error) {
      console.error("Error updating position:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to update position" });
    }
  });

  app.delete("/api/positions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: "error", message: "Invalid position ID" });
      }

      const deleted = await storage.deletePosition(id);
      if (!deleted) {
        return res
            .status(404)
            .json({ status: "error", message: "Position not found" });
      }

      res.json({ status: "success", message: "Position deleted successfully" });
    } catch (error) {
      console.error("Error deleting position:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to delete position" });
    }
  });

  // Обновление порядка сортировки должностей
  app.post(
      "/api/positions/sort",
      isAuthenticated,
      async (req: Request, res: Response) => {
        try {
          const { updates } = req.body;

          if (!Array.isArray(updates)) {
            return res.status(400).json({
              status: "error",
              message: "Ожидается массив обновлений",
            });
          }

          // Проверяем валидность данных
          for (const update of updates) {
            if (!update.position_id || typeof update.sort !== "number") {
              return res.status(400).json({
                status: "error",
                message: "Неверный формат данных обновления",
              });
            }
          }

          // Выполняем обновления
          for (const update of updates) {
            await db
                .update(positions)
                .set({ sort: update.sort })
                .where(eq(positions.position_id, update.position_id))
                .execute();
          }

          res.status(200).json({
            status: "success",
            message: "Порядок сортировки должностей успешно обновлен",
          });
        } catch (error) {
          console.error("Error updating positions sort order:", error);
          res.status(500).json({
            status: "error",
            message: "Ошибка при обновлении порядка сортировки должностей",
          });
        }
      },
  );

  // Сотрудники (Employees) endpoints
  app.get("/api/employees", async (req: Request, res: Response) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json({ status: "success", data: employees });
    } catch (error) {
      console.error("Error fetching employees:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to fetch employees" });
    }
  });

  app.get("/api/employees/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: "error", message: "Invalid employee ID" });
      }

      const employee = await storage.getEmployee(id);
      if (!employee) {
        return res
            .status(404)
            .json({ status: "error", message: "Employee not found" });
      }

      res.json({ status: "success", data: employee });
    } catch (error) {
      console.error("Error fetching employee:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to fetch employee" });
    }
  });

  app.post("/api/employees", async (req: Request, res: Response) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);

      // Проверка, является ли позиция категорией
      if (employeeData.position_id) {
        const position = await storage.getPosition(employeeData.position_id);
        if (position && position.is_category === true) {
          // Для категории нужен родительский position_id
          if (!employeeData.category_parent_id) {
            return res.status(400).json({
              status: "error",
              message:
                  "При назначении сотрудника на должность-категорию необходимо указать category_parent_id",
            });
          }
        } else {
          // Если не категория, устанавливаем category_parent_id в null
          employeeData.category_parent_id = null;
        }
      }

      const employee = await storage.createEmployee(employeeData);
      res.status(201).json({ status: "success", data: employee });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res
            .status(400)
            .json({ status: "error", message: validationError.message });
      }

      console.error("Error creating employee:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to create employee" });
    }
  });

  app.put("/api/employees/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: "error", message: "Invalid employee ID" });
      }

      const employeeData = req.body;

      // Проверка, является ли позиция категорией
      if (employeeData.position_id) {
        const position = await storage.getPosition(employeeData.position_id);
        if (position && position.is_category === true) {
          // Для категории нужен родительский position_id
          if (!employeeData.category_parent_id) {
            return res.status(400).json({
              status: "error",
              message:
                  "При назначении сотрудника на должность-категорию необходимо указать category_parent_id",
            });
          }
        } else {
          // Если не категория, устанавливаем category_parent_id в null
          employeeData.category_parent_id = null;
        }
      }

      const updatedEmployee = await storage.updateEmployee(id, employeeData);

      if (!updatedEmployee) {
        return res
            .status(404)
            .json({ status: "error", message: "Employee not found" });
      }

      res.json({ status: "success", data: updatedEmployee });
    } catch (error) {
      console.error("Error updating employee:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: "error", message: "Invalid employee ID" });
      }

      const deleted = await storage.deleteEmployee(id);
      if (!deleted) {
        return res
            .status(404)
            .json({ status: "error", message: "Employee not found" });
      }

      res.json({ status: "success", message: "Employee deleted successfully" });
    } catch (error) {
      console.error("Error deleting employee:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to delete employee" });
    }
  });

  // Проекты (Projects) endpoints
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      const projects = await storage.getAllProjects();

      const projectsWithCounts = await Promise.all(
          projects.map(async (project) => {
            const employeeProjects = await storage.getEmployeeProjectsByProject(
                project.project_id,
            );
            return {
              ...project,
              employeeCount: employeeProjects?.length || 0,
            };
          }),
      );

      console.log("projectsWithCounts:", projectsWithCounts); // debug

      res.json({ status: "success", data: projectsWithCounts });
    } catch (error) {
      console.error("Error fetching projects:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: "error", message: "Invalid project ID" });
      }

      const project = await storage.getProject(id);
      if (!project) {
        return res
            .status(404)
            .json({ status: "error", message: "Project not found" });
      }

      // Отладочный вывод для проверки полей проекта
      console.log("Полный объект проекта из БД:", project);
      console.log("Поля проекта:", Object.keys(project));
      console.log("id_organization:", project.id_organization);

      // Отладочный вывод для проверки полей проекта
      console.log("Полный объект проекта из БД:", project);
      console.log("Поля проекта:", Object.keys(project));
      console.log("id_organization:", project.id_organization);

      res.json({ status: "success", data: project });
    } catch (error) {
      console.error("Error fetching project:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json({ status: "success", data: project });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res
            .status(400)
            .json({ status: "error", message: validationError.message });
      }

      console.error("Error creating project:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: "error", message: "Invalid project ID" });
      }

      const projectData = req.body;
      const updatedProject = await storage.updateProject(id, projectData);

      if (!updatedProject) {
        return res
            .status(404)
            .json({ status: "error", message: "Project not found" });
      }

      res.json({ status: "success", data: updatedProject });
    } catch (error) {
      console.error("Error updating project:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: "error", message: "Invalid project ID" });
      }

      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res
            .status(404)
            .json({ status: "error", message: "Project not found" });
      }

      res.json({ status: "success", message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to delete project" });
    }
  });

  // Обновление порядка сортировки проектов
  app.post("/api/projects/sort", async (req: Request, res: Response) => {
    try {
      const updates = req.body;

      if (!Array.isArray(updates)) {
        return res.status(400).json({
          status: "error",
          message: "Неверный формат данных. Ожидается массив обновлений.",
        });
      }

      // Проверяем, что все элементы имеют необходимые поля
      const isValid = updates.every(
          (item) =>
              typeof item === "object" &&
              item !== null &&
              "project_id" in item &&
              "sort" in item &&
              typeof item.project_id === "number" &&
              typeof item.sort === "number",
      );

      if (!isValid) {
        return res.status(400).json({
          status: "error",
          message:
              "Неверный формат данных. Каждый элемент должен содержать project_id и sort.",
        });
      }

      // Обновляем порядок сортировки для каждого проекта
      const results = await Promise.all(
          updates.map((update) =>
              storage.updateProject(update.project_id, { sort: update.sort }),
          ),
      );

      // Проверяем, были ли обновлены все проекты
      const allUpdated = results.every((result) => result !== null);

      if (!allUpdated) {
        return res.status(404).json({
          status: "error",
          message:
              "Не все проекты были обновлены. Некоторые проекты не найдены.",
        });
      }

      res.json({
        status: "success",
        message: "Порядок сортировки проектов успешно обновлен",
      });
    } catch (error) {
      console.error("Error updating projects sort order:", error);
      res.status(500).json({
        status: "error",
        message: "Ошибка при обновлении порядка сортировки проектов",
      });
    }
  });

  // Обновление порядка сортировки проектов
  app.post("/api/projects/sort", async (req: Request, res: Response) => {
    try {
      const updates = req.body;

      if (!Array.isArray(updates)) {
        return res.status(400).json({
          status: "error",
          message: "Неверный формат данных. Ожидается массив обновлений.",
        });
      }

      // Проверяем, что все элементы имеют необходимые поля
      const isValid = updates.every(
          (item) =>
              typeof item === "object" &&
              item !== null &&
              "project_id" in item &&
              "sort" in item &&
              typeof item.project_id === "number" &&
              typeof item.sort === "number",
      );

      if (!isValid) {
        return res.status(400).json({
          status: "error",
          message:
              "Неверный формат данных. Каждый элемент должен содержать project_id и sort.",
        });
      }

      // Обновляем порядок сортировки для каждого проекта
      const results = await Promise.all(
          updates.map((update) =>
              storage.updateProject(update.project_id, { sort: update.sort }),
          ),
      );

      // Проверяем, были ли обновлены все проекты
      const allUpdated = results.every((result) => result !== null);

      if (!allUpdated) {
        return res.status(404).json({
          status: "error",
          message:
              "Не все проекты были обновлены. Некоторые проекты не найдены.",
        });
      }

      res.json({
        status: "success",
        message: "Порядок сортировки проектов успешно обновлен",
      });
    } catch (error) {
      console.error("Error updating projects sort order:", error);
      res.status(500).json({
        status: "error",
        message: "Ошибка при обновлении порядка сортировки проектов",
      });
    }
  });

  // EmployeeProjects endpoints
  app.get("/api/employeeprojects", async (req: Request, res: Response) => {
    try {
      const employeeProjects = await storage.getAllEmployeeProjects();
      res.json({ status: "success", data: employeeProjects });
    } catch (error) {
      console.error("Error fetching employee projects:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch employee projects 1",
      });
    }
  });

  app.get(
      "/api/employeeprojects/employee/:employeeId",
      async (req: Request, res: Response) => {
        try {
          const employeeId = parseInt(req.params.employeeId);
          if (isNaN(employeeId)) {
            return res
                .status(400)
                .json({ status: "error", message: "Invalid employee ID" });
          }

          const employeeProjects =
              await storage.getEmployeeProjectsByEmployee(employeeId);
          res.json({ status: "success", data: employeeProjects });
        } catch (error) {
          console.error("Error fetching employee projects:", error);
          res.status(500).json({
            status: "error",
            message: "Failed to fetch employee projects 2",
          });
        }
      },
  );

  app.get(
      "/api/employeeprojects/project/:projectId",
      async (req: Request, res: Response) => {
        try {
          const projectId = parseInt(req.params.projectId);
          if (isNaN(projectId)) {
            return res
                .status(400)
                .json({ status: "error", message: "Invalid project ID" });
          }

          const employeeProjects =
              await storage.getEmployeeProjectsByProject(projectId);
          res.json({ status: "success", data: employeeProjects });
        } catch (error) {
          console.error("Error fetching employee projects:", error);
          res.status(500).json({
            status: "error",
            message: "Failed to fetch employee projects 3",
          });
        }
      },
  );

  app.post("/api/employeeprojects", async (req: Request, res: Response) => {
    try {
      const employeeProjectData = insertEmployeeProjectSchema.parse(req.body);
      const employeeProject =
          await storage.createEmployeeProject(employeeProjectData);
      res.status(201).json({ status: "success", data: employeeProject });
    } catch (error: any) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res
            .status(400)
            .json({ status: "error", message: validationError.message });
      }

      // Обработка ошибки дублирования
      if (error.code === "23505") {
        return res.status(400).json({
          status: "error",
          message: "Сотрудник уже добавлен в этот проект",
        });
      }

      console.error("Error creating employee project:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to create employee project",
      });
    }
  });

  app.put(
      "/api/employeeprojects/:employeeId/:projectId",
      async (req: Request, res: Response) => {
        try {
          const employeeId = parseInt(req.params.employeeId);
          const projectId = parseInt(req.params.projectId);

          if (isNaN(employeeId) || isNaN(projectId)) {
            return res.status(400).json({
              status: "error",
              message: "Invalid employee or project ID",
            });
          }

          const employeeProjectData = req.body;
          const currentRoleId = req.body.current_role_id;

          console.log("PUT /api/employeeprojects - данные запроса:", {
            employeeId,
            projectId,
            currentRoleId,
            employeeProjectData
          });

          const updatedEmployeeProject = await storage.updateEmployeeProject(
              employeeId,
              projectId,
              employeeProjectData,
              currentRoleId,
          );

          if (!updatedEmployeeProject) {
            return res
                .status(404)
                .json({ status: "error", message: "Employee project not found " });
          }

          res.json({ status: "success", data: updatedEmployeeProject });
        } catch (error) {
          console.error("Error updating employee project:", error);
          res.status(500).json({
            status: "error",
            message: "Failed to update employee project",
          });
        }
      },
  );

  app.delete(
      "/api/employeeprojects/:employeeId/:projectId",
      async (req: Request, res: Response) => {
        try {
          const employeeId = parseInt(req.params.employeeId);
          const projectId = parseInt(req.params.projectId);

          if (isNaN(employeeId) || isNaN(projectId)) {
            return res.status(400).json({
              status: "error",
              message: "Invalid employee or project ID",
            });
          }

          const deleted = await storage.deleteEmployeeProject(
              employeeId,
              projectId,
          );
          if (!deleted) {
            return res
                .status(404)
                .json({ status: "error", message: "Employee project not found 2" });
          }

          res.json({
            status: "success",
            message: "Employee project deleted successfully",
          });
        } catch (error) {
          console.error("Error deleting employee project:", error);
          res.status(500).json({
            status: "error",
            message: "Failed to delete employee project",
          });
        }
      },
  );

  // Leaves endpoints
  app.get("/api/leaves", async (req: Request, res: Response) => {
    try {
      const leaves = await storage.getAllLeaves();
      res.json({ status: "success", data: leaves });
    } catch (error) {
      console.error("Error fetching leaves:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to fetch leaves" });
    }
  });

  app.get("/api/leaves/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: "error", message: "Invalid leave ID" });
      }

      const leave = await storage.getLeave(id);
      if (!leave) {
        return res
            .status(404)
            .json({ status: "error", message: "Leave not found" });
      }

      res.json({ status: "success", data: leave });
    } catch (error) {
      console.error("Error fetching leave:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to fetch leave" });
    }
  });

  app.get(
      "/api/leaves/employee/:employeeId",
      async (req: Request, res: Response) => {
        try {
          const employeeId = parseInt(req.params.employeeId);
          if (isNaN(employeeId)) {
            return res
                .status(400)
                .json({ status: "error", message: "Invalid employee ID" });
          }

          const leaves = await storage.getLeavesByEmployee(employeeId);
          res.json({ status: "success", data: leaves });
        } catch (error) {
          console.error("Error fetching leaves:", error);
          res
              .status(500)
              .json({ status: "error", message: "Failed to fetch leaves" });
        }
      },
  );

  app.post("/api/leaves", async (req: Request, res: Response) => {
    try {
      const leaveData = insertLeaveSchema.parse(req.body);
      const leave = await storage.createLeave(leaveData);
      res.status(201).json({ status: "success", data: leave });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res
            .status(400)
            .json({ status: "error", message: validationError.message });
      }

      console.error("Error creating leave:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to create leave" });
    }
  });

  app.put("/api/leaves/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: "error", message: "Invalid leave ID" });
      }

      const leaveData = req.body;
      const updatedLeave = await storage.updateLeave(id, leaveData);

      if (!updatedLeave) {
        return res
            .status(404)
            .json({ status: "error", message: "Leave not found" });
      }

      res.json({ status: "success", data: updatedLeave });
    } catch (error) {
      console.error("Error updating leave:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to update leave" });
    }
  });

  app.delete("/api/leaves/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: "error", message: "Invalid leave ID" });
      }

      const deleted = await storage.deleteLeave(id);
      if (!deleted) {
        return res
            .status(404)
            .json({ status: "error", message: "Leave not found" });
      }

      res.json({ status: "success", message: "Leave deleted successfully" });
    } catch (error) {
      console.error("Error deleting leave:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to delete leave" });
    }
  });

  // Эндпоинты для настроек (Settings)
  app.get("/api/settings", async (req: Request, res: Response) => {
    try {
      const settings = await storage.getAllSettings();
      res.json({ status: "success", data: settings });
    } catch (error) {
      console.error("Error fetching settings:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to fetch settings" });
    }
  });

  app.get("/api/settings/:key", async (req: Request, res: Response) => {
    try {
      const key = req.params.key;
      const setting = await storage.getSetting(key);

      if (!setting) {
        return res
            .status(404)
            .json({ status: "error", message: "Setting not found" });
      }

      res.json({ status: "success", data: setting });
    } catch (error) {
      console.error("Error fetching setting:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to fetch setting" });
    }
  });

  app.post("/api/settings", async (req: Request, res: Response) => {
    try {
      const { key, value } = req.body;

      if (!key || typeof value === "undefined") {
        return res
            .status(400)
            .json({ status: "error", message: "Key and value are required" });
      }

      const setting = await storage.createOrUpdateSetting(key, value);
      res.status(200).json({ status: "success", data: setting });
    } catch (error) {
      console.error("Error updating setting:", error);
      res
          .status(500)
          .json({ status: "error", message: "Failed to update setting" });
    }
  });

  // Роли проектов
  app.get("/api/project-roles", async (req: Request, res: Response) => {
    try {
      const roles = await storage.getAllProjectRoles();
      res.json({ status: "success", data: roles });
    } catch (error) {
      console.error("Error fetching project roles:", error);
      res.status(500).json({
        status: "error",
        message: "Ошибка при получении ролей проектов",
      });
    }
  });

  app.get("/api/project-roles/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const role = await storage.getProjectRole(id);
      if (!role) {
        return res
            .status(404)
            .json({ status: "error", message: "Роль не найдена" });
      }
      res.json({ status: "success", data: role });
    } catch (error) {
      console.error("Error fetching project role:", error);
      res.status(500).json({
        status: "error",
        message: "Ошибка при получении роли проекта",
      });
    }
  });

  app.post("/api/project-roles", async (req: Request, res: Response) => {
    try {
      const roleData = req.body;
      const role = await storage.createProjectRole(roleData);
      res.json({ status: "success", data: role });
    } catch (error) {
      console.error("Error creating project role:", error);
      res
          .status(500)
          .json({ status: "error", message: "Ошибка при создании роли проекта" });
    }
  });

  app.put("/api/project-roles/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const roleData = req.body;
      const role = await storage.updateProjectRole(id, roleData);
      if (!role) {
        return res
            .status(404)
            .json({ status: "error", message: "Роль не найдена" });
      }
      res.json({ status: "success", data: role });
    } catch (error) {
      console.error("Error updating project role:", error);
      res.status(500).json({
        status: "error",
        message: "Ошибка при обновлении роли проекта",
      });
    }
  });

  app.delete("/api/project-roles/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProjectRole(id);
      if (!success) {
        return res
            .status(404)
            .json({ status: "error", message: "Роль не найдена" });
      }
      res.json({ status: "success", message: "Роль удалена" });
    } catch (error) {
      console.error("Error deleting project role:", error);
      res
          .status(500)
          .json({ status: "error", message: "Ошибка при удалении роли проекта" });
    }
  });

  app.get('/api/project_roles', async (req: Request, res: Response) => {
    try {
      const roles = await storage.getProjectsRoles();
      res.json({ status: 'success', data: roles.map(role => role.role_name) });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch roles' });
    }
  });

  app.post('/api/project_roles', async (req: Request, res: Response) => {
    try {
      const roleData = insertRoleSchema.parse(req.body);
      const role = await storage.createProjectsRole(roleData);
      res.status(201).json({ status: 'success', data: role });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ status: 'error', message: validationError.message });
      }

      console.error('Error creating leave:', error);
      res.status(500).json({ status: 'error', message: 'Failed to create leave' });
    }
  });

  // API endpoints для организационных единиц
  app.get('/api/org-units', async (req: Request, res: Response) => {
    try {
      const orgUnits = await storage.getOrgUnits();
      res.json({ status: 'success', data: orgUnits });
    } catch (error) {
      console.error('Error fetching org units:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch org units' });
    }
  });

  app.get('/api/org-units/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid org unit ID' });
      }

      const orgUnit = await storage.getOrgUnit(id);
      if (!orgUnit) {
        return res.status(404).json({ status: 'error', message: 'Org unit not found' });
      }

      res.json({ status: 'success', data: orgUnit });
    } catch (error) {
      console.error('Error fetching org unit:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch org unit' });
    }
  });

  app.post('/api/org-units', async (req: Request, res: Response) => {
    try {
      const orgUnitData = req.body;
      const orgUnit = await storage.createOrgUnit(orgUnitData);
      res.status(201).json({ status: 'success', data: orgUnit });
    } catch (error) {
      console.error('Error creating org unit:', error);
      res.status(500).json({ status: 'error', message: 'Failed to create org unit' });
    }
  });

  app.put('/api/org-units/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid org unit ID' });
      }

      const orgUnitData = req.body;
      const orgUnit = await storage.updateOrgUnit(id, orgUnitData);
      if (!orgUnit) {
        return res.status(404).json({ status: 'error', message: 'Org unit not found' });
      }

      res.json({ status: 'success', data: orgUnit });
    } catch (error) {
      console.error('Error updating org unit:', error);
      res.status(500).json({ status: 'error', message: 'Failed to update org unit' });
    }
  });

  app.delete('/api/org-units/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid org unit ID' });
      }

      const success = await storage.deleteOrgUnit(id);
      if (!success) {
        return res.status(404).json({ status: 'error', message: 'Org unit not found' });
      }

      res.json({ status: 'success', message: 'Org unit deleted' });
    } catch (error) {
      console.error('Error deleting org unit:', error);
      res.status(500).json({ status: 'error', message: 'Failed to delete org unit' });
    }
  });

  // API endpoints для назначений сотрудников
  app.get('/api/employee-org-assignments', async (req: Request, res: Response) => {
    try {
      const assignments = await storage.getEmployeeOrgAssignments();
      res.json({ status: 'success', data: assignments });
    } catch (error) {
      console.error('Error fetching assignments:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch assignments' });
    }
  });

  app.post('/api/employee-org-assignments', async (req: Request, res: Response) => {
    try {
      const assignmentData = req.body;
      const assignment = await storage.createEmployeeOrgAssignment(assignmentData);
      res.status(201).json({ status: 'success', data: assignment });
    } catch (error) {
      console.error('Error creating assignment:', error);
      res.status(500).json({ status: 'error', message: 'Failed to create assignment' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
