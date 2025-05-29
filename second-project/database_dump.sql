-- Complete PostgreSQL Database Dump
-- Generated on demand with full schema and data
-- Using INSERT INTO statements instead of COPY

-- Drop existing tables if they exist
DROP TABLE IF EXISTS employee_project_roles CASCADE;
DROP TABLE IF EXISTS project_roles CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS employee_positions CASCADE;
DROP TABLE IF EXISTS org_units CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS positions CASCADE;

-- Create tables with proper structure
CREATE TABLE departments (
    id INTEGER NOT NULL,
    name TEXT NOT NULL,
    logo_path TEXT,
    is_managment BOOLEAN
);

CREATE TABLE employee_positions (
    id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    org_unit_id INTEGER NOT NULL,
    is_head BOOLEAN,
    assigned_at TIMESTAMP,
    position_id INTEGER
);

CREATE TABLE employee_project_roles (
    id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    project_role_id INTEGER NOT NULL,
    created_at TIMESTAMP
);

CREATE TABLE employees (
    id INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    position_id INTEGER,
    department_id INTEGER,
    manager_id INTEGER,
    created_at TIMESTAMP,
    legacy_id INTEGER
);

CREATE TABLE org_units (
    id INTEGER NOT NULL,
    type TEXT NOT NULL,
    type_id INTEGER NOT NULL,
    parent_id INTEGER,
    staff_count INTEGER,
    logo TEXT,
    head_employee_id INTEGER,
    head_position_id INTEGER,
    position_x REAL,
    position_y REAL,
    created_at TIMESTAMP
);

CREATE TABLE organizations (
    id INTEGER NOT NULL,
    name TEXT NOT NULL,
    logo_path TEXT
);

CREATE TABLE positions (
    id INTEGER NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE project_roles (
    id INTEGER NOT NULL,
    name TEXT NOT NULL,
    project_id INTEGER NOT NULL,
    created_at TIMESTAMP
);

CREATE TABLE projects (
    id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP
);

-- Add primary key constraints
ALTER TABLE departments ADD CONSTRAINT departments_pkey PRIMARY KEY (id);
ALTER TABLE employee_positions ADD CONSTRAINT employee_positions_pkey PRIMARY KEY (id);
ALTER TABLE employee_project_roles ADD CONSTRAINT employee_project_roles_pkey PRIMARY KEY (id);
ALTER TABLE employees ADD CONSTRAINT employees_pkey PRIMARY KEY (id);
ALTER TABLE org_units ADD CONSTRAINT org_units_pkey PRIMARY KEY (id);
ALTER TABLE organizations ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);
ALTER TABLE positions ADD CONSTRAINT positions_pkey PRIMARY KEY (id);
ALTER TABLE project_roles ADD CONSTRAINT project_roles_pkey PRIMARY KEY (id);
ALTER TABLE projects ADD CONSTRAINT projects_pkey PRIMARY KEY (id);

-- Insert data into tables

-- Organizations table
INSERT INTO organizations (id, name, logo_path) VALUES (1, 'ГБУ МСИ', '/uploads/logo-1747640004458-28298313.png');
INSERT INTO organizations (id, name, logo_path) VALUES (2, 'ООО "Цифролаб"', null);

