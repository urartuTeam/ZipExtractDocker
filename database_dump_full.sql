DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "departments" CASCADE;
DROP TABLE IF EXISTS "positions" CASCADE;
DROP TABLE IF EXISTS "employees" CASCADE;
DROP TABLE IF EXISTS "projects" CASCADE;
DROP TABLE IF EXISTS "employeeprojects" CASCADE;
DROP TABLE IF EXISTS "leaves" CASCADE;
DROP TABLE IF EXISTS "position_department" CASCADE;
DROP TABLE IF EXISTS "_dummy_position_references" CASCADE;

-- Create tables
CREATE TABLE "users" (
    "id" SERIAL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_username_unique" UNIQUE ("username"),
    CONSTRAINT "users_email_unique" UNIQUE ("email")
);

CREATE TABLE "positions" (
    "position_id" SERIAL,
    "name" TEXT NOT NULL,
    "staff_units" INTEGER DEFAULT 0,
    "current_count" INTEGER DEFAULT 0,
    "vacancies" INTEGER DEFAULT 0,
    "parent_position_id" INTEGER,
    "sort" INTEGER DEFAULT 0,
    CONSTRAINT "idx_position_id" UNIQUE ("position_id")
);

CREATE TABLE "departments" (
    "department_id" SERIAL,
    "name" TEXT NOT NULL,
    "parent_position_id" INTEGER,
    CONSTRAINT "idx_department_id" UNIQUE ("department_id")
);

CREATE TABLE "employees" (
    "employee_id" SERIAL,
    "full_name" TEXT NOT NULL,
    "position_id" INTEGER,
    "phone" TEXT,
    "email" TEXT,
    "manager_id" INTEGER,
    "department_id" INTEGER,
    CONSTRAINT "employees_pkey" PRIMARY KEY ("employee_id")
);

CREATE TABLE "projects" (
    "project_id" SERIAL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "department_id" INTEGER,
    CONSTRAINT "projects_pkey" PRIMARY KEY ("project_id")
);

CREATE TABLE "employeeprojects" (
    "employee_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    CONSTRAINT "employeeprojects_employee_id_project_id_pk" PRIMARY KEY ("employee_id", "project_id")
);

CREATE TABLE "leaves" (
    "leave_id" SERIAL,
    "employee_id" INTEGER,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "type" TEXT NOT NULL,
    CONSTRAINT "leaves_pkey" PRIMARY KEY ("leave_id")
);

CREATE TABLE "position_department" (
    "position_link_id" SERIAL,
    "position_id" INTEGER,
    "department_id" INTEGER,
    "sort" INTEGER DEFAULT 0,
    CONSTRAINT "idx_position_link_id" UNIQUE ("position_link_id")
);

CREATE TABLE "_dummy_position_references" (
    "id" SERIAL,
    "position_id" INTEGER,
    CONSTRAINT "_dummy_position_references_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "departments" ADD CONSTRAINT "departments_parent_position_id_positions_position_id_fk" FOREIGN KEY ("parent_position_id") REFERENCES "positions"("position_id");

ALTER TABLE "position_department" ADD CONSTRAINT "position_department_position_id_positions_position_id_fk" FOREIGN KEY ("position_id") REFERENCES "positions"("position_id");
ALTER TABLE "position_department" ADD CONSTRAINT "position_department_department_id_departments_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "departments"("department_id");

ALTER TABLE "employees" ADD CONSTRAINT "employees_position_id_positions_position_id_fk" FOREIGN KEY ("position_id") REFERENCES "positions"("position_id");
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_departments_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "departments"("department_id");

ALTER TABLE "projects" ADD CONSTRAINT "projects_department_id_departments_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "departments"("department_id");

ALTER TABLE "employeeprojects" ADD CONSTRAINT "employeeprojects_employee_id_employees_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id");
ALTER TABLE "employeeprojects" ADD CONSTRAINT "employeeprojects_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id");

ALTER TABLE "leaves" ADD CONSTRAINT "leaves_employee_id_employees_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id");

ALTER TABLE "_dummy_position_references" ADD CONSTRAINT "_dummy_position_references_position_id_positions_position_id_fk" FOREIGN KEY ("position_id") REFERENCES "positions"("position_id");

-- Insert admin user
INSERT INTO users (username, email, password) 
VALUES ('admin', 'admin@example.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918');

