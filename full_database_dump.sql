-- Full database dump with schema and data using INSERT statements

-- Drop existing tables if any
DROP TABLE IF EXISTS _dummy_position_references CASCADE;
DROP TABLE IF EXISTS active_departments CASCADE;
DROP TABLE IF EXISTS active_employeeprojects CASCADE;
DROP TABLE IF EXISTS active_employees CASCADE;
DROP TABLE IF EXISTS active_leaves CASCADE;
DROP TABLE IF EXISTS active_position_department CASCADE;
DROP TABLE IF EXISTS active_projects CASCADE;
DROP TABLE IF EXISTS active_users CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS employeeprojects CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS leaves CASCADE;
DROP TABLE IF EXISTS position_department CASCADE;
DROP TABLE IF EXISTS position_position CASCADE;
DROP TABLE IF EXISTS positions CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS sort_tree CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_username_key UNIQUE (username);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_email_key UNIQUE (email);

-- Create Positions table
CREATE TABLE public.positions (
    position_id integer NOT NULL,
    name text NOT NULL,
    sort integer DEFAULT 0,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);

CREATE SEQUENCE public.positions_position_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.positions_position_id_seq OWNED BY public.positions.position_id;
ALTER TABLE ONLY public.positions ALTER COLUMN position_id SET DEFAULT nextval('public.positions_position_id_seq'::regclass);
ALTER TABLE ONLY public.positions ADD CONSTRAINT positions_pkey PRIMARY KEY (position_id);

-- Create Departments table
CREATE TABLE public.departments (
    department_id integer NOT NULL,
    name text NOT NULL,
    parent_department_id integer,
    parent_position_id integer,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);

CREATE SEQUENCE public.departments_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;
ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);
ALTER TABLE ONLY public.departments ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);

-- Create Position_Position table
CREATE TABLE public.position_position (
    position_relation_id integer NOT NULL,
    position_id integer,
    parent_position_id integer,
    department_id integer,
    sort integer DEFAULT 0,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE SEQUENCE public.position_position_position_relation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.position_position_position_relation_id_seq OWNED BY public.position_position.position_relation_id;
ALTER TABLE ONLY public.position_position ALTER COLUMN position_relation_id SET DEFAULT nextval('public.position_position_position_relation_id_seq'::regclass);
ALTER TABLE ONLY public.position_position ADD CONSTRAINT position_position_pkey PRIMARY KEY (position_relation_id);
ALTER TABLE ONLY public.position_position ADD CONSTRAINT position_position_position_id_positions_position_id_fk FOREIGN KEY (position_id) REFERENCES public.positions(position_id);
ALTER TABLE ONLY public.position_position ADD CONSTRAINT position_position_parent_position_id_positions_position_id_fk FOREIGN KEY (parent_position_id) REFERENCES public.positions(position_id);
ALTER TABLE ONLY public.position_position ADD CONSTRAINT position_position_department_id_departments_department_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(department_id);

-- Create Employees table
CREATE TABLE public.employees (
    employee_id integer NOT NULL,
    full_name text NOT NULL,
    position_id integer,
    phone text,
    email text,
    manager_id integer,
    department_id integer,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);

CREATE SEQUENCE public.employees_employee_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.employees_employee_id_seq OWNED BY public.employees.employee_id;
ALTER TABLE ONLY public.employees ALTER COLUMN employee_id SET DEFAULT nextval('public.employees_employee_id_seq'::regclass);
ALTER TABLE ONLY public.employees ADD CONSTRAINT employees_pkey PRIMARY KEY (employee_id);
ALTER TABLE ONLY public.employees ADD CONSTRAINT employees_position_id_positions_position_id_fk FOREIGN KEY (position_id) REFERENCES public.positions(position_id);
ALTER TABLE ONLY public.employees ADD CONSTRAINT employees_department_id_departments_department_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(department_id);

-- Create Position_Department table
CREATE TABLE public.position_department (
    position_link_id integer NOT NULL,
    position_id integer,
    department_id integer,
    staff_units integer DEFAULT 0,
    current_count integer DEFAULT 0,
    vacancies integer DEFAULT 0,
    sort integer DEFAULT 0,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);

CREATE SEQUENCE public.position_department_position_link_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.position_department_position_link_id_seq OWNED BY public.position_department.position_link_id;
ALTER TABLE ONLY public.position_department ALTER COLUMN position_link_id SET DEFAULT nextval('public.position_department_position_link_id_seq'::regclass);
ALTER TABLE ONLY public.position_department ADD CONSTRAINT position_department_pkey PRIMARY KEY (position_link_id);
ALTER TABLE ONLY public.position_department ADD CONSTRAINT position_department_position_id_positions_position_id_fk FOREIGN KEY (position_id) REFERENCES public.positions(position_id);
ALTER TABLE ONLY public.position_department ADD CONSTRAINT position_department_department_id_departments_department_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(department_id);

-- Create Projects table
CREATE TABLE public.projects (
    project_id integer NOT NULL,
    name text NOT NULL,
    description text,
    department_id integer,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);

CREATE SEQUENCE public.projects_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.projects_project_id_seq OWNED BY public.projects.project_id;
ALTER TABLE ONLY public.projects ALTER COLUMN project_id SET DEFAULT nextval('public.projects_project_id_seq'::regclass);
ALTER TABLE ONLY public.projects ADD CONSTRAINT projects_pkey PRIMARY KEY (project_id);
ALTER TABLE ONLY public.projects ADD CONSTRAINT projects_department_id_departments_department_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(department_id);

-- Create EmployeeProjects table
CREATE TABLE public.employeeprojects (
    employee_id integer NOT NULL,
    project_id integer NOT NULL,
    role text NOT NULL,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);

ALTER TABLE ONLY public.employeeprojects ADD CONSTRAINT employeeprojects_pkey PRIMARY KEY (employee_id, project_id);
ALTER TABLE ONLY public.employeeprojects ADD CONSTRAINT employeeprojects_employee_id_employees_employee_id_fk FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id);
ALTER TABLE ONLY public.employeeprojects ADD CONSTRAINT employeeprojects_project_id_projects_project_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(project_id);

