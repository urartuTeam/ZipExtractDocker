var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual, createHash } from "crypto";
import { promisify } from "util";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  departments: () => departments,
  departmentsRelations: () => departmentsRelations,
  employeeprojects: () => employeeprojects,
  employeeprojectsRelations: () => employeeprojectsRelations,
  employees: () => employees,
  employeesRelations: () => employeesRelations,
  insertDepartmentSchema: () => insertDepartmentSchema,
  insertEmployeeProjectSchema: () => insertEmployeeProjectSchema,
  insertEmployeeSchema: () => insertEmployeeSchema,
  insertLeaveSchema: () => insertLeaveSchema,
  insertPositionDepartmentSchema: () => insertPositionDepartmentSchema,
  insertPositionSchema: () => insertPositionSchema,
  insertProjectSchema: () => insertProjectSchema,
  insertUserSchema: () => insertUserSchema,
  leaves: () => leaves,
  leavesRelations: () => leavesRelations,
  position_department: () => position_department,
  position_departmentRelations: () => position_departmentRelations,
  positions: () => positions,
  positionsRelations: () => positionsRelations,
  projects: () => projects,
  projectsRelations: () => projectsRelations,
  users: () => users
});
import { pgTable, text, serial, integer, timestamp, date, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  created_at: timestamp("created_at").defaultNow()
});
var departments = pgTable("departments", {
  department_id: serial("department_id").primaryKey(),
  name: text("name").notNull(),
  parent_department_id: integer("parent_department_id")
});
var positions = pgTable("positions", {
  position_id: serial("position_id").primaryKey(),
  name: text("name").notNull(),
  department_id: integer("department_id").references(() => departments.department_id),
  staff_units: integer("staff_units").default(0),
  current_count: integer("current_count").default(0),
  vacancies: integer("vacancies").default(0)
});
var position_department = pgTable("position_department", {
  position_link_id: serial("position_link_id").primaryKey(),
  position_id: integer("position_id").references(() => positions.position_id),
  department_id: integer("department_id").references(() => departments.department_id),
  sort: integer("sort").default(0)
});
var employees = pgTable("employees", {
  employee_id: serial("employee_id").primaryKey(),
  full_name: text("full_name").notNull(),
  position_id: integer("position_id").references(() => positions.position_id),
  phone: text("phone"),
  email: text("email"),
  manager_id: integer("manager_id"),
  department_id: integer("department_id").references(() => departments.department_id)
});
var projects = pgTable("projects", {
  project_id: serial("project_id").primaryKey(),
  name: text("name").notNull(),
  department_id: integer("department_id").references(() => departments.department_id)
});
var employeeprojects = pgTable("employeeprojects", {
  employee_id: integer("employee_id").references(() => employees.employee_id),
  project_id: integer("project_id").references(() => projects.project_id),
  role: text("role").notNull()
}, (table) => ({
  pk: primaryKey({ columns: [table.employee_id, table.project_id] })
}));
var leaves = pgTable("leaves", {
  leave_id: serial("leave_id").primaryKey(),
  employee_id: integer("employee_id").references(() => employees.employee_id),
  start_date: date("start_date").notNull(),
  end_date: date("end_date"),
  type: text("type").notNull()
});
var departmentsRelations = relations(departments, ({ one, many }) => ({
  parentDepartment: one(departments, {
    fields: [departments.parent_department_id],
    references: [departments.department_id],
    relationName: "parent_department"
  }),
  childDepartments: many(departments, { relationName: "parent_department" }),
  positions: many(position_department, { relationName: "department_positions" }),
  employees: many(employees),
  projects: many(projects)
}));
var positionsRelations = relations(positions, ({ many }) => ({
  departments: many(position_department, { relationName: "position_departments" }),
  employees: many(employees)
}));
var position_departmentRelations = relations(position_department, ({ one }) => ({
  position: one(positions, {
    fields: [position_department.position_id],
    references: [positions.position_id],
    relationName: "position_departments"
  }),
  department: one(departments, {
    fields: [position_department.department_id],
    references: [departments.department_id],
    relationName: "department_positions"
  })
}));
var employeesRelations = relations(employees, ({ one, many }) => ({
  position: one(positions, {
    fields: [employees.position_id],
    references: [positions.position_id]
  }),
  department: one(departments, {
    fields: [employees.department_id],
    references: [departments.department_id]
  }),
  manager: one(employees, {
    fields: [employees.manager_id],
    references: [employees.employee_id],
    relationName: "manager_employee"
  }),
  subordinates: many(employees, { relationName: "manager_employee" }),
  leaves: many(leaves),
  projects: many(employeeprojects)
}));
var projectsRelations = relations(projects, ({ one, many }) => ({
  department: one(departments, {
    fields: [projects.department_id],
    references: [departments.department_id]
  }),
  employees: many(employeeprojects)
}));
var employeeprojectsRelations = relations(employeeprojects, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeprojects.employee_id],
    references: [employees.employee_id]
  }),
  project: one(projects, {
    fields: [employeeprojects.project_id],
    references: [projects.project_id]
  })
}));
var leavesRelations = relations(leaves, ({ one }) => ({
  employee: one(employees, {
    fields: [leaves.employee_id],
    references: [employees.employee_id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true
});
var insertDepartmentSchema = createInsertSchema(departments).omit({
  department_id: true
});
var insertPositionSchema = createInsertSchema(positions).omit({
  position_id: true
});
var insertPositionDepartmentSchema = createInsertSchema(position_department).omit({
  position_link_id: true
});
var insertEmployeeSchema = createInsertSchema(employees).omit({
  employee_id: true
});
var insertProjectSchema = createInsertSchema(projects).omit({
  project_id: true
});
var insertEmployeeProjectSchema = createInsertSchema(employeeprojects);
var insertLeaveSchema = createInsertSchema(leaves).omit({
  leave_id: true
});

// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/pg-pool";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, and } from "drizzle-orm";
var DatabaseStorage = class {
  // Методы для работы с пользователями
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async getAllUsers() {
    return await db.select().from(users);
  }
  async updateUser(id, userData) {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  async deleteUser(id) {
    const [deleted] = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
    return !!deleted;
  }
  // Методы для работы с отделами
  async getDepartment(id) {
    const [department] = await db.select().from(departments).where(eq(departments.department_id, id));
    return department || void 0;
  }
  async getAllDepartments() {
    return await db.select().from(departments);
  }
  async createDepartment(insertDepartment) {
    const [department] = await db.insert(departments).values(insertDepartment).returning();
    return department;
  }
  async updateDepartment(id, departmentData) {
    const [department] = await db.update(departments).set(departmentData).where(eq(departments.department_id, id)).returning();
    return department || void 0;
  }
  async deleteDepartment(id) {
    const [deleted] = await db.delete(departments).where(eq(departments.department_id, id)).returning({ id: departments.department_id });
    return !!deleted;
  }
  // Методы для работы с должностями
  async getPosition(id) {
    const [position] = await db.select().from(positions).where(eq(positions.position_id, id));
    return position || void 0;
  }
  async getAllPositions() {
    return await db.select().from(positions);
  }
  async createPosition(insertPosition) {
    const [position] = await db.insert(positions).values(insertPosition).returning();
    return position;
  }
  async updatePosition(id, positionData) {
    const [position] = await db.update(positions).set(positionData).where(eq(positions.position_id, id)).returning();
    return position || void 0;
  }
  async deletePosition(id) {
    const [deleted] = await db.delete(positions).where(eq(positions.position_id, id)).returning({ id: positions.position_id });
    return !!deleted;
  }
  // Методы для работы со связью должностей и отделов
  async getPositionDepartment(id) {
    const [positionDepartment] = await db.select().from(position_department).where(eq(position_department.position_link_id, id));
    return positionDepartment || void 0;
  }
  async getAllPositionDepartments() {
    return await db.select().from(position_department);
  }
  async createPositionDepartment(insertPositionDepartment) {
    const [positionDepartment] = await db.insert(position_department).values(insertPositionDepartment).returning();
    return positionDepartment;
  }
  async updatePositionDepartment(id, positionDepartmentData) {
    const [positionDepartment] = await db.update(position_department).set(positionDepartmentData).where(eq(position_department.position_link_id, id)).returning();
    return positionDepartment || void 0;
  }
  async deletePositionDepartment(id) {
    const [deleted] = await db.delete(position_department).where(eq(position_department.position_link_id, id)).returning({ id: position_department.position_link_id });
    return !!deleted;
  }
  // Методы для работы с сотрудниками
  async getEmployee(id) {
    const [employee] = await db.select().from(employees).where(eq(employees.employee_id, id));
    return employee || void 0;
  }
  async getAllEmployees() {
    return await db.select().from(employees);
  }
  async createEmployee(insertEmployee) {
    const [employee] = await db.insert(employees).values(insertEmployee).returning();
    return employee;
  }
  async updateEmployee(id, employeeData) {
    const [employee] = await db.update(employees).set(employeeData).where(eq(employees.employee_id, id)).returning();
    return employee || void 0;
  }
  async deleteEmployee(id) {
    const [deleted] = await db.delete(employees).where(eq(employees.employee_id, id)).returning({ id: employees.employee_id });
    return !!deleted;
  }
  // Методы для работы с проектами
  async getProject(id) {
    const [project] = await db.select().from(projects).where(eq(projects.project_id, id));
    return project || void 0;
  }
  async getAllProjects() {
    return await db.select().from(projects);
  }
  async createProject(insertProject) {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }
  async updateProject(id, projectData) {
    const [project] = await db.update(projects).set(projectData).where(eq(projects.project_id, id)).returning();
    return project || void 0;
  }
  async deleteProject(id) {
    const [deleted] = await db.delete(projects).where(eq(projects.project_id, id)).returning({ id: projects.project_id });
    return !!deleted;
  }
  // Методы для работы со связью сотрудников и проектов
  async getEmployeeProject(employeeId, projectId) {
    const [employeeProject] = await db.select().from(employeeprojects).where(
      and(
        eq(employeeprojects.employee_id, employeeId),
        eq(employeeprojects.project_id, projectId)
      )
    );
    return employeeProject || void 0;
  }
  async getAllEmployeeProjects() {
    return await db.select().from(employeeprojects);
  }
  async getEmployeeProjectsByEmployee(employeeId) {
    return await db.select().from(employeeprojects).where(eq(employeeprojects.employee_id, employeeId));
  }
  async getEmployeeProjectsByProject(projectId) {
    return await db.select().from(employeeprojects).where(eq(employeeprojects.project_id, projectId));
  }
  async createEmployeeProject(insertEmployeeProject) {
    const [employeeProject] = await db.insert(employeeprojects).values(insertEmployeeProject).returning();
    return employeeProject;
  }
  async updateEmployeeProject(employeeId, projectId, employeeProjectData) {
    const [employeeProject] = await db.update(employeeprojects).set(employeeProjectData).where(
      and(
        eq(employeeprojects.employee_id, employeeId),
        eq(employeeprojects.project_id, projectId)
      )
    ).returning();
    return employeeProject || void 0;
  }
  async deleteEmployeeProject(employeeId, projectId) {
    const [deleted] = await db.delete(employeeprojects).where(
      and(
        eq(employeeprojects.employee_id, employeeId),
        eq(employeeprojects.project_id, projectId)
      )
    ).returning();
    return !!deleted;
  }
  // Методы для работы с отпусками
  async getLeave(id) {
    const [leave] = await db.select().from(leaves).where(eq(leaves.leave_id, id));
    return leave || void 0;
  }
  async getAllLeaves() {
    return await db.select().from(leaves);
  }
  async getLeavesByEmployee(employeeId) {
    return await db.select().from(leaves).where(eq(leaves.employee_id, employeeId));
  }
  async createLeave(insertLeave) {
    const [leave] = await db.insert(leaves).values(insertLeave).returning();
    return leave;
  }
  async updateLeave(id, leaveData) {
    const [leave] = await db.update(leaves).set(leaveData).where(eq(leaves.leave_id, id)).returning();
    return leave || void 0;
  }
  async deleteLeave(id) {
    const [deleted] = await db.delete(leaves).where(eq(leaves.leave_id, id)).returning({ id: leaves.leave_id });
    return !!deleted;
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import createMemoryStore from "memorystore";
var MemoryStore = createMemoryStore(session);
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  if (stored.includes(".")) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = await scryptAsync(supplied, salt, 64);
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } else {
    const hashedPassword = createHash("sha256").update(supplied).digest("hex");
    return hashedPassword === stored;
  }
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 864e5
      // очищать устаревшие сессии каждые 24 часа
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1e3
      // 24 часа
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({
          status: "error",
          message: "\u041D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E \u0443\u043A\u0430\u0437\u0430\u0442\u044C \u0438\u043C\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F, email \u0438 \u043F\u0430\u0440\u043E\u043B\u044C"
        });
      }
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          status: "error",
          message: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0441 \u0442\u0430\u043A\u0438\u043C \u0438\u043C\u0435\u043D\u0435\u043C \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442"
        });
      }
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword
      });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({ status: "success", data: user });
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({
        status: "error",
        message: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F"
      });
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0438\u043C\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u0438\u043B\u0438 \u043F\u0430\u0440\u043E\u043B\u044C"
        });
      }
      req.login(user, (err2) => {
        if (err2) return next(err2);
        res.json({ status: "success", data: user });
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ status: "success", message: "\u0412\u044B \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0432\u044B\u0448\u043B\u0438 \u0438\u0437 \u0441\u0438\u0441\u0442\u0435\u043C\u044B" });
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        status: "error",
        message: "\u041D\u0435 \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u043E\u0432\u0430\u043D"
      });
    }
    res.json({ status: "success", data: req.user });
  });
  app2.use("/api/protected", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        status: "error",
        message: "\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044F"
      });
    }
    next();
  });
}

