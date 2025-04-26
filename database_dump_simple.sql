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