-- Create Leaves table
CREATE TABLE public.leaves (
    leave_id integer NOT NULL,
    employee_id integer,
    start_date date NOT NULL,
    end_date date,
    type text NOT NULL,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);

CREATE SEQUENCE public.leaves_leave_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.leaves_leave_id_seq OWNED BY public.leaves.leave_id;
ALTER TABLE ONLY public.leaves ALTER COLUMN leave_id SET DEFAULT nextval('public.leaves_leave_id_seq'::regclass);
ALTER TABLE ONLY public.leaves ADD CONSTRAINT leaves_pkey PRIMARY KEY (leave_id);
ALTER TABLE ONLY public.leaves ADD CONSTRAINT leaves_employee_id_employees_employee_id_fk FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id);

-- Create Settings table
CREATE TABLE public.settings (
    id integer NOT NULL,
    data_key text NOT NULL,
    data_value text,
    description text,
    data_type text DEFAULT 'string'::text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;
ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);
ALTER TABLE ONLY public.settings ADD CONSTRAINT settings_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.settings ADD CONSTRAINT settings_data_key_key UNIQUE (data_key);

-- Create Sort Tree table
CREATE TABLE public.sort_tree (
    id integer NOT NULL,
    sort integer NOT NULL,
    type character varying(20) NOT NULL,
    type_id integer NOT NULL,
    parent_id integer
);

CREATE SEQUENCE public.sort_tree_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.sort_tree_id_seq OWNED BY public.sort_tree.id;
ALTER TABLE ONLY public.sort_tree ALTER COLUMN id SET DEFAULT nextval('public.sort_tree_id_seq'::regclass);
ALTER TABLE ONLY public.sort_tree ADD CONSTRAINT sort_tree_pkey PRIMARY KEY (id);

-- Create Views
CREATE VIEW public.active_departments AS
 SELECT department_id,
    name,
    parent_department_id,
    parent_position_id,
    deleted,
    deleted_at
   FROM public.departments
  WHERE (deleted = false);

