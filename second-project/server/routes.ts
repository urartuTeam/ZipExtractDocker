import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertOrgUnitSchema,
  insertEmployeeSchema,
  insertProjectSchema,
  insertProjectRoleSchema,
  insertEmployeeProjectRoleSchema,
  entityTypes,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

  // Organization Units Routes
  apiRouter.get("/org-units", async (req: Request, res: Response) => {
    try {
      const orgUnits = await storage.getOrgUnits();
      res.json(orgUnits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch organization units" });
    }
  });

  apiRouter.get("/org-units/root", async (req: Request, res: Response) => {
    try {
      const rootUnits = await storage.getRootOrgUnits();
      res.json(rootUnits);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch root organization units" });
    }
  });

  apiRouter.get("/org-units/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const unit = await storage.getOrgUnit(id);
      if (!unit) {
        return res.status(404).json({ message: "Organization unit not found" });
      }

      res.json(unit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch organization unit" });
    }
  });

  apiRouter.get(
    "/org-units/:id/children",
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid ID format" });
        }

        const children = await storage.getChildOrgUnits(id);
        res.json(children);
      } catch (error) {
        res
          .status(500)
          .json({ message: "Failed to fetch child organization units" });
      }
    },
  );

  apiRouter.post("/org-units", async (req: Request, res: Response) => {
    try {
      const validatedData = insertOrgUnitSchema.parse(req.body);

      // Additional validation based on type
      if (
        validatedData.type === entityTypes.POSITION &&
        !validatedData.staffCount
      ) {
        validatedData.staffCount = 1; // Default value
      }

      const newUnit = await storage.createOrgUnit(validatedData);
      res.status(201).json(newUnit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: error.errors });
      }
      res
        .status(500)
        .json({
          message: error.message || "Failed to create organization unit",
        });
    }
  });

  apiRouter.put("/org-units/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const unit = await storage.getOrgUnit(id);
      if (!unit) {
        return res.status(404).json({ message: "Organization unit not found" });
      }

      const validatedData = insertOrgUnitSchema.partial().parse(req.body);

      if (validatedData.name && validatedData.type && validatedData.type_id) {
        await updateNameByTypeAndTypeId(
          validatedData.type,
          validatedData.type_id,
          validatedData.name,
        );
      }

      const { name, ...dataWithoutName } = validatedData;

      const updatedUnit = await storage.updateOrgUnit(id, dataWithoutName);
      res.json(updatedUnit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update organization unit" });
    }
  });

  // Функция обновления имени в нужной таблице по типу и type_id
  async function updateNameByTypeAndTypeId(
    type: string,
    typeId: number,
    name: string,
  ) {
    switch (type) {
      case "position":
        await storage.updatePositionName(typeId, name);
        break;
      case "organization":
        await storage.updateOrganizationName(typeId, name);
        break;
      case "management":
        await storage.updateDepartmentName(typeId, name, true);
        break;
      case "department":
        await storage.updateDepartmentName(typeId, name, false);
        break;
      default:
        throw new Error(`Unknown type ${type} for updating name`);
    }
  }

  apiRouter.delete("/org-units/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const unit = await storage.getOrgUnit(id);
      if (!unit) {
        return res.status(404).json({ message: "Organization unit not found" });
      }

      await storage.deleteOrgUnit(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete organization unit" });
    }
  });

  // Employee Routes
  apiRouter.get("/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: error, error: error.message });
    }
  });

  apiRouter.get("/employees/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const employee = await storage.getEmployee(id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  apiRouter.get(
    "/positions/:id/employees",
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid ID format" });
        }

        const employees = await storage.getEmployeesByPosition(id);
        res.json(employees);
      } catch (error) {
        res
          .status(500)
          .json({ message: "Failed to fetch employees by position" });
      }
    },
  );

  apiRouter.get(
    "/departments/:id/employees",
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid ID format" });
        }

        const employees = await storage.getEmployeesByDepartment(id);
        res.json(employees);
      } catch (error) {
        res
          .status(500)
          .json({ message: "Failed to fetch employees by department" });
      }
    },
  );

  apiRouter.post("/employees", async (req: Request, res: Response) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const newEmployee = await storage.createEmployee(validatedData);
      res.status(201).json(newEmployee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  apiRouter.put("/employees/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const employee = await storage.getEmployee(id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const validatedData = insertEmployeeSchema.partial().parse(req.body);
      const updatedEmployee = await storage.updateEmployee(id, validatedData);
      res.json(updatedEmployee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  apiRouter.delete("/employees/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const employee = await storage.getEmployee(id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      await storage.deleteEmployee(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Project Routes
  apiRouter.get("/projects", async (req: Request, res: Response) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  apiRouter.get("/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  apiRouter.post("/projects", async (req: Request, res: Response) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const newProject = await storage.createProject(validatedData);
      res.status(201).json(newProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  apiRouter.put("/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const validatedData = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(id, validatedData);
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  apiRouter.delete("/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      await storage.deleteProject(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Project Roles Routes
  apiRouter.get("/projects/:id/roles", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const roles = await storage.getProjectRoles(id);
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project roles" });
    }
  });

  apiRouter.post("/project-roles", async (req: Request, res: Response) => {
    try {
      const validatedData = insertProjectRoleSchema.parse(req.body);
      const newRole = await storage.createProjectRole(validatedData);
      res.status(201).json(newRole);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project role" });
    }
  });

  apiRouter.put("/project-roles/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const role = await storage.getProjectRole(id);
      if (!role) {
        return res.status(404).json({ message: "Project role not found" });
      }

      const validatedData = insertProjectRoleSchema.partial().parse(req.body);
      const updatedRole = await storage.updateProjectRole(id, validatedData);
      res.json(updatedRole);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update project role" });
    }
  });

  apiRouter.delete(
    "/project-roles/:id",
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid ID format" });
        }

        const role = await storage.getProjectRole(id);
        if (!role) {
          return res.status(404).json({ message: "Project role not found" });
        }

        await storage.deleteProjectRole(id);
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ message: "Failed to delete project role" });
      }
    },
  );

  // Employee Project Roles Routes
  apiRouter.get(
    "/project-roles/:id/employees",
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid ID format" });
        }

        const employees = await storage.getEmployeesByProjectRole(id);
        res.json(employees);
      } catch (error) {
        res
          .status(500)
          .json({ message: "Failed to fetch employees by project role" });
      }
    },
  );

  apiRouter.post(
    "/employee-project-roles",
    async (req: Request, res: Response) => {
      try {
        const validatedData = insertEmployeeProjectRoleSchema.parse(req.body);
        const newRole = await storage.addEmployeeToProjectRole(validatedData);
        res.status(201).json(newRole);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ message: "Validation error", errors: error.errors });
        }
        res
          .status(500)
          .json({ message: "Failed to assign employee to project role" });
      }
    },
  );

  apiRouter.delete(
    "/employee-project-roles",
    async (req: Request, res: Response) => {
      try {
        const { employeeId, projectRoleId } = req.body;

        if (!employeeId || !projectRoleId) {
          return res
            .status(400)
            .json({
              message: "Both employeeId and projectRoleId are required",
            });
        }

        await storage.removeEmployeeFromProjectRole(employeeId, projectRoleId);
        res.status(204).send();
      } catch (error) {
        res
          .status(500)
          .json({ message: "Failed to remove employee from project role" });
      }
    },
  );

  // Routes for individual tables
  apiRouter.get("/positions", async (req: Request, res: Response) => {
    try {
      const positions = await storage.getPositions();
      res.json(positions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch positions" });
    }
  });

  apiRouter.get("/departments", async (req: Request, res: Response) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  apiRouter.get("/organizations", async (req: Request, res: Response) => {
    try {
      const organizations = await storage.getOrganizations();
      res.json(organizations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch organizations" });
    }
  });

  apiRouter.get("/managements", async (req: Request, res: Response) => {
    try {
      const managements = await storage.getManagements();
      res.json(managements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch managements" });
    }
  });

  // Employee Positions (назначения сотрудников) routes
  apiRouter.get("/org-units/:id/employees", async (req: Request, res: Response) => {
    try {
      const orgUnitId = parseInt(req.params.id);
      const employees = await storage.getEmployeesByOrgUnit(orgUnitId);
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees for org unit:", error);
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  // Employee Positions Routes
  apiRouter.get("/employee-positions", async (req: Request, res: Response) => {
    try {
      const all = req.query.all === 'true';
      let assignments = await storage.getAllEmployeePositions();
      
      // Если all не указан или false, исключаем сотрудников, которые являются руководителями
      if (!all) {
        const headEmployeeIds = await storage.getHeadEmployeeIds();
        assignments = assignments.filter(assignment => 
          !headEmployeeIds.includes(assignment.employeeId)
        );
      }
      
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching employee positions:", error);
      res.status(500).json({ error: "Failed to fetch employee positions" });
    }
  });

  apiRouter.post("/employee-positions", async (req: Request, res: Response) => {
    try {
      const assignment = req.body;
      const result = await storage.assignEmployeeToOrgUnit(assignment);
      res.json(result);
    } catch (error) {
      console.error("Error assigning employee:", error);
      res.status(500).json({ error: "Failed to assign employee" });
    }
  });

  apiRouter.delete("/employee-positions/:employeeId/:orgUnitId", async (req: Request, res: Response) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const orgUnitId = parseInt(req.params.orgUnitId);
      const success = await storage.removeEmployeeFromOrgUnit(employeeId, orgUnitId);
      res.json({ success });
    } catch (error) {
      console.error("Error removing employee assignment:", error);
      res.status(500).json({ error: "Failed to remove assignment" });
    }
  });

  apiRouter.put("/employee-positions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const assignment = req.body;
      const result = await storage.updateEmployeeAssignment(id, assignment);
      res.json(result);
    } catch (error) {
      console.error("Error updating employee assignment:", error);
      res.status(500).json({ error: "Failed to update assignment" });
    }
  });

  // Register all API routes with the /api prefix
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