-- Positions table
INSERT INTO positions (id, name) VALUES (1, 'тесто');
INSERT INTO positions (id, name) VALUES (2, 'Заместитель руководителя департамента');
INSERT INTO positions (id, name) VALUES (3, 'Генеральный директор');
INSERT INTO positions (id, name) VALUES (4, 'Заместитель генерального директора по координации реализации планов ОИВ');
INSERT INTO positions (id, name) VALUES (5, 'Заместитель генерального директора по координации аналитики');
INSERT INTO positions (id, name) VALUES (6, 'Советник');
INSERT INTO positions (id, name) VALUES (7, 'Заместитель генерального директора по координации разработки');
INSERT INTO positions (id, name) VALUES (8, 'Исполнительный директор');
INSERT INTO positions (id, name) VALUES (41, 'Главный специалист');
INSERT INTO positions (id, name) VALUES (45, 'Заместитель начальника управления');
INSERT INTO positions (id, name) VALUES (46, 'Руководитель проекта');
INSERT INTO positions (id, name) VALUES (47, 'Администратор проекта');
INSERT INTO positions (id, name) VALUES (48, 'Главный эксперт');
INSERT INTO positions (id, name) VALUES (54, 'Начальник отдела (Руководитель команды)');
INSERT INTO positions (id, name) VALUES (56, 'Главный бухгалтер');
INSERT INTO positions (id, name) VALUES (57, 'Специалист по бухгалтерскому учету и отчетности ');
INSERT INTO positions (id, name) VALUES (58, 'Специалист по охране труда');
INSERT INTO positions (id, name) VALUES (59, 'Специалист по административно-хозяйственному обеспечению');
INSERT INTO positions (id, name) VALUES (60, 'Специалист по подбору персонала');
INSERT INTO positions (id, name) VALUES (61, 'Руководитель направления закупочной деятельности');
INSERT INTO positions (id, name) VALUES (62, 'Руководитель направления кадрового администрирования');
INSERT INTO positions (id, name) VALUES (63, 'Руководитель направления правового обеспечения');
INSERT INTO positions (id, name) VALUES (64, 'Юрист');
INSERT INTO positions (id, name) VALUES (65, 'Руководитель отдела тестирования');
INSERT INTO positions (id, name) VALUES (66, 'Главный тестировщик');
INSERT INTO positions (id, name) VALUES (67, 'Ведущий тестировщик');
INSERT INTO positions (id, name) VALUES (68, 'Тестировщик');
INSERT INTO positions (id, name) VALUES (69, 'Руководитель проекта');
INSERT INTO positions (id, name) VALUES (70, 'Заместитель руководителя проекта');
INSERT INTO positions (id, name) VALUES (71, 'Главный аналитик');
INSERT INTO positions (id, name) VALUES (72, 'Ведущий аналитик');
INSERT INTO positions (id, name) VALUES (73, 'Старший аналитик');
INSERT INTO positions (id, name) VALUES (74, 'Администратор');
INSERT INTO positions (id, name) VALUES (75, 'Аналитик');
INSERT INTO positions (id, name) VALUES (76, 'Ведущий аналитик СУИД');
INSERT INTO positions (id, name) VALUES (77, 'Младший аналитик');
INSERT INTO positions (id, name) VALUES (78, 'Аналитик-координатор');
INSERT INTO positions (id, name) VALUES (80, 'Ведущий разработчик');
INSERT INTO positions (id, name) VALUES (83, 'Специалист по цифровым решениям');
INSERT INTO positions (id, name) VALUES (90, 'Главный разработчик I категории');
INSERT INTO positions (id, name) VALUES (91, 'Главный разработчик II категории');
INSERT INTO positions (id, name) VALUES (92, 'Старший разработчик I категории');
INSERT INTO positions (id, name) VALUES (93, 'Старший разработчик II категории');
INSERT INTO positions (id, name) VALUES (94, 'Старший разработчик III категории');
INSERT INTO positions (id, name) VALUES (95, 'Старший разработчик IV категории');
INSERT INTO positions (id, name) VALUES (96, 'Разработчик II категории');
INSERT INTO positions (id, name) VALUES (97, 'Разработчик III категории');
INSERT INTO positions (id, name) VALUES (98, 'Разработчик IV категории');
INSERT INTO positions (id, name) VALUES (99, 'Специалист по цифровым решениям I категории');
INSERT INTO positions (id, name) VALUES (100, 'Специалист по цифровым решениям II категории');
INSERT INTO positions (id, name) VALUES (101, 'Специалист по цифровым решениям III категории');
INSERT INTO positions (id, name) VALUES (102, 'Специалист по цифровым решениям IV категории');
INSERT INTO positions (id, name) VALUES (103, 'Специалист по цифровым решениям V категории');
INSERT INTO positions (id, name) VALUES (104, 'Специалист по цифровым решениям IV категории');
INSERT INTO positions (id, name) VALUES (105, 'Разработчик I категории');
INSERT INTO positions (id, name) VALUES (106, 'Руководитель проектов по эксплуатации информационных систем');
INSERT INTO positions (id, name) VALUES (107, 'Начальник отдела - Руководитель блока');
INSERT INTO positions (id, name) VALUES (108, 'Ведущий специалист информационной безопасности');
INSERT INTO positions (id, name) VALUES (109, 'Специалист информационной безопасности');
INSERT INTO positions (id, name) VALUES (110, 'Архитектор');
INSERT INTO positions (id, name) VALUES (111, 'Системный администратор');
INSERT INTO positions (id, name) VALUES (112, 'Технический писатель');
INSERT INTO positions (id, name) VALUES (113, 'Системный инженер I категории');
INSERT INTO positions (id, name) VALUES (114, 'Системный инженер II категории');
INSERT INTO positions (id, name) VALUES (115, 'Системный инженер III категории');
INSERT INTO positions (id, name) VALUES (116, 'Системный инженер IV категории');
INSERT INTO positions (id, name) VALUES (117, 'Ведущий дизайнер интерфейсов');
INSERT INTO positions (id, name) VALUES (118, 'Специалист технической поддержки');
INSERT INTO positions (id, name) VALUES (119, 'Дизайнер интерфейсов');
INSERT INTO positions (id, name) VALUES (120, 'Дизайнер');
INSERT INTO positions (id, name) VALUES (121, 'Начальник управления');
INSERT INTO positions (id, name) VALUES (122, 'Ведущий специалист');
INSERT INTO positions (id, name) VALUES (123, 'Ведущий дизайнер');

