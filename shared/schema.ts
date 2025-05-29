import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  date,
  primaryKey,
  varchar,
  unique,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

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

// Пользователи
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  deleted: boolean("deleted").default(false),
  deleted_at: timestamp("deleted_at"),
});

// Должности
export const positions = pgTable("positions", {
  position_id: serial("position_id").primaryKey(),
  name: text("name").notNull(),
  sort: integer("sort").default(0),
  is_category: boolean("is_category").default(false),
  deleted: boolean("deleted").default(false),
  deleted_at: timestamp("deleted_at"),
});

// Связь между должностями (иерархия должностей)
export const position_position = pgTable("position_position", {
  position_relation_id: serial("position_relation_id").primaryKey(),
  position_id: integer("position_id").references(() => positions.position_id),
  parent_position_id: integer("parent_position_id").references(
      () => positions.position_id,
  ),
  department_id: integer("department_id").references(
      () => departments.department_id,
  ),
  sort: integer("sort").default(0),
  deleted: boolean("deleted").default(false),
  deleted_at: timestamp("deleted_at"),
});

// Отделы
export const departments = pgTable("departments", {
  department_id: serial("department_id").primaryKey(),
  name: text("name").notNull(),
  parent_department_id: integer("parent_department_id"),
  parent_position_id: integer("parent_position_id"),
  is_organization: boolean("is_organization").default(false),
  logo_path: text("logo_path"),
  sort: integer("sort").default(0),
  deleted: boolean("deleted").default(false),
  deleted_at: timestamp("deleted_at"),
  leadership_position_id: integer("leadership_position_id").references(() => positions.position_id),
  manager_id: integer("manager_id").references(() => employees.employee_id),
});

// Связь между должностями и отделами
export const position_department = pgTable("position_department", {
  position_link_id: serial("position_link_id").primaryKey(),
  position_id: integer("position_id").references(() => positions.position_id),
  department_id: integer("department_id").references(
      () => departments.department_id,
  ),
  staff_units: integer("staff_units").default(0),
  current_count: integer("current_count").default(0),
  vacancies: integer("vacancies").default(0),
  sort: integer("sort").default(0),
  deleted: boolean("deleted").default(false),
  deleted_at: timestamp("deleted_at"),
});

// Сотрудники
export const employees = pgTable("employees", {
  employee_id: serial("employee_id").primaryKey(),
  full_name: text("full_name").notNull(),
  position_id: integer("position_id").references(() => positions.position_id),
  phone: text("phone"),
  email: text("email"),
  manager_id: integer("manager_id"),
  department_id: integer("department_id").references(
      () => departments.department_id,
  ),
  category_parent_id: integer("category_parent_id").references(
      () => positions.position_id,
  ),
  photo_url: text("photo_url"),
  deleted: boolean("deleted").default(false),
  deleted_at: timestamp("deleted_at"),
});

// Проекты
export const projects = pgTable("projects", {
  project_id: serial("project_id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  department_id: integer("department_id").references(
      () => departments.department_id,
  ),
  id_organization: integer("id_organization").references(
      () => departments.department_id,
  ),
  sort: integer("sort").default(0),
  deleted: boolean("deleted").default(false),
  deleted_at: timestamp("deleted_at"),
});

// Связь сотрудников и проектов
export const employeeprojects = pgTable(
    "employeeprojects",
    {
      employee_id: integer("employee_id").references(() => employees.employee_id),
      project_id: integer("project_id").references(() => projects.project_id),
      role_id: integer("role_id").references(() => project_roles.id),
    },
    (table) => ({
      pk: primaryKey({ columns: [table.employee_id, table.project_id] }),
    }),
);

// Отпуска
export const leaves = pgTable("leaves", {
  leave_id: serial("leave_id").primaryKey(),
  employee_id: integer("employee_id").references(() => employees.employee_id),
  start_date: date("start_date").notNull(),
  end_date: date("end_date"),
  type: text("type").notNull(),
  deleted: boolean("deleted").default(false),
  deleted_at: timestamp("deleted_at"),
});

// Роли в проектах
export const roles = pgTable("project_roles", {
  role_id: integer("role_id").primaryKey(),
  role_name: varchar("role_name"),
});

// Отношения
export const departmentsRelations = relations(departments, ({ one, many }) => ({
  parentDepartment: one(departments, {
    fields: [departments.parent_department_id],
    references: [departments.department_id],
    relationName: "parent_department",
  }),
  childDepartments: many(departments, { relationName: "parent_department" }),
  parentPosition: one(positions, {
    fields: [departments.parent_position_id],
    references: [positions.position_id],
    relationName: "parent_position_department",
  }),
  positions: many(position_department, {
    relationName: "department_positions",
  }),
  employees: many(employees),
  projects: many(projects),
  organizationProjects: many(projects, {
    relationName: "project_organization",
  }),
}));