CREATE VIEW public.active_employees AS
 SELECT employee_id,
    full_name,
    position_id,
    phone,
    email,
    manager_id,
    department_id,
    deleted,
    deleted_at
   FROM public.employees
  WHERE (deleted = false);

CREATE VIEW public.active_employeeprojects AS
 SELECT employee_id,
    project_id,
    role,
    deleted,
    deleted_at
   FROM public.employeeprojects
  WHERE (deleted = false);

CREATE VIEW public.active_leaves AS
 SELECT leave_id,
    employee_id,
    start_date,
    end_date,
    type,
    deleted,
    deleted_at
   FROM public.leaves
  WHERE (deleted = false);

CREATE VIEW public.active_position_department AS
 SELECT position_link_id,
    position_id,
    department_id,
    sort,
    deleted,
    deleted_at,
    staff_units,
    current_count,
    vacancies
   FROM public.position_department
  WHERE (deleted = false);

CREATE VIEW public.active_projects AS
 SELECT project_id,
    name,
    description,
    department_id,
    deleted,
    deleted_at
   FROM public.projects
  WHERE (deleted = false);

CREATE VIEW public.active_users AS
 SELECT id,
    username,
    email,
    password,
    created_at,
    deleted,
    deleted_at
   FROM public.users
  WHERE (deleted = false);

-- Insert settings
INSERT INTO settings (id, data_key, data_value, description, data_type, created_at, updated_at) 
VALUES (1, 'hierarchy_initial_levels', '2', 'Уровни иерархии, показываемые изначально', 'number', '2025-04-27 10:36:15.699481', '2025-04-30 09:04:44.087');

-- Insert data
-- Users table
INSERT INTO users (id, username, email, password, created_at, deleted, deleted_at) VALUES (1, 'admin', 'admin@example.com', '4ec86d813dc530a40745900a6439209e6c1f6357b8ade99cb85f5e4dda8fc0d4927b840f8ae5710ef1ce55b7b4b8b9cf2a8c832d3be46a15a9082a4fb4e9751b.3c30567107e13e47c160c7456b9acade', '2025-04-24 07:52:25.855195', false, NULL);

-- Positions table 
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (11, 'Обновленная тестовая должность', 100, true, '2025-04-27 22:45:45.385');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (21, 'Директор по развитию', 10, true, '2025-04-30 08:11:43.105495');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (1, 'ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА', 1, true, '2025-04-30 08:13:11.604396');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (2, 'Главный эксперт', 2, true, '2025-04-30 08:13:11.604396');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (3, 'Главный специалист', 3, true, '2025-04-30 08:13:11.604396');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (5, 'Генеральный директор', 5, true, '2025-04-30 08:13:11.604396');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (6, 'Начальник управления', 6, true, '2025-04-30 08:13:11.604396');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (4, 'Исполнительный директор', 4, true, '2025-04-30 08:13:11.604396');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (7, 'Заместитель генерального директора по координации реализации планов ОИВ', 7, true, '2025-04-30 08:13:11.604396');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (8, 'Заместитель генерального директора по координации аналитики', 8, true, '2025-04-30 08:13:11.604396');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (9, 'Заместитель генерального директора по координации разработки', 9, true, '2025-04-30 08:13:11.604396');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (10, 'Директор по развитию', 10, true, '2025-04-30 08:13:11.604396');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (12, 'ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА', 1, true, '2025-04-30 08:13:11.604396');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (13, 'Главный эксперт', 2, true, '2025-04-30 08:13:11.604396');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (14, 'Главный специалист', 3, true, '2025-04-30 08:13:11.604396');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (15, 'Исполнительный директор', 4, true, '2025-04-30 08:13:11.604396');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (16, 'Генеральный директор', 5, true, '2025-04-30 08:13:11.604396');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (17, 'Начальник управления', 6, true, '2025-04-30 08:13:11.604396');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (18, 'Заместитель генерального директора по координации реализации планов ОИВ', 7, true, '2025-04-30 08:13:11.604396');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (19, 'Заместитель генерального директора по координации аналитики', 8, true, '2025-04-30 08:13:11.604396');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (20, 'Заместитель генерального директора по координации разработки', 9, true, '2025-04-30 08:13:11.604396');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (22, 'Заместитель руководителя департамента', 0, true, '2025-04-30 08:30:48.443727');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (23, 'Заместитель руководителя департамента', 0, false, NULL);
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (24, 'Начальник управления', 0, false, NULL);
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (26, 'Главный эксперт', 0, false, NULL);
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (27, 'Главный специалист', 0, false, NULL);
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (29, 'Заместитель начальника управления', 0, false, NULL);
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (30, 'Руководитель проекта', 0, false, NULL);
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (31, 'Руководитель проекта', 0, false, NULL);
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (32, 'Самарин Иван Юрьевич', 0, true, '2025-04-30 13:01:43.857683');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (33, 'Администратор проекта', 0, false, NULL);
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (34, 'Главный эксперт', 0, false, NULL);
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (28, 'Заместитель начальника управления', 0, false, NULL);
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (35, 'Заместитель начальника управления', 0, false, NULL);
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (25, 'Генеральный директор', 0, true, '2025-05-01 18:55:34.257968');
INSERT INTO positions (position_id, name, sort, deleted, deleted_at) VALUES (36, 'Генеральный директор', 0, false, NULL);