// server/routes.ts
import { createServer } from "http";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
async function registerRoutes(app2) {
  setupAuth(app2);
  const apiRouter = app2.route("/api");
  app2.get("/api/users", async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      res.json({ status: "success", data: users2 });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ status: "error", message: "Failed to fetch users" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid user ID" });
      }
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ status: "error", message: "User not found" });
      }
      res.json({ status: "success", data: user });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ status: "error", message: "Failed to fetch user" });
    }
  });
  app2.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ status: "error", message: "Username already exists" });
      }
      const user = await storage.createUser(userData);
      res.status(201).json({ status: "success", data: user });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ status: "error", message: validationError.message });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ status: "error", message: "Failed to create user" });
    }
  });
  app2.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid user ID" });
      }
      const userData = req.body;
      const updatedUser = await storage.updateUser(id, userData);
      if (!updatedUser) {
        return res.status(404).json({ status: "error", message: "User not found" });
      }
      res.json({ status: "success", data: updatedUser });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ status: "error", message: "Failed to update user" });
    }
  });
  app2.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid user ID" });
      }
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ status: "error", message: "User not found" });
      }
      res.json({ status: "success", message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ status: "error", message: "Failed to delete user" });
    }
  });
  app2.get("/api/departments", async (req, res) => {
    try {
      const departments2 = await storage.getAllDepartments();
      res.json({ status: "success", data: departments2 });
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ status: "error", message: "Failed to fetch departments" });
    }
  });
  app2.get("/api/departments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid department ID" });
      }
      const department = await storage.getDepartment(id);
      if (!department) {
        return res.status(404).json({ status: "error", message: "Department not found" });
      }
      res.json({ status: "success", data: department });
    } catch (error) {
      console.error("Error fetching department:", error);
      res.status(500).json({ status: "error", message: "Failed to fetch department" });
    }
  });
  app2.post("/api/departments", async (req, res) => {
    try {
      const departmentData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(departmentData);
      res.status(201).json({ status: "success", data: department });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ status: "error", message: validationError.message });
      }
      console.error("Error creating department:", error);
      res.status(500).json({ status: "error", message: "Failed to create department" });
    }
  });
  app2.put("/api/departments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid department ID" });
      }
      const departmentData = req.body;
      const updatedDepartment = await storage.updateDepartment(id, departmentData);
      if (!updatedDepartment) {
        return res.status(404).json({ status: "error", message: "Department not found" });
      }
      res.json({ status: "success", data: updatedDepartment });
    } catch (error) {
      console.error("Error updating department:", error);
      res.status(500).json({ status: "error", message: "Failed to update department" });
    }
  });
  app2.delete("/api/departments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid department ID" });
      }
      const deleted = await storage.deleteDepartment(id);
      if (!deleted) {
        return res.status(404).json({ status: "error", message: "Department not found" });
      }
      res.json({ status: "success", message: "Department deleted successfully" });
    } catch (error) {
      console.error("Error deleting department:", error);
      res.status(500).json({ status: "error", message: "Failed to delete department" });
    }
  });
  app2.get("/api/positions", async (req, res) => {
    try {
      const positions2 = await storage.getAllPositions();
      res.json({ status: "success", data: positions2 });
    } catch (error) {
      console.error("Error fetching positions:", error);
      res.status(500).json({ status: "error", message: "Failed to fetch positions" });
    }
  });
  app2.get("/api/positions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid position ID" });
      }
      const position = await storage.getPosition(id);
      if (!position) {
        return res.status(404).json({ status: "error", message: "Position not found" });
      }
      res.json({ status: "success", data: position });
    } catch (error) {
      console.error("Error fetching position:", error);
      res.status(500).json({ status: "error", message: "Failed to fetch position" });
    }
  });
  app2.post("/api/positions", async (req, res) => {
    try {
      const positionData = insertPositionSchema.parse(req.body);
      const position = await storage.createPosition(positionData);
      res.status(201).json({ status: "success", data: position });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ status: "error", message: validationError.message });
      }
      console.error("Error creating position:", error);
      res.status(500).json({ status: "error", message: "Failed to create position" });
    }
  });
  app2.put("/api/positions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid position ID" });
      }
      const positionData = req.body;
      const updatedPosition = await storage.updatePosition(id, positionData);
      if (!updatedPosition) {
        return res.status(404).json({ status: "error", message: "Position not found" });
      }
      res.json({ status: "success", data: updatedPosition });
    } catch (error) {
      console.error("Error updating position:", error);
      res.status(500).json({ status: "error", message: "Failed to update position" });
    }
  });
  app2.delete("/api/positions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid position ID" });
      }
      const deleted = await storage.deletePosition(id);
      if (!deleted) {
        return res.status(404).json({ status: "error", message: "Position not found" });
      }
      res.json({ status: "success", message: "Position deleted successfully" });
    } catch (error) {
      console.error("Error deleting position:", error);
      res.status(500).json({ status: "error", message: "Failed to delete position" });
    }
  });
  app2.get("/api/employees", async (req, res) => {
    try {
      const employees2 = await storage.getAllEmployees();
      res.json({ status: "success", data: employees2 });
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ status: "error", message: "Failed to fetch employees" });
    }
  });
  app2.get("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid employee ID" });
      }
      const employee = await storage.getEmployee(id);
      if (!employee) {
        return res.status(404).json({ status: "error", message: "Employee not found" });
      }
      res.json({ status: "success", data: employee });
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ status: "error", message: "Failed to fetch employee" });
    }
  });
  app2.post("/api/employees", async (req, res) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(employeeData);
      res.status(201).json({ status: "success", data: employee });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ status: "error", message: validationError.message });
      }
      console.error("Error creating employee:", error);
      res.status(500).json({ status: "error", message: "Failed to create employee" });
    }
  });
  app2.put("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid employee ID" });
      }
      const employeeData = req.body;
      const updatedEmployee = await storage.updateEmployee(id, employeeData);
      if (!updatedEmployee) {
        return res.status(404).json({ status: "error", message: "Employee not found" });
      }
      res.json({ status: "success", data: updatedEmployee });
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ status: "error", message: "Failed to update employee" });
    }
  });
  app2.delete("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid employee ID" });
      }
      const deleted = await storage.deleteEmployee(id);
      if (!deleted) {
        return res.status(404).json({ status: "error", message: "Employee not found" });
      }
      res.json({ status: "success", message: "Employee deleted successfully" });
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ status: "error", message: "Failed to delete employee" });
    }
  });
  app2.get("/api/projects", async (req, res) => {
    try {
      const projects2 = await storage.getAllProjects();
      res.json({ status: "success", data: projects2 });
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ status: "error", message: "Failed to fetch projects" });
    }
  });
  app2.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid project ID" });
      }
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ status: "error", message: "Project not found" });
      }
      res.json({ status: "success", data: project });
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ status: "error", message: "Failed to fetch project" });
    }
  });
  app2.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json({ status: "success", data: project });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ status: "error", message: validationError.message });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ status: "error", message: "Failed to create project" });
    }
  });
  app2.put("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid project ID" });
      }
      const projectData = req.body;
      const updatedProject = await storage.updateProject(id, projectData);
      if (!updatedProject) {
        return res.status(404).json({ status: "error", message: "Project not found" });
      }
      res.json({ status: "success", data: updatedProject });
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ status: "error", message: "Failed to update project" });
    }
  });
  app2.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid project ID" });
      }
      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res.status(404).json({ status: "error", message: "Project not found" });
      }
      res.json({ status: "success", message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ status: "error", message: "Failed to delete project" });
    }
  });
  app2.get("/api/employeeprojects", async (req, res) => {
    try {
      const employeeProjects = await storage.getAllEmployeeProjects();
      res.json({ status: "success", data: employeeProjects });
    } catch (error) {
      console.error("Error fetching employee projects:", error);
      res.status(500).json({ status: "error", message: "Failed to fetch employee projects" });
    }
  });
  app2.get("/api/employeeprojects/employee/:employeeId", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      if (isNaN(employeeId)) {
        return res.status(400).json({ status: "error", message: "Invalid employee ID" });
      }
      const employeeProjects = await storage.getEmployeeProjectsByEmployee(employeeId);
      res.json({ status: "success", data: employeeProjects });
    } catch (error) {
      console.error("Error fetching employee projects:", error);
      res.status(500).json({ status: "error", message: "Failed to fetch employee projects" });
    }
  });
  app2.get("/api/employeeprojects/project/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ status: "error", message: "Invalid project ID" });
      }
      const employeeProjects = await storage.getEmployeeProjectsByProject(projectId);
      res.json({ status: "success", data: employeeProjects });
    } catch (error) {
      console.error("Error fetching employee projects:", error);
      res.status(500).json({ status: "error", message: "Failed to fetch employee projects" });
    }
  });
  app2.post("/api/employeeprojects", async (req, res) => {
    try {
      const employeeProjectData = insertEmployeeProjectSchema.parse(req.body);
      const employeeProject = await storage.createEmployeeProject(employeeProjectData);
      res.status(201).json({ status: "success", data: employeeProject });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ status: "error", message: validationError.message });
      }
      console.error("Error creating employee project:", error);
      res.status(500).json({ status: "error", message: "Failed to create employee project" });
    }
  });
  app2.put("/api/employeeprojects/:employeeId/:projectId", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const projectId = parseInt(req.params.projectId);
      if (isNaN(employeeId) || isNaN(projectId)) {
        return res.status(400).json({ status: "error", message: "Invalid employee or project ID" });
      }
      const employeeProjectData = req.body;
      const updatedEmployeeProject = await storage.updateEmployeeProject(employeeId, projectId, employeeProjectData);
      if (!updatedEmployeeProject) {
        return res.status(404).json({ status: "error", message: "Employee project not found" });
      }
      res.json({ status: "success", data: updatedEmployeeProject });
    } catch (error) {
      console.error("Error updating employee project:", error);
      res.status(500).json({ status: "error", message: "Failed to update employee project" });
    }
  });
  app2.delete("/api/employeeprojects/:employeeId/:projectId", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const projectId = parseInt(req.params.projectId);
      if (isNaN(employeeId) || isNaN(projectId)) {
        return res.status(400).json({ status: "error", message: "Invalid employee or project ID" });
      }
      const deleted = await storage.deleteEmployeeProject(employeeId, projectId);
      if (!deleted) {
        return res.status(404).json({ status: "error", message: "Employee project not found" });
      }
      res.json({ status: "success", message: "Employee project deleted successfully" });
    } catch (error) {
      console.error("Error deleting employee project:", error);
      res.status(500).json({ status: "error", message: "Failed to delete employee project" });
    }
  });
  app2.get("/api/leaves", async (req, res) => {
    try {
      const leaves2 = await storage.getAllLeaves();
      res.json({ status: "success", data: leaves2 });
    } catch (error) {
      console.error("Error fetching leaves:", error);
      res.status(500).json({ status: "error", message: "Failed to fetch leaves" });
    }
  });
  app2.get("/api/leaves/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid leave ID" });
      }
      const leave = await storage.getLeave(id);
      if (!leave) {
        return res.status(404).json({ status: "error", message: "Leave not found" });
      }
      res.json({ status: "success", data: leave });
    } catch (error) {
      console.error("Error fetching leave:", error);
      res.status(500).json({ status: "error", message: "Failed to fetch leave" });
    }
  });
  app2.get("/api/leaves/employee/:employeeId", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      if (isNaN(employeeId)) {
        return res.status(400).json({ status: "error", message: "Invalid employee ID" });
      }
      const leaves2 = await storage.getLeavesByEmployee(employeeId);
      res.json({ status: "success", data: leaves2 });
    } catch (error) {
      console.error("Error fetching leaves:", error);
      res.status(500).json({ status: "error", message: "Failed to fetch leaves" });
    }
  });
  app2.post("/api/leaves", async (req, res) => {
    try {
      const leaveData = insertLeaveSchema.parse(req.body);
      const leave = await storage.createLeave(leaveData);
      res.status(201).json({ status: "success", data: leave });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ status: "error", message: validationError.message });
      }
      console.error("Error creating leave:", error);
      res.status(500).json({ status: "error", message: "Failed to create leave" });
    }
  });
  app2.put("/api/leaves/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid leave ID" });
      }
      const leaveData = req.body;
      const updatedLeave = await storage.updateLeave(id, leaveData);
      if (!updatedLeave) {
        return res.status(404).json({ status: "error", message: "Leave not found" });
      }
      res.json({ status: "success", data: updatedLeave });
    } catch (error) {
      console.error("Error updating leave:", error);
      res.status(500).json({ status: "error", message: "Failed to update leave" });
    }
  });
  app2.delete("/api/leaves/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid leave ID" });
      }
      const deleted = await storage.deleteLeave(id);
      if (!deleted) {
        return res.status(404).json({ status: "error", message: "Leave not found" });
      }
      res.json({ status: "success", message: "Leave deleted successfully" });
    } catch (error) {
      console.error("Error deleting leave:", error);
      res.status(500).json({ status: "error", message: "Failed to delete leave" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/client"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(process.cwd(), "dist/client");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  setupAuth(app);
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(err.stack);
    res.status(status).json({ status: "error", message });
  });
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
    log("Starting Vite development server...");
  } else {
    serveStatic(app);
    log("Serving static files in production mode");
  }
  const PORT = process.env.PORT || 5e3;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();
