import { pgTable, text, serial, integer, boolean, timestamp, date, primaryKey, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Пользователи
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Отделы
export const departments = pgTable("departments", {
  department_id: serial("department_id").primaryKey(),
  name: text("name").notNull(),
  parent_department_id: integer("parent_department_id"),
});

// Должности
export const positions = pgTable("positions", {
  position_id: serial("position_id").primaryKey(),
  name: text("name").notNull(),
  department_id: integer("department_id").references(() => departments.department_id),
  staff_units: integer("staff_units").default(0),
  current_count: integer("current_count").default(0),
  vacancies: integer("vacancies").default(0),
  parent_position_id: integer("parent_position_id").references(() => positions.position_id),
});

// Связь между должностями и отделами
export const position_department = pgTable("position_department", {
  position_link_id: serial("position_link_id").primaryKey(),
  position_id: integer("position_id").references(() => positions.position_id),
  department_id: integer("department_id").references(() => departments.department_id),
  sort: integer("sort").default(0),
});

// Сотрудники
export const employees = pgTable("employees", {
  employee_id: serial("employee_id").primaryKey(),
  full_name: text("full_name").notNull(),
  position_id: integer("position_id").references(() => positions.position_id),
  phone: text("phone"),
  email: text("email"),
  manager_id: integer("manager_id"),
  department_id: integer("department_id").references(() => departments.department_id),
});

// Проекты
export const projects = pgTable("projects", {
  project_id: serial("project_id").primaryKey(),
  name: text("name").notNull(),
  department_id: integer("department_id").references(() => departments.department_id),
});

// Связь сотрудников и проектов
export const employeeprojects = pgTable("employeeprojects", {
  employee_id: integer("employee_id").references(() => employees.employee_id),
  project_id: integer("project_id").references(() => projects.project_id),
  role: text("role").notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.employee_id, table.project_id] }),
}));

// Отпуска
export const leaves = pgTable("leaves", {
  leave_id: serial("leave_id").primaryKey(),
  employee_id: integer("employee_id").references(() => employees.employee_id),
  start_date: date("start_date").notNull(),
  end_date: date("end_date"),
  type: text("type").notNull(),
});

// Отношения
export const departmentsRelations = relations(departments, ({ one, many }) => ({
  parentDepartment: one(departments, {
    fields: [departments.parent_department_id],
    references: [departments.department_id],
    relationName: "parent_department"
  }),
  childDepartments: many(departments, { relationName: "parent_department" }),
  positions: many(position_department, { relationName: "department_positions" }),
  employees: many(employees),
  projects: many(projects),
}));

export const positionsRelations = relations(positions, ({ many, one }) => ({
  departments: many(position_department, { relationName: "position_departments" }),
  employees: many(employees),
  parentPosition: one(positions, {
    fields: [positions.parent_position_id],
    references: [positions.position_id],
    relationName: "parent_position"
  }),
  childPositions: many(positions, { relationName: "parent_position" }),
}));

export const position_departmentRelations = relations(position_department, ({ one }) => ({
  position: one(positions, {
    fields: [position_department.position_id],
    references: [positions.position_id],
    relationName: "position_departments"
  }),
  department: one(departments, {
    fields: [position_department.department_id],
    references: [departments.department_id],
    relationName: "department_positions"
  }),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  position: one(positions, {
    fields: [employees.position_id],
    references: [positions.position_id],
  }),
  department: one(departments, {
    fields: [employees.department_id],
    references: [departments.department_id],
  }),
  manager: one(employees, {
    fields: [employees.manager_id],
    references: [employees.employee_id],
    relationName: "manager_employee"
  }),
  subordinates: many(employees, { relationName: "manager_employee" }),
  leaves: many(leaves),
  projects: many(employeeprojects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  department: one(departments, {
    fields: [projects.department_id],
    references: [departments.department_id],
  }),
  employees: many(employeeprojects),
}));

export const employeeprojectsRelations = relations(employeeprojects, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeprojects.employee_id],
    references: [employees.employee_id],
  }),
  project: one(projects, {
    fields: [employeeprojects.project_id],
    references: [projects.project_id],
  }),
}));

export const leavesRelations = relations(leaves, ({ one }) => ({
  employee: one(employees, {
    fields: [leaves.employee_id],
    references: [employees.employee_id],
  }),
}));

// Схемы для вставки данных
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  department_id: true,
});

export const insertPositionSchema = createInsertSchema(positions).omit({
  position_id: true,
});

export const insertPositionDepartmentSchema = createInsertSchema(position_department).omit({
  position_link_id: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  employee_id: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  project_id: true,
});

export const insertEmployeeProjectSchema = createInsertSchema(employeeprojects);

export const insertLeaveSchema = createInsertSchema(leaves).omit({
  leave_id: true,
});

// Типы
export type User = typeof users.$inferSelect;
export type Department = typeof departments.$inferSelect;
export type Position = typeof positions.$inferSelect;
export type PositionDepartment = typeof position_department.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type EmployeeProject = typeof employeeprojects.$inferSelect;
export type Leave = typeof leaves.$inferSelect;

// Типы для вставки
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type InsertPositionDepartment = z.infer<typeof insertPositionDepartmentSchema>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertEmployeeProject = z.infer<typeof insertEmployeeProjectSchema>;
export type InsertLeave = z.infer<typeof insertLeaveSchema>;