-- Departments table
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (5, 'тестовая должность', NULL, 6, true, '2025-04-26 11:51:46.653');
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (9, 'Тестовый отдел создан через API', 1, NULL, true, '2025-04-27 22:17:38.782');
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (10, 'Обновленный тестовый отдел', 1, NULL, true, '2025-04-27 22:45:45.44');
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (1, 'Администрация', NULL, NULL, true, '2025-04-30 08:13:11.604396');
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (2, 'Управление цифровизации и градостроительных данных', 1, 6, true, '2025-04-30 08:13:11.604396');
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (3, 'Управление цифрового развития', 1, 6, true, '2025-04-30 08:13:11.604396');
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (6, 'тестовый отдел', NULL, 6, true, '2025-04-30 08:13:11.604396');
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (7, 'ОТДЕЛ КООРДИНАЦИИ   РАЗРАБОТКИ', NULL, 9, true, '2025-04-30 08:13:11.604396');
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (8, 'Управление', NULL, 1, true, '2025-04-30 08:13:11.604396');
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (11, 'Администрация', NULL, NULL, true, '2025-04-30 08:13:11.604396');
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (12, 'Управление цифровизации и градостроительных данных', 1, 6, true, '2025-04-30 08:13:11.604396');
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (13, 'Управление цифрового развития', 1, 6, true, '2025-04-30 08:13:11.604396');
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (14, 'тестовый отдел', NULL, 6, true, '2025-04-30 08:13:11.604396');
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (15, 'ОТДЕЛ КООРДИНАЦИИ РАЗРАБОТКИ', NULL, 9, true, '2025-04-30 08:13:11.604396');
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (16, 'Управление 1', NULL, 1, true, '2025-04-30 08:13:11.604396');
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (17, 'Администрация', NULL, NULL, false, NULL);
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (20, 'Управление цифрового развития', 18, NULL, false, NULL);
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (19, 'Управление цифровизации и градостроительных данных', 18, NULL, false, NULL);
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (18, 'Управление', NULL, 23, false, NULL);

