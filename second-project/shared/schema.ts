import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  jsonb,
  timestamp,
  foreignKey,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Entity types
export const entityTypes = {
  ORGANIZATION: "organization",
  DEPARTMENT: "department",
  MANAGEMENT: "management",
  POSITION: "position",
} as const;

// Base organizational unit for organizations, departments, management, and positions
export const orgUnits = pgTable("org_units", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'organization', 'department', 'management', 'position'
  type_id: integer("type_id").notNull(), // 'organization', 'department', 'management', 'position'
  parentId: integer("parent_id").references(() => orgUnits.id, {
    onDelete: "cascade",
  }),
  staffCount: integer("staff_count").default(1), // Only relevant for positions
  logo: text("logo"), // URL to logo, only for organizations
  headEmployeeId: integer("head_employee_id"), // References employees table, for departments and management
  headPositionId: integer("head_position_id"), // References id column in the same table
  positionX: real("position_x").default(0), // X координата для позиционирования
  positionY: real("position_y").default(0), // Y координата для позиционирования
  createdAt: timestamp("created_at").defaultNow(),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  positionId: integer("position_id").references(() => positions.id),
  departmentId: integer("department_id").references(() => orgUnits.id),
  managerId: integer("manager_id").references(() => employees.id),
  createdAt: timestamp("created_at").defaultNow(),
  legacyId: integer("legacy_id"),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const departments = pgTable("departments", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  logoPath: text("logo_path"),
  isManagment: boolean("is_managment").default(false),
});

export const positions = pgTable("positions", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});

export const organizations = pgTable("organizations", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  logoPath: text("logo_path"),
});

export const projectRoles = pgTable("project_roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const employeeProjectRoles = pgTable("employee_project_roles", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .references(() => employees.id, { onDelete: "cascade" })
    .notNull(),
  projectRoleId: integer("project_role_id")
    .references(() => projectRoles.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Таблица для назначения сотрудников на должности/управления/отделы
export const employeePositions = pgTable("employee_positions", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  orgUnitId: integer("org_unit_id")
    .notNull()
    .references(() => orgUnits.id, { onDelete: "cascade" }),
  positionId: integer("position_id")
    .references(() => positions.id, { onDelete: "set null" }), // Должность сотрудника в данном подразделении
  isHead: boolean("is_head").default(false), // Является ли руководителем этой единицы
  assignedAt: timestamp("assigned_at").defaultNow(),
});

// Insert schemas
export const insertOrgUnitSchema = createInsertSchema(orgUnits).pick({
  parentId: true,
  type: true,
  type_id: true,
  staffCount: true,
  positionX: true,
  positionY: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  legacyId: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertProjectRoleSchema = createInsertSchema(projectRoles).omit({
  id: true,
  createdAt: true,
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
});

export const insertPositionSchema = createInsertSchema(positions).omit({
  id: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
});

export const insertEmployeeProjectRoleSchema = createInsertSchema(
  employeeProjectRoles,
).omit({ id: true, createdAt: true });

export const insertEmployeePositionSchema = createInsertSchema(
  employeePositions,
).omit({ id: true, assignedAt: true });

// Types
export type OrgUnit = typeof orgUnits.$inferSelect;
export type InsertOrgUnit = z.infer<typeof insertOrgUnitSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type ProjectRole = typeof projectRoles.$inferSelect;
export type InsertProjectRole = z.infer<typeof insertProjectRoleSchema>;

export type Departments = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type Positions = typeof positions.$inferSelect;
export type InsertPosition = z.infer<typeof insertPositionSchema>;

export type Organizations = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type EmployeeProjectRole = typeof employeeProjectRoles.$inferSelect;
export type InsertEmployeeProjectRole = z.infer<
  typeof insertEmployeeProjectRoleSchema
>;

export type EmployeePosition = typeof employeePositions.$inferSelect;
export type InsertEmployeePosition = z.infer<typeof insertEmployeePositionSchema>;

// Extended types for frontend
export type OrgUnitWithChildren = OrgUnit & {
  children: OrgUnitWithChildren[];
  employees?: Employee[];
  headEmployee?: Employee;
};

export type ProjectWithRoles = Project & {
  roles: (ProjectRole & {
    employees: Employee[];
  })[];
};