-- Departments table
INSERT INTO departments (id, name, logo_path, is_managment) VALUES (1, 'Администрация', null, false);
INSERT INTO departments (id, name, logo_path, is_managment) VALUES (2, 'Отдел координации аналитики ПО Строительство', null, false);
INSERT INTO departments (id, name, logo_path, is_managment) VALUES (3, 'Управление цифрового развития', null, true);
INSERT INTO departments (id, name, logo_path, is_managment) VALUES (4, 'Отдел координации реализации планов ОИВ', null, false);
INSERT INTO departments (id, name, logo_path, is_managment) VALUES (5, 'Управление цифровизации и градостроительных данных', null, true);
INSERT INTO departments (id, name, logo_path, is_managment) VALUES (6, 'Отдел координации аналитики ПО Земля', null, false);
INSERT INTO departments (id, name, logo_path, is_managment) VALUES (7, 'Отдел координации аналитики ПО Градрешения', null, false);
INSERT INTO departments (id, name, logo_path, is_managment) VALUES (8, 'Отдел координации аналитики ПО Аналитики и Мониторинга', null, false);
INSERT INTO departments (id, name, logo_path, is_managment) VALUES (9, 'Отдел координации разработки', null, false);
INSERT INTO departments (id, name, logo_path, is_managment) VALUES (10, 'Отдел инженерного обеспечения', null, false);
INSERT INTO departments (id, name, logo_path, is_managment) VALUES (11, 'Отдел тестирования', null, false);
INSERT INTO departments (id, name, logo_path, is_managment) VALUES (12, 'Отдел координации деятельности', null, false);