-- Position-Position relationships (hierarchy)
INSERT INTO position_position (position_relation_id, position_id, parent_position_id, department_id, sort, deleted, deleted_at) VALUES (1, 24, 23, 19, 0, false, NULL);
INSERT INTO position_position (position_relation_id, position_id, parent_position_id, department_id, sort, deleted, deleted_at) VALUES (2, 30, 24, 19, 0, false, NULL);
INSERT INTO position_position (position_relation_id, position_id, parent_position_id, department_id, sort, deleted, deleted_at) VALUES (3, 31, 24, 20, 0, false, NULL);
INSERT INTO position_position (position_relation_id, position_id, parent_position_id, department_id, sort, deleted, deleted_at) VALUES (4, 29, 24, 20, 0, false, NULL);
INSERT INTO position_position (position_relation_id, position_id, parent_position_id, department_id, sort, deleted, deleted_at) VALUES (5, 33, 24, 19, 0, false, NULL);
INSERT INTO position_position (position_relation_id, position_id, parent_position_id, department_id, sort, deleted, deleted_at) VALUES (6, 24, 23, 20, 0, false, NULL);
INSERT INTO position_position (position_relation_id, position_id, parent_position_id, department_id, sort, deleted, deleted_at) VALUES (7, 34, 24, 19, 0, false, NULL);
INSERT INTO position_position (position_relation_id, position_id, parent_position_id, department_id, sort, deleted, deleted_at) VALUES (8, 28, 24, 19, 0, false, NULL);
INSERT INTO position_position (position_relation_id, position_id, parent_position_id, department_id, sort, deleted, deleted_at) VALUES (9, 35, 24, 20, 0, false, NULL);
INSERT INTO position_position (position_relation_id, position_id, parent_position_id, department_id, sort, deleted, deleted_at) VALUES (11, 36, 23, 17, 0, false, NULL);
INSERT INTO position_position (position_relation_id, position_id, parent_position_id, department_id, sort, deleted, deleted_at) VALUES (10, 25, 23, 17, 0, false, NULL);

-- Employees
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) VALUES (3, 'Терновский Андрей Викторович', 9, NULL, NULL, NULL, 1, false, NULL);
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) VALUES (4, 'Подгорный Александр Владимирович', 4, NULL, NULL, NULL, 1, false, NULL);
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) VALUES (5, 'Обновленный Тестовый Сотрудник', 11, '+7 (999) 987-65-43', 'test@example.com', NULL, 10, true, '2025-04-27 22:45:45.315');
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) VALUES (1, 'Степанова Дарья Владимировна', 23, '+7 (111) 111-11-11', 'mail@example.com', NULL, 17, false, NULL);
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) VALUES (6, 'Степанова Дарья Владимировна', 1, '+7 (111) 111-11-11', 'mail@example.com', NULL, 1, true, '2025-04-30 08:37:00.689685');
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) VALUES (7, 'Герц Владимир Андреевич', 6, NULL, NULL, 1, 1, true, '2025-04-30 08:37:04.008906');
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) VALUES (8, 'Терновский Андрей Викторович', 9, NULL, NULL, NULL, 1, true, '2025-04-30 08:37:07.690364');
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) VALUES (9, 'Подгорный Александр Владимирович', 4, NULL, NULL, NULL, 1, true, '2025-04-30 08:37:10.764734');
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) VALUES (2, 'Герц Владимир Андреевич', 24, NULL, NULL, 1, 20, false, NULL);
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) VALUES (10, 'Самарин Иван Юрьевич', 30, NULL, NULL, NULL, 19, false, NULL);
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) VALUES (11, 'Тюрькин Евгений Андреевич', 30, NULL, NULL, NULL, 19, false, NULL);
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) VALUES (12, 'Попов Андрей Михайлович', 33, NULL, NULL, NULL, 19, false, NULL);
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) VALUES (13, 'Коробчану Евгений Юрьевич', 33, NULL, NULL, NULL, 19, false, NULL);
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) VALUES (14, 'Чурилова Светлана Михайловна', 33, NULL, NULL, NULL, 19, false, NULL);
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) VALUES (15, 'Миронова Екатерина Павловна', 34, NULL, NULL, NULL, 19, false, NULL);
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) VALUES (16, 'Зелинский Андрей Николаевич', 34, NULL, NULL, NULL, 19, false, NULL);
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) VALUES (17, 'Молева Анастасия Алексеевна', 34, NULL, NULL, NULL, 19, false, NULL);