-- Insert data from the current database
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, parent_position_id, sort) VALUES (1, 'Генеральный директор', 1, 1, 0, NULL, 1);
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, parent_position_id, sort) VALUES (2, 'Директор по IT', 1, 1, 0, 1, 2);
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, parent_position_id, sort) VALUES (3, 'Начальник отдела разработки', 1, 1, 0, 2, 3);
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, parent_position_id, sort) VALUES (4, 'Старший разработчик', 2, 1, 1, 3, 4);
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, parent_position_id, sort) VALUES (5, 'Разработчик', 3, 2, 1, 4, 5);
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, parent_position_id, sort) VALUES (6, 'тестовая должность', 0, 0, 0, 1, 0);
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, parent_position_id, sort) VALUES (7, 'тестовая должность', 0, 0, 0, 2, 0);

INSERT INTO public.departments (department_id, name, parent_position_id) VALUES (1, 'ИТ Департамент', 2);
INSERT INTO public.departments (department_id, name, parent_position_id) VALUES (2, 'Отдел разработки', 3);
INSERT INTO public.departments (department_id, name, parent_position_id) VALUES (3, 'тестовая должность', 1);
INSERT INTO public.departments (department_id, name, parent_position_id) VALUES (4, 'Начальник управления', NULL);

INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) VALUES (1, 'Иванов Иван Иванович', 1, '+7 (900) 123-45-67', 'ivanov@example.com', NULL, 1);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) VALUES (2, 'Петров Петр Петрович', 2, '+7 (900) 123-45-68', 'petrov@example.com', 1, 1);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) VALUES (3, 'Сидоров Сидор Сидорович', 3, '+7 (900) 123-45-69', 'sidorov@example.com', 2, 2);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) VALUES (4, 'Козлов Иван Петрович', 4, '+7 (900) 123-45-70', 'kozlov@example.com', 3, 2);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) VALUES (5, 'Смирнов Алексей Иванович', 5, '+7 (900) 123-45-71', 'smirnov@example.com', 4, 2);

INSERT INTO public.projects (project_id, name, description, department_id) VALUES (1, 'Внедрение CRM', 'Проект по внедрению CRM-системы для отдела продаж', 1);
INSERT INTO public.projects (project_id, name, description, department_id) VALUES (2, 'Разработка мобильного приложения', 'Создание мобильного приложения для клиентов компании', 2);

INSERT INTO public.employeeprojects (employee_id, project_id, role) VALUES (3, 1, 'Руководитель проекта');
INSERT INTO public.employeeprojects (employee_id, project_id, role) VALUES (4, 1, 'Архитектор');
INSERT INTO public.employeeprojects (employee_id, project_id, role) VALUES (5, 1, 'Разработчик');
INSERT INTO public.employeeprojects (employee_id, project_id, role) VALUES (4, 2, 'Технический руководитель');
INSERT INTO public.employeeprojects (employee_id, project_id, role) VALUES (5, 2, 'Разработчик');

INSERT INTO public.leaves (leave_id, employee_id, start_date, end_date, type) VALUES (1, 5, '2024-01-15', '2024-01-25', 'Отпуск');
INSERT INTO public.leaves (leave_id, employee_id, start_date, end_date, type) VALUES (2, 4, '2024-02-10', '2024-02-12', 'Больничный');

INSERT INTO public.position_department (position_link_id, position_id, department_id, sort) VALUES (1, 2, 1, 1);
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort) VALUES (2, 3, 2, 1);
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort) VALUES (3, 4, 2, 2);
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort) VALUES (4, 5, 2, 3);

-- Reset sequences
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('positions_position_id_seq', (SELECT MAX(position_id) FROM positions));
SELECT setval('departments_department_id_seq', (SELECT MAX(department_id) FROM departments));
SELECT setval('employees_employee_id_seq', (SELECT MAX(employee_id) FROM employees));
SELECT setval('projects_project_id_seq', (SELECT MAX(project_id) FROM projects));
SELECT setval('leaves_leave_id_seq', (SELECT MAX(leave_id) FROM leaves));
SELECT setval('position_department_position_link_id_seq', (SELECT MAX(position_link_id) FROM position_department));
SELECT setval('_dummy_position_references_id_seq', COALESCE((SELECT MAX(id) FROM _dummy_position_references), 0) + 1);