export const positionsRelations = relations(positions, ({ many }) => ({
  departments: many(position_department, {
    relationName: "position_departments",
  }),
  employees: many(employees),
  parentPositions: many(position_position, {
    relationName: "child_position_relation",
  }),
  childPositions: many(position_position, {
    relationName: "parent_position_relation",
  }),
  childDepartments: many(departments, {
    relationName: "parent_position_department",
  }),
}));

export const position_positionRelations = relations(
    position_position,
    ({ one }) => ({
      position: one(positions, {
        fields: [position_position.position_id],
        references: [positions.position_id],
        relationName: "child_position_relation",
      }),
      parentPosition: one(positions, {
        fields: [position_position.parent_position_id],
        references: [positions.position_id],
        relationName: "parent_position_relation",
      }),
      department: one(departments, {
        fields: [position_position.department_id],
        references: [departments.department_id],
      }),
    }),
);

export const position_departmentRelations = relations(
    position_department,
    ({ one }) => ({
      position: one(positions, {
        fields: [position_department.position_id],
        references: [positions.position_id],
        relationName: "position_departments",
      }),
      department: one(departments, {
        fields: [position_department.department_id],
        references: [departments.department_id],
        relationName: "department_positions",
      }),
    }),
);

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
    relationName: "manager_employee",
  }),
  categoryParent: one(positions, {
    fields: [employees.category_parent_id],
    references: [positions.position_id],
    relationName: "category_parent_position",
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
  organization: one(departments, {
    fields: [projects.id_organization],
    references: [departments.department_id],
    relationName: "project_organization",
  }),
  employees: many(employeeprojects),
}));

export const employeeprojectsRelations = relations(
    employeeprojects,
    ({ one }) => ({
      employee: one(employees, {
        fields: [employeeprojects.employee_id],
        references: [employees.employee_id],
      }),
      project: one(projects, {
        fields: [employeeprojects.project_id],
        references: [projects.project_id],
      }),
      role: one(project_roles, {
        fields: [employeeprojects.role_id],
        references: [project_roles.id],
      }),
    }),
);

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

export const insertPositionDepartmentSchema = createInsertSchema(
    position_department,
).omit({
  position_link_id: true,
});

export const insertPositionPositionSchema = createInsertSchema(
    position_position,
)
    .omit({
      position_relation_id: true,
    })
    .extend({
      // Добавляем расширение схемы для корректной обработки категорийных должностей
      position_id: z.number(),
      parent_position_id: z.number(),
      department_id: z.number(),
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

export const insertRoleSchema = createInsertSchema(roles).omit({
  role_id: true,
});

// Типы
export type User = typeof users.$inferSelect;
export type Department = typeof departments.$inferSelect;
export type Position = typeof positions.$inferSelect;
export type PositionDepartment = typeof position_department.$inferSelect;
export type PositionPosition = typeof position_position.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type EmployeeProject = typeof employeeprojects.$inferSelect;
export type Leave = typeof leaves.$inferSelect;
export type Role = typeof roles.$inferSelect;

// Типы для вставки
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type InsertPositionDepartment = z.infer<
    typeof insertPositionDepartmentSchema
>;
export type InsertPositionPosition = z.infer<
    typeof insertPositionPositionSchema
>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
// Настройки
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  data_key: text("data_key").notNull().unique(),
  data_value: text("data_value").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Схема Zod для настроек
export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertEmployeeProject = z.infer<typeof insertEmployeeProjectSchema>;
export type InsertLeave = z.infer<typeof insertLeaveSchema>;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

// Таблица для хранения порядка сортировки элементов иерархии
export const sort_tree = pgTable(
    "sort_tree",
    {
      id: serial("id").primaryKey(),
      sort: integer("sort").notNull(),
      type: text("type").notNull(),
      type_id: integer("type_id").notNull(),
      parent_id: integer("parent_id"),
    },
    (table) => ({
      // Уникальное ограничение на тип, id элемента и parent_id
      unique_type_entity: unique().on(table.type, table.type_id, table.parent_id),
    }),
);

// Схема Zod для sort_tree
export const insertSortTreeSchema = createInsertSchema(sort_tree).omit({
  id: true,
});

// Типы для sort_tree
export type SortTree = typeof sort_tree.$inferSelect;
export type InsertSortTree = z.infer<typeof insertSortTreeSchema>;

// Роли проектов
export const project_roles = pgTable("project_roles", {
  id: serial("id").primaryKey(),
  parent_id: integer("parent_id").references(() => project_roles.id),
  name: text("name").notNull(),
  is_rp: boolean("is_rp").default(false),
});

// Отношения для ролей проектов
export const projectRolesRelations = relations(project_roles, ({ one, many }) => ({
  parent: one(project_roles, {
    fields: [project_roles.parent_id],
    references: [project_roles.id],
    relationName: "parent_role",
  }),
  children: many(project_roles, { relationName: "parent_role" }),
}));

// Схема для вставки ролей проектов
export const insertProjectRoleSchema = createInsertSchema(project_roles).omit({
  id: true,
});

// Типы для ролей проектов
export type ProjectRole = typeof project_roles.$inferSelect;
export type InsertProjectRole = z.infer<typeof insertProjectRoleSchema>;