-- Position-Department relationships
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (44, 36, 17, 0, 0, 1, 0, false, NULL);
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (1, 1, 1, 1, 1, 0, 0, true, '2025-04-30 08:13:11.604396');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (2, 2, 1, 0, 0, 0, 0, true, '2025-04-30 08:13:11.604396');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (3, 3, 1, 0, 0, 0, 0, true, '2025-04-30 08:13:11.604396');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (4, 5, 1, 0, 0, 0, 0, true, '2025-04-30 08:13:11.604396');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (5, 6, 1, 0, 0, 0, 0, true, '2025-04-30 08:13:11.604396');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (6, 4, 1, 0, 0, 0, 0, true, '2025-04-30 08:13:11.604396');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (7, 7, 1, 0, 0, 0, 0, true, '2025-04-30 08:13:11.604396');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (8, 8, 1, 0, 0, 0, 0, true, '2025-04-30 08:13:11.604396');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (9, 9, 1, 0, 0, 0, 0, true, '2025-04-30 08:13:11.604396');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (10, 10, 1, 1, 0, 1, 0, true, '2025-04-30 08:13:11.604396');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (11, 1, 1, 1, 1, 0, 0, true, '2025-04-30 08:13:11.604396');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (12, 2, 1, 0, 0, 0, 0, true, '2025-04-30 08:13:11.604396');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (13, 3, 1, 0, 0, 0, 0, true, '2025-04-30 08:13:11.604396');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (14, 5, 1, 0, 0, 0, 0, true, '2025-04-30 08:13:11.604396');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (15, 6, 1, 0, 0, 0, 0, true, '2025-04-30 08:13:11.604396');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (16, 4, 1, 0, 0, 0, 0, true, '2025-04-30 08:13:11.604396');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (17, 7, 1, 0, 0, 0, 0, true, '2025-04-30 08:13:11.604396');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (18, 8, 1, 0, 0, 0, 0, true, '2025-04-30 08:13:11.604396');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (19, 9, 1, 0, 0, 0, 0, true, '2025-04-30 08:13:11.604396');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (20, 10, 1, 1, 0, 1, 0, true, '2025-04-30 08:13:11.604396');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (22, 24, 17, 0, 0, 0, 0, true, '2025-04-30 08:46:38.370004');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (32, 32, 19, 0, 0, 0, 0, false, NULL);
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (24, 24, 20, 0, 0, 0, 0, true, '2025-04-30 13:42:18.644272');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (27, 24, 19, 0, 0, 0, 0, true, '2025-04-30 13:42:20.03701');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (35, 24, 19, 0, 0, 1, 0, false, NULL);
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (30, 30, 19, 0, 0, 3, 0, false, NULL);
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (31, 31, 20, 0, 0, 3, 0, false, NULL);
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (25, 26, 17, 0, 0, 1, 0, false, NULL);
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (26, 27, 17, 0, 0, 1, 0, false, NULL);
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (29, 29, 20, 0, 0, 1, 0, false, NULL);
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (33, 33, 19, 0, 0, 1, 0, false, NULL);
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (36, 24, 20, 0, 0, 1, 0, false, NULL);
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (34, 34, 19, 0, 0, 3, 0, false, NULL);
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (28, 28, 19, 0, 0, 1, 0, false, NULL);
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (37, 35, 20, 0, 0, 1, 0, false, NULL);
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (23, 25, 17, 0, 0, 1, 0, true, '2025-05-01 17:04:05.026372');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (21, 23, 17, 0, 0, 1, 0, true, '2025-05-01 17:13:01.803343');
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (40, 25, 17, 0, 0, 1, 0, false, NULL);
INSERT INTO position_department (position_link_id, position_id, department_id, staff_units, current_count, vacancies, sort, deleted, deleted_at) VALUES (41, 23, 17, 0, 0, 1, 0, false, NULL);

-- Reset sequences
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('positions_position_id_seq', (SELECT MAX(position_id) FROM positions));
SELECT setval('departments_department_id_seq', (SELECT MAX(department_id) FROM departments));
SELECT setval('position_position_position_relation_id_seq', (SELECT MAX(position_relation_id) FROM position_position));
SELECT setval('employees_employee_id_seq', (SELECT MAX(employee_id) FROM employees));
SELECT setval('position_department_position_link_id_seq', (SELECT MAX(position_link_id) FROM position_department));
SELECT setval('projects_project_id_seq', (SELECT MAX(project_id) FROM projects));
SELECT setval('leaves_leave_id_seq', GREATEST((SELECT COALESCE(MAX(leave_id), 0) FROM leaves), 1));
SELECT setval('settings_id_seq', GREATEST((SELECT COALESCE(MAX(id), 0) FROM settings), 1));