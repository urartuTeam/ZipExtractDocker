-- Create tables

-- Users
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT NOT NULL UNIQUE,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "first_name" TEXT,
  "last_name" TEXT,
  "role" TEXT DEFAULT 'employee',
  "active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments
CREATE TABLE IF NOT EXISTS "departments" (
  "department_id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "parent_department_id" INTEGER
);

-- Positions
CREATE TABLE IF NOT EXISTS "positions" (
  "position_id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "department_id" INTEGER REFERENCES "departments" ("department_id"),
  "staff_units" INTEGER DEFAULT 0,
  "current_count" INTEGER DEFAULT 0,
  "vacancies" INTEGER DEFAULT 0
);

-- Position-Department relationship
CREATE TABLE IF NOT EXISTS "position_department" (
  "position_link_id" SERIAL PRIMARY KEY,
  "position_id" INTEGER REFERENCES "positions" ("position_id"),
  "department_id" INTEGER REFERENCES "departments" ("department_id"),
  "sort" INTEGER DEFAULT 0
);

-- Employees
CREATE TABLE IF NOT EXISTS "employees" (
  "employee_id" SERIAL PRIMARY KEY,
  "full_name" TEXT NOT NULL,
  "position_id" INTEGER REFERENCES "positions" ("position_id"),
  "phone" TEXT,
  "email" TEXT,
  "manager_id" INTEGER,
  "department_id" INTEGER REFERENCES "departments" ("department_id")
);

-- Projects
CREATE TABLE IF NOT EXISTS "projects" (
  "project_id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "department_id" INTEGER REFERENCES "departments" ("department_id")
);

-- Employee-Project relationship
CREATE TABLE IF NOT EXISTS "employeeprojects" (
  "employee_id" INTEGER REFERENCES "employees" ("employee_id"),
  "project_id" INTEGER REFERENCES "projects" ("project_id"),
  "role" TEXT NOT NULL,
  PRIMARY KEY ("employee_id", "project_id")
);

-- Leaves
CREATE TABLE IF NOT EXISTS "leaves" (
  "leave_id" SERIAL PRIMARY KEY,
  "employee_id" INTEGER REFERENCES "employees" ("employee_id"),
  "start_date" DATE NOT NULL,
  "end_date" DATE,
  "type" TEXT NOT NULL
);

-- Add foreign key for departments self-reference
ALTER TABLE "departments" 
ADD CONSTRAINT IF NOT EXISTS "departments_parent_department_id_fkey" 
FOREIGN KEY ("parent_department_id") REFERENCES "departments" ("department_id") ON DELETE SET NULL;

-- Add foreign key for employees self-reference (manager)
ALTER TABLE "employees" 
ADD CONSTRAINT IF NOT EXISTS "employees_manager_id_fkey" 
FOREIGN KEY ("manager_id") REFERENCES "employees" ("employee_id") ON DELETE SET NULL;

-- Insert sample data

-- Add admin user
INSERT INTO "users" ("username", "email", "password", "first_name", "last_name", "role", "active")
VALUES ('admin', 'admin@test.ru', '$2b$10$d8GUxBoVDfI0yL3P9FcUE.CUILhd3hn4/oN3vD00xRuLAT9iC1mLq', 'Admin', 'Cyfrolab', 'employee', true)
ON CONFLICT (username) DO NOTHING;