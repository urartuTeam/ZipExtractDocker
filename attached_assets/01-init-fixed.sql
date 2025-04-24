-- Создание таблиц
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departments (
  department_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  parent_department_id INTEGER
);

CREATE TABLE IF NOT EXISTS positions (
  position_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  department_id INTEGER REFERENCES departments(department_id),
  staff_units INTEGER DEFAULT 0,
  current_count INTEGER DEFAULT 0,
  vacancies INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS position_department (
  position_link_id SERIAL PRIMARY KEY,
  position_id INTEGER REFERENCES positions(position_id),
  department_id INTEGER REFERENCES departments(department_id),
  sort INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS employees (
  employee_id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  position_id INTEGER REFERENCES positions(position_id),
  phone TEXT,
  email TEXT,
  manager_id INTEGER,
  department_id INTEGER REFERENCES departments(department_id)
);

CREATE TABLE IF NOT EXISTS projects (
  project_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  department_id INTEGER REFERENCES departments(department_id)
);

CREATE TABLE IF NOT EXISTS employeeprojects (
  employee_id INTEGER REFERENCES employees(employee_id),
  project_id INTEGER REFERENCES projects(project_id),
  role TEXT NOT NULL,
  PRIMARY KEY (employee_id, project_id)
);

CREATE TABLE IF NOT EXISTS leaves (
  leave_id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(employee_id),
  start_date DATE NOT NULL,
  end_date DATE,
  type TEXT NOT NULL
);

-- Добавление тестового пользователя (пароль: admin)
INSERT INTO users (username, email, password) 
VALUES ('admin', 'admin@example.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918');

-- 1. Сначала вставляем записи в таблицу departments
INSERT INTO departments (department_id, name, parent_department_id)
VALUES
  (1, 'Администрация', null),
  (31, 'Главное управление', null),
  (32, 'Зам. директора по координации аналитики', 31),
  (33, 'Зам. генерального директора по координации разработки', 31),
  (34, 'Зам. генерального директора по координации реализации планов ОИВ', 31),
  (35, 'Управление цифровизации и градостроительных данных', 31),
  (36, 'Управление цифрового развития', 31),
  (37, 'Отдел координации деятельности', 31),
  (38, 'Отдел координации аналитики ПО Строительство', 32),
  (39, 'Отдел координации аналитики ПО Земля', 32),
  (40, 'Отдел координации аналитики ПО Аналитики и мониторинга', 32),
  (41, 'Отдел координации аналитики ПО Градрешения', 32),
  (42, 'Отдел тестирования', 33),
  (43, 'Отдел инженерного обеспечения', 33),
  (44, 'Отдел координации разработки', 33),
  (45, 'Отдел координации реализации планов ОИВ', 34);

-- 2. Вставляем записи в таблицу positions
INSERT INTO positions (position_id, name, department_id, staff_units, current_count, vacancies)
VALUES
  (1, 'Директор', 1, 1, 1, 0),
  (2, 'Менеджер', 1, 10, 8, 2),
  (3, 'Руководитель отдела', 32, 5, 5, 0),
  (4, 'Руководитель проекта', 33, 8, 6, 2),
  (5, 'Главный аналитик', 32, 3, 3, 0),
  (6, 'Старший разработчик', 33, 5, 4, 1),
  (7, 'Разработчик', 33, 12, 10, 2),
  (8, 'Тестировщик', 42, 8, 7, 1),
  (9, 'Аналитик', 40, 6, 6, 0),
  (10, 'Дизайнер', 36, 4, 3, 1),
  (11, 'Системный администратор', 43, 2, 2, 0),
  (12, 'Главный инженер', 43, 1, 1, 0),
  (13, 'Руководитель тестирования', 42, 1, 1, 0),
  (14, 'Координатор проектов', 37, 2, 2, 0),
  (15, 'Менеджер по работе с клиентами', 34, 3, 3, 0),
  (16, 'DevOps инженер', 43, 2, 2, 0),
  (17, 'Product Owner', 35, 3, 3, 0),
  (18, 'Scrum Master', 36, 2, 2, 0),
  (19, 'Архитектор ПО', 33, 2, 2, 0),
  (20, 'Технический писатель', 37, 1, 1, 0),
  (21, 'Специалист по данным', 35, 4, 3, 1),
  (22, 'Специалист по машинному обучению', 40, 2, 1, 1),
  (23, 'Главный специалист', 38, 2, 2, 0),
  (24, 'Ведущий инженер', 43, 3, 3, 0),
  (25, 'Ведущий разработчик', 33, 5, 5, 0),
  (26, 'Ведущий аналитик', 39, 3, 3, 0);

-- 3. Вставляем записи в таблицу employees
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id)
VALUES
  (1, 'Иванов Иван Иванович', 1, '+7 (111) 111-11-11', 'ivanov@example.com', null, 1),
  (2, 'Петров Петр Петрович', 2, '+7 (222) 222-22-22', 'petrov@example.com', 1, 1),
  (3, 'Сидорова Анна Владимировна', 3, '+7 (333) 333-33-33', 'sidorova@example.com', 1, 32),
  (4, 'Козлов Алексей Сергеевич', 4, '+7 (444) 444-44-44', 'kozlov@example.com', 1, 33),
  (17, 'Косягин Дмитрий Сергеевич', 7, null, null, 3, null),
  (18, 'Сухов Николай Николаевич', 11, null, null, 3, null),
  (19, 'Леденев Сергей Александрович', 19, null, null, 3, null),
  (20, 'Байков Михаил Сергеевич', 16, null, null, 3, null),
  (21, 'Пак Валерия Викторовна', 24, null, null, 3, null),
  (22, 'Пинчук Екатерина Сергеевна', 24, null, null, 3, null),
  (23, 'Халикова Элеонора Шахруховна', 25, null, null, 3, null),
  (24, 'Аркадьева Олеся Александровна', 25, null, null, 3, null),
  (25, 'Гилязова Ляйсан Анваровна', 26, null, null, 2, null),
  (26, 'Горошкевич Оксана Александровна', 25, null, null, 3, null),
  (27, 'Панов Егор Викторович', 19, null, null, 2, null),
  (28, 'Полякова Екатерина Валентиновна', 9, null, null, 27, null),
  (29, 'Данилкин Сергей Александрович', 7, null, null, 27, null),
  (30, 'Филимонов Алексей Алексеевич', 7, null, null, 27, null),
  (31, 'Ануфриев Иван Дмитриевич', 7, null, null, 27, null),
  (32, 'Чащин Павел Леонидович', 4, null, null, 2, null),
  (33, 'Сизёнова Анастасия Сергеевна', 9, null, null, 32, null),
  (34, 'Крюков Роман Николаевич', 9, null, null, 32, null),
  (35, 'Вишневская Светлана Александровна', 9, null, null, null, null),
  (36, 'Вишневский Павел Александрович', 4, null, null, 4, null),
  (37, 'Колпашников Константин Михайлович', 7, null, null, 36, null),
  (38, 'Луканин Александр Валерьевич', 7, null, null, 36, null),
  (39, 'Якушев Григорий Витальевич', 7, null, null, 36, null),
  (40, 'Пьяных Евгений Николаевич', 7, null, null, 36, null),
  (41, 'Тедеева Линда Ростиславовна', 9, null, null, 36, null),
  (42, 'Беликова Вероника Георгиевна', 9, null, null, 36, null),
  (43, 'Дорохина Елена Сергеевна', 9, null, null, 36, null),
  (44, 'Самарин Иван Юрьевич', 4, null, null, 1, null),
  (45, 'Тюрькин Евгений Андреевич', 4, null, null, 1, null),
  (46, 'Попов Андрей Михайлович', 7, null, null, 44, null),
  (47, 'Коробчану Евгений Юрьевич', 7, null, null, 44, null),
  (48, 'Чурилова Светлана Михайловна', 9, null, null, 44, null),
  (49, 'Миронова Екатерина Павловна', 9, null, null, 44, null),
  (50, 'Зелинский Андрей Николаевич', 7, null, null, 44, null),
  (51, 'Молева Анастасия Алексеевна', 9, null, null, 44, null),
  (52, 'Гетманская Валерия Владимировна', 9, null, null, 44, null),
  (53, 'Зайцева Кристина Константиновна', 9, null, null, 44, null),
  (54, 'Устинович Юлиана Феликсовна', 9, null, null, 44, null),
  (55, 'Замарина Юлия Валентиновна', 9, null, null, 44, null),
  (56, 'Молева Дарья Алексеевна', 9, null, null, 44, null),
  (57, 'Похлоненко Александр Михайлович', 7, null, null, 44, null),
  (58, 'Печенкин Алексей Викторович', 7, null, null, 44, null),
  (59, 'Веревкина Ольга Дмитриевна', 9, null, null, 44, null),
  (60, 'Дремин Андрей', 4, null, null, 1, null),
  (61, 'Микляева Галина Сергеевна', 4, null, null, 1, null),
  (62, 'Акимов Александр Викторович', 7, null, null, 60, null),
  (63, 'Короткова Олеся Эдуардовна', 9, null, null, 60, null),
  (64, 'Акимов Михаил Александрович', 7, null, null, 60, null),
  (65, 'Дупенко Владимир Сергеевич', 7, null, null, 60, null),
  (66, 'Крохалевский Игорь Владимирович', 7, null, null, 60, null),
  (67, 'Гутеев Роберт Андреевич', 7, null, null, 60, null),
  (68, 'Шатский Никита Александрович', 7, null, null, 60, null),
  (69, 'Шивцов Максим Владимирович', 7, null, null, 60, null),
  (70, 'Кунец Анастасия Леонидовна', 9, null, null, 60, null),
  (71, 'Щербаков Николай Владимирович', 7, null, null, 60, null),
  (72, 'Вегерин Евгений Алексеевич', 7, null, null, 60, null),
  (73, 'Мусаева Джамиля Лом-Алиевна', 9, null, null, 60, null),
  (74, 'Аскерова Елизавета Васильевна', 9, null, null, 60, null),
  (75, 'Буланцева Дарья Андреевна', 4, null, null, 1, null),
  (76, 'Ширяев Артём Игоревич', 7, null, null, 75, null),
  (77, 'Призенцев Иван Александрович', 7, null, null, 75, null),
  (78, 'Шатунова Юлия Викторовна', 9, null, null, 75, null),
  (79, 'Иевская Анастасия Сергеевна', 9, null, null, 75, null),
  (80, 'Зиндеева Елена Леонидовна', 9, null, null, 78, null),
  (81, 'Коляндра Наталина Павловна', 4, null, null, 2, null);

-- 4. Вставляем записи в таблицу projects
INSERT INTO projects (project_id, name, department_id)
VALUES
  (1, 'Система управления документами', 33),
  (2, 'Мобильное приложение компании', 36),
  (3, 'Модернизация инфраструктуры', 43),
  (4, 'Система аналитики продаж', 40),
  (5, 'Портал обучения сотрудников', 37),
  (6, 'Платформа для управления задачами', 44),
  (7, 'Система финансовой отчетности', 39),
  (8, 'Разработка корпоративного чат-бота', 36),
  (9, 'Система мониторинга рабочих станций', 43),
  (10, 'Портал для клиентов', 34);

-- 5. Теперь вставляем записи в таблицу employeeprojects
INSERT INTO employeeprojects (employee_id, project_id, role)
VALUES
  (25, 7, 'Ведущий аналитик'),
  (26, 6, 'Главный специалист'),
  (27, 7, 'Руководитель проекта'),
  (28, 7, 'Главный аналитик'),
  (32, 9, 'Руководитель проекта'),
  (36, 8, 'Руководитель проекта'),
  (44, 10, 'Руководитель проекта'),
  (45, 10, 'Руководитель проекта'),
  (60, 6, 'Руководитель проекта'),
  (61, 6, 'Руководитель проекта'),
  (81, 8, 'Руководитель проекта');

-- 6. Вставляем записи в таблицу leaves
INSERT INTO leaves (employee_id, start_date, end_date, type)
VALUES
  (1, '2025-05-01', '2025-05-15', 'Отпуск'),
  (2, '2025-06-10', '2025-06-17', 'Отпуск'),
  (3, '2025-07-20', '2025-07-31', 'Отпуск'),
  (4, '2025-04-15', '2025-04-16', 'Больничный'),
  (25, '2025-08-01', '2025-08-14', 'Отпуск'),
  (36, '2025-09-10', '2025-09-24', 'Отпуск'),
  (44, '2025-05-05', '2025-05-07', 'Больничный');

-- 7. Вставляем записи в таблицу position_department
INSERT INTO position_department (position_id, department_id, sort)
VALUES
  (1, 1, 1),
  (2, 1, 2),
  (3, 32, 1),
  (4, 33, 1),
  (5, 32, 2),
  (6, 33, 2),
  (7, 33, 3),
  (8, 42, 1),
  (9, 40, 1),
  (10, 36, 1),
  (11, 43, 1),
  (12, 43, 2),
  (13, 42, 2),
  (14, 37, 1),
  (15, 34, 1);