-- Employees table
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (1, 'Самарин Иван Юрьевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 20);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (2, 'Тюрькин Евгений Андреевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 21);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (3, 'Дремин Андрей', null, null, null, null, null, '2025-05-22 21:21:11.374598', 22);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (4, 'Попов Андрей Михайлович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 24);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (5, 'Коробчану Евгений Юрьевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 25);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (6, 'Чурилова Светлана Михайловна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 26);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (7, 'Воробей Сергей Викторович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 29);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (8, 'Шедевр Олеся', null, null, null, null, null, '2025-05-22 21:21:11.374598', 30);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (9, 'Миронова Екатерина Павловна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 31);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (10, 'Зелинский Андрей Николаевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 32);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (11, 'Молева Анастасия Алексеевна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 33);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (12, 'Акимов Александр Викторович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 34);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (13, 'Короткова Олеся Эдуардовна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 35);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (14, 'Веревкина Ольга Дмитриевна', null, null, 121, null, null, '2025-05-22 21:21:11.374598', 36);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (15, 'Горошкевич Оксана Александровна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 37);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (16, 'Замарина Юлия Валентиновна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 38);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (17, 'Молева Дарья Алексеевна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 39);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (18, 'Похлоненко Александр Михайлович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 40);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (19, 'Печенкин Алексей Викторович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 41);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (20, 'Молева Дарья Алексеевна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 42);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (21, 'Мусаева Джамиля Лом-Алиевна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 44);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (22, 'Вегерин Евгений Алексеевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 43);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (23, 'Акимов Михаил Александрович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 45);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (24, 'Дупенко Владимир Сергеевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 46);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (25, 'Крохалевский Игорь Владимирович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 47);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (26, 'Гутеев Роберт Андреевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 48);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (27, 'Шатский Никита Александрович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 49);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (28, 'Кунец Анастасия Леонидовна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 51);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (29, 'Щербаков Николай Владимирович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 52);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (30, 'Аскерова Елизавета Васильевна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 53);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (31, 'Гетманская Валерия Владимировна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 54);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (32, 'Зайцева Кристина Константиновна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 55);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (33, 'Устинович Юлиана Феликсовна ', null, null, null, null, null, '2025-05-22 21:21:11.374598', 56);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (34, 'Терновский Андрей Викторович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 58);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (35, 'Буланцева Дарья Андреевна', null, null, 121, null, null, '2025-05-22 21:21:11.374598', 59);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (36, 'Колпашников Константин Михайлович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 66);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (37, 'Вишневский Павел Александрович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 65);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (38, 'Луканин Александр Валерьевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 67);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (39, 'Якушев Григорий Витальевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 68);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (40, 'Пьяных Евгений Николаевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 69);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (41, 'Тедеева Линда Ростиславовна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 70);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (42, 'Беликова Вероника Георгиевна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 71);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (43, 'Дорохина Елена Сергеевна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 72);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (44, 'Панов Егор Викторович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 73);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (45, 'Гилязова Ляйсан Анваровна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 77);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (46, 'Коляндра Наталина Павловна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 82);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (47, 'Савченко Максим Павлович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 83);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (48, 'Подгорный Александр Владимирович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 57);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (49, 'Полякова Екатерина Валентиновна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 74);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (50, 'Ануфриев Иван Дмитриевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 75);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (51, 'Данилкин Сергей Александрович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 76);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (52, 'Бубненкова Елена Вячеславовна', null, null, 121, null, null, '2025-05-22 21:21:11.374598', 27);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (53, 'Крюков Роман Николаевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 80);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (54, 'Вишневская Светлана Александровна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 81);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (55, 'Назаров Алексей Викторович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 84);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (56, 'Карклис Алина Дмитриевна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 85);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (57, 'Белякова Анна Сергеевна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 87);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (58, 'Тураев Глеб Вадимович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 88);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (59, 'Гильманшин Георгий Данилович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 89);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (60, 'Давыдова Полина Сергеевна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 90);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (61, 'Куров Иван Александрович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 92);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (62, 'Джиндоев Юрий Мосесович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 94);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (63, 'Асрян Артем Камоевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 95);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (64, 'Косягин Дмитрий Сергеевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 64);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (65, 'Зиндеева Елена Леонидовна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 60);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (66, 'Шатунова Юлия Викторовна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 62);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (67, 'Иевская Анастасия Сергеевна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 63);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (68, 'Сизёнова Анастасия Сергеевна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 79);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (69, 'Чащин Павел Леонидович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 78);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (70, 'Сухов Николай Николаевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 123);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (71, 'Степанова Дарья Владимировна', 'admin@test.ru', '+71111111111', null, null, null, '2025-05-22 21:21:11.374598', 18);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (72, 'Захарова Полина Андреевна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 28);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (73, 'Шивцов Максим Владимирович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 50);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (74, 'Коваленко Ольга Андреевна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 1);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (75, 'Лапенкова Наталья Владимировна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 2);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (76, 'Долгов Кирилл Сергеевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 3);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (77, 'Филимонов Алексей Алексеевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 130);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (78, 'Кузнеченко Дмитрий Александрович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 4);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (79, 'Хиялов Аламшад Залимхан', null, null, null, null, null, '2025-05-22 21:21:11.374598', 5);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (80, 'Черняк Наталья Андреевна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 6);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (81, 'Хуртина Екатерина Денисовна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 7);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (82, 'Жуков Дмитрий Владимирович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 8);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (83, 'Корягина Наталья Владимировна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 9);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (84, 'Ширяева Лайло Бойназаровна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 10);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (85, 'Свеженцева Капитолина Владимировна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 11);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (86, 'Жданова Наталия Витальевна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 12);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (87, 'Чучалин Кирилл Владимирович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 13);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (88, 'Ямаева Ильвира Ирековна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 86);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (89, 'Месяцева Наталья Вячеславовна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 91);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (90, 'Гарнага Алексей Анатольевич', null, null, 7, null, null, '2025-05-22 21:21:11.374598', 93);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (91, 'Пономарев Ярослав Валериевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 96);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (92, 'Кораблев Денис Алексеевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 103);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (93, 'Шабельников Андрей Владиленович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 104);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (94, 'Магафуров Айрат Раилевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 107);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (95, 'Чалоян Бемал Андраникович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 99);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (96, 'Гайсуев Ислам Русланович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 100);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (97, 'Коваленко Юрий Александрович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 112);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (98, 'Мальцев Никита Вадимович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 14);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (99, 'Измайлов Станислав Юрьевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 101);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (100, 'Шилик Павел Олегович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 106);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (101, 'Боровков Егор Николаевич', null, null, 46, null, null, '2025-05-22 21:21:11.374598', 108);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (102, 'Бауров Алексей Владимирович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 109);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (103, 'Зятковский Владислав Олегович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 110);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (104, 'Полянский Борис Петрович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 111);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (105, 'Ражев Иван Юрьевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 113);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (106, 'Раченко Вячеслав Александрович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 114);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (107, 'Прокопьев Вячеслав Алексеевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 115);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (108, 'Абрамов Руслан Владимирович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 116);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (109, 'Дашкин Богдан Владимирович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 117);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (110, 'Попов Сергей Павлович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 118);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (111, 'Орлов Павел Александрович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 119);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (112, 'Виденин Юрий Алексеевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 15);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (113, 'Щербаков Ярослав Юрьевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 120);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (114, 'Салахутдинов Марат Рамилевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 121);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (115, 'Ермаков Алексей Владимирович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 105);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (116, 'Зайцева Наталья Владимировна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 122);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (117, 'Соловьев Владислав Романович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 16);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (118, 'Байков Михаил Сергеевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 124);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (119, 'Пресняков Илья Сергеевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 17);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (120, 'Леденев Сергей Александрович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 125);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (121, 'Красильникова Анна Алексеевна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 131);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (122, 'Пак Валерия Викторовна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 126);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (123, 'Пинчук Екатерина Сергеевна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 127);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (124, 'Халикова Элеонора Шахруховна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 128);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (125, 'Аркадьева Олеся Александровна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 129);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (126, 'Котик Алисия Александровна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 132);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (127, 'Ширяев Артём Игоревич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 133);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (128, 'Призенцев Иван Александрович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 61);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (129, 'Герц Владимир Андреевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 19);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (130, 'Микляева Галина Сергеевна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 23);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (131, 'Бородин Денис Геннадиевич', null, null, null, null, null, '2025-05-22 21:21:11.374598', 134);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (132, 'Никишова Анастасия Васильевна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 135);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (133, 'Сапожникова Алексия Федоровна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 136);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (134, 'Койнак Марина Петровна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 137);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (135, 'Мещеряков Денис Александрович', null, null, null, null, null, '2025-05-22 21:21:11.374598', 138);
INSERT INTO employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) VALUES (136, 'Землякова Тамара Алексеевна', null, null, null, null, null, '2025-05-22 21:21:11.374598', 139);

-- Org Units table
INSERT INTO org_units (id, type, type_id, parent_id, staff_count, logo, head_employee_id, head_position_id, position_x, position_y, created_at) VALUES (7, 'organization', 1, 93, 1, null, null, null, 456, 308, '2025-05-23 08:58:01.745447');
INSERT INTO org_units (id, type, type_id, parent_id, staff_count, logo, head_employee_id, head_position_id, position_x, position_y, created_at) VALUES (14, 'organization', 2, 93, 1, null, null, null, 902, 308, '2025-05-23 09:05:41.331148');
INSERT INTO org_units (id, type, type_id, parent_id, staff_count, logo, head_employee_id, head_position_id, position_x, position_y, created_at) VALUES (17, 'position', 3, 14, 1, null, null, null, 1194, 391, '2025-05-23 09:10:58.730673');
INSERT INTO org_units (id, type, type_id, parent_id, staff_count, logo, head_employee_id, head_position_id, position_x, position_y, created_at) VALUES (18, 'position', 4, 17, 1, null, null, null, 1510, 556, '2025-05-23 09:24:16.425412');
INSERT INTO org_units (id, type, type_id, parent_id, staff_count, logo, head_employee_id, head_position_id, position_x, position_y, created_at) VALUES (19, 'position', 5, 17, 1, null, null, null, 1060.0667, 558, '2025-05-23 09:42:08.22038');
INSERT INTO org_units (id, type, type_id, parent_id, staff_count, logo, head_employee_id, head_position_id, position_x, position_y, created_at) VALUES (20, 'position', 7, 17, 1, null, null, null, 1280, 556, '2025-05-23 09:59:28.00076');
INSERT INTO org_units (id, type, type_id, parent_id, staff_count, logo, head_employee_id, head_position_id, position_x, position_y, created_at) VALUES (21, 'position', 8, 17, 1, null, null, null, 694, 465, '2025-05-23 10:02:54.035815');
INSERT INTO org_units (id, type, type_id, parent_id, staff_count, logo, head_employee_id, head_position_id, position_x, position_y, created_at) VALUES (22, 'department', 3, 7, 1, null, null, null, 216, 496, '2025-05-23 10:31:45.144291');
INSERT INTO org_units (id, type, type_id, parent_id, staff_count, logo, head_employee_id, head_position_id, position_x, position_y, created_at) VALUES (24, 'department', 12, 21, 1, null, null, null, 617, 672, '2025-05-23 13:21:13.126146');
INSERT INTO org_units (id, type, type_id, parent_id, staff_count, logo, head_employee_id, head_position_id, position_x, position_y, created_at) VALUES (93, 'position', 2, null, 1, null, null, null, 664, 58, '2025-05-22 21:45:04.174105');

-- Employee Positions table (currently empty)
-- INSERT INTO employee_positions (id, employee_id, org_unit_id, is_head, assigned_at, position_id) VALUES ();

-- Projects table (currently empty)
-- INSERT INTO projects (id, name, description, status, created_at) VALUES ();

-- Project Roles table (currently empty)
-- INSERT INTO project_roles (id, name, project_id, created_at) VALUES ();

-- Employee Project Roles table (currently empty)
-- INSERT INTO employee_project_roles (id, employee_id, project_role_id, created_at) VALUES ();

-- Add foreign key constraints for data integrity
ALTER TABLE employee_positions ADD CONSTRAINT fk_employee_positions_employee_id FOREIGN KEY (employee_id) REFERENCES employees (id);
ALTER TABLE employee_positions ADD CONSTRAINT fk_employee_positions_org_unit_id FOREIGN KEY (org_unit_id) REFERENCES org_units (id);
ALTER TABLE employee_positions ADD CONSTRAINT fk_employee_positions_position_id FOREIGN KEY (position_id) REFERENCES positions (id);

ALTER TABLE employee_project_roles ADD CONSTRAINT fk_employee_project_roles_employee_id FOREIGN KEY (employee_id) REFERENCES employees (id);
ALTER TABLE employee_project_roles ADD CONSTRAINT fk_employee_project_roles_project_role_id FOREIGN KEY (project_role_id) REFERENCES project_roles (id);

ALTER TABLE employees ADD CONSTRAINT fk_employees_position_id FOREIGN KEY (position_id) REFERENCES positions (id);
ALTER TABLE employees ADD CONSTRAINT fk_employees_department_id FOREIGN KEY (department_id) REFERENCES departments (id);
ALTER TABLE employees ADD CONSTRAINT fk_employees_manager_id FOREIGN KEY (manager_id) REFERENCES employees (id);

ALTER TABLE org_units ADD CONSTRAINT fk_org_units_parent_id FOREIGN KEY (parent_id) REFERENCES org_units (id);
ALTER TABLE org_units ADD CONSTRAINT fk_org_units_head_employee_id FOREIGN KEY (head_employee_id) REFERENCES employees (id);
ALTER TABLE org_units ADD CONSTRAINT fk_org_units_head_position_id FOREIGN KEY (head_position_id) REFERENCES positions (id);

ALTER TABLE project_roles ADD CONSTRAINT fk_project_roles_project_id FOREIGN KEY (project_id) REFERENCES projects (id);

-- Create sequences for auto-incrementing IDs
CREATE SEQUENCE IF NOT EXISTS departments_id_seq START WITH 13;
CREATE SEQUENCE IF NOT EXISTS employee_positions_id_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS employee_project_roles_id_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS employees_id_seq START WITH 137;
CREATE SEQUENCE IF NOT EXISTS org_units_id_seq START WITH 94;
CREATE SEQUENCE IF NOT EXISTS organizations_id_seq START WITH 3;
CREATE SEQUENCE IF NOT EXISTS positions_id_seq START WITH 124;
CREATE SEQUENCE IF NOT EXISTS project_roles_id_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS projects_id_seq START WITH 1;

-- Set sequence ownership
ALTER SEQUENCE departments_id_seq OWNED BY departments.id;
ALTER SEQUENCE employee_positions_id_seq OWNED BY employee_positions.id;
ALTER SEQUENCE employee_project_roles_id_seq OWNED BY employee_project_roles.id;
ALTER SEQUENCE employees_id_seq OWNED BY employees.id;
ALTER SEQUENCE org_units_id_seq OWNED BY org_units.id;
ALTER SEQUENCE organizations_id_seq OWNED BY organizations.id;
ALTER SEQUENCE positions_id_seq OWNED BY positions.id;
ALTER SEQUENCE project_roles_id_seq OWNED BY project_roles.id;
ALTER SEQUENCE projects_id_seq OWNED BY projects.id;

-- End of database dump