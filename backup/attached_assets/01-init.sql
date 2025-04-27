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

insert into public.departments (department_id, name, parent_department_id)
values  (32, 'Зам. директора по координации аналитики', 31),
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
        (45, 'Отдел координации реализации планов ОИВ', 34),
        (1, 'Администрация', null);

insert into public.employeeprojects (employee_id, project_id, role)
values  (25, 7, 'Ведущий аналитик'),
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

insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (17, 'Косягин Дмитрий Сергеевич', 7, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (18, 'Сухов Николай Николаевич', 11, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (19, 'Леденев Сергей Александрович', 19, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (20, 'Байков Михаил Сергеевич', 16, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (21, 'Пак Валерия Викторовна', 24, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (22, 'Пинчук Екатерина Сергеевна', 24, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (23, 'Халикова Элеонора Шахруховна', 25, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (24, 'Аркадьева Олеся Александровна', 25, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (25, 'Гилязова Ляйсан Анваровна', 26, null, null, 2, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (26, 'Горошкевич Оксана Александровна', 25, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (27, 'Панов Егор Викторович', null, null, null, 2, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (28, 'Полякова Екатерина Валентиновна', null, null, null, 27, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (29, 'Данилкин Сергей Александрович', null, null, null, 27, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (30, 'Филимонов Алексей Алексеевич', null, null, null, 27, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (31, 'Ануфриев Иван Дмитриевич', null, null, null, 27, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (32, 'Чащин Павел Леонидович', null, null, null, 2, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (33, 'Сизёнова Анастасия Сергеевна', null, null, null, 32, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (34, 'Крюков Роман Николаевич', null, null, null, 32, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (35, 'Вишневская Светлана Александровна', null, null, null, null, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (36, 'Вишневский Павел Александрович', null, null, null, 4, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (37, 'Колпашников Константин Михайлович', null, null, null, 36, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (38, 'Луканин Александр Валерьевич', null, null, null, 36, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (39, 'Якушев Григорий Витальевич', null, null, null, 36, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (40, 'Пьяных Евгений Николаевич', null, null, null, 36, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (41, 'Тедеева Линда Ростиславовна', null, null, null, 36, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (42, 'Беликова Вероника Георгиевна', null, null, null, 36, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (43, 'Дорохина Елена Сергеевна', null, null, null, 36, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (44, 'Самарин Иван Юрьевич', null, null, null, 1, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (45, 'Тюрькин Евгений Андреевич', null, null, null, 1, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (46, 'Попов Андрей Михайлович', null, null, null, 44, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (47, 'Коробчану Евгений Юрьевич', null, null, null, 44, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (48, 'Чурилова Светлана Михайловна', null, null, null, 44, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (49, 'Миронова Екатерина Павловна', null, null, null, 44, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (50, 'Зелинский Андрей Николаевич', null, null, null, 44, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (51, 'Молева Анастасия Алексеевна', null, null, null, 44, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (52, 'Гетманская Валерия Владимировна', null, null, null, 44, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (53, 'Зайцева Кристина Константиновна', null, null, null, 44, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (54, 'Устинович Юлиана Феликсовна', null, null, null, 44, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (55, 'Замарина Юлия Валентиновна', null, null, null, 44, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (56, 'Молева Дарья Алексеевна', null, null, null, 44, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (57, 'Похлоненко Александр Михайлович', null, null, null, 44, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (58, 'Печенкин Алексей Викторович', null, null, null, 44, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (59, 'Веревкина Ольга Дмитриевна', null, null, null, 44, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (60, 'Дремин Андрей', null, null, null, 1, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (61, 'Микляева Галина Сергеевна', null, null, null, 1, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (62, 'Акимов Александр Викторович', null, null, null, 60, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (63, 'Короткова Олеся Эдуардовна', null, null, null, 60, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (64, 'Акимов Михаил Александрович', null, null, null, 60, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (65, 'Дупенко Владимир Сергеевич', null, null, null, 60, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (66, 'Крохалевский Игорь Владимирович', null, null, null, 60, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (67, 'Гутеев Роберт Андреевич', null, null, null, 60, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (68, 'Шатский Никита Александрович', null, null, null, 60, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (69, 'Шивцов Максим Владимирович', null, null, null, 60, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (70, 'Кунец Анастасия Леонидовна', null, null, null, 60, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (71, 'Щербаков Николай Владимирович', null, null, null, 60, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (72, 'Вегерин Евгений Алексеевич', null, null, null, 60, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (73, 'Мусаева Джамиля Лом-Алиевна', null, null, null, 60, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (74, 'Аскерова Елизавета Васильевна', null, null, null, 60, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (75, 'Буланцева Дарья Андреевна', null, null, null, 1, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (76, 'Ширяев Артём Игоревич', null, null, null, 75, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (77, 'Призенцев Иван Александрович', null, null, null, 75, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (78, 'Шатунова Юлия Викторовна', null, null, null, 75, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (79, 'Иевская Анастасия Сергеевна', null, null, null, 75, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (80, 'Зиндеева Елена Леонидовна', null, null, null, 78, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (81, 'Коляндра Наталина Павловна', null, null, null, 2, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (82, 'Савченко Максим Павлович', null, null, null, 81, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (83, 'Назаров Алексей Викторович', null, null, null, 81, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (84, 'Карклис Алина Дмитриевна', null, null, null, 81, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (85, 'Белякова Анна Сергеевна', null, null, null, 81, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (86, 'Тураев Глеб Вадимович', null, null, null, 81, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (87, 'Ямаева Ильвира Ирековна', null, null, null, 81, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (88, 'Гильманшин Георгий Данилович', null, null, null, 81, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (13, 'Герц Владимир Андреевич', 61, null, null, 16, 1);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (14, 'Подгорный Александр Владимирович', 22, null, null, 1, 1);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (15, 'Терновский Андрей Викторович', 62, null, null, 1, 1);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (89, 'Давыдова Полина Сергеевна', null, null, null, 81, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (90, 'Месяцева Наталья Вячеславовна', null, null, null, 81, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (91, 'Куров Иван Александрович', null, null, null, 81, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (92, 'Бубненкова Елена Вячеславовна', null, null, null, 60, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (93, 'Захарова Полина Андреевна', null, null, null, 60, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (94, 'Воробей Сергей Викторович', null, null, null, 60, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (95, 'Шедевр Олеся', null, null, null, 60, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (123, 'Чащин Павел Леонидович', null, null, null, 2, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (124, 'Сизёнова Анастасия Сергеевна', null, null, null, 123, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (125, 'Крюков Роман Николаевич', null, null, null, 123, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (126, 'Коляндра Наталина Павловна', null, null, null, 2, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (127, 'Савченко Максим Павлович', null, null, null, 126, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (128, 'Назаров Алексей Викторович', null, null, null, 126, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (129, 'Карклис Алина Дмитриевна', null, null, null, 126, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (130, 'Белякова Анна Сергеевна', null, null, null, 126, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (131, 'Тураев Глеб Вадимович', null, null, null, 126, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (132, 'Ямаева Ильвира Ирековна', null, null, null, 126, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (133, 'Гильманшин Георгий Данилович', null, null, null, 126, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (134, 'Давыдова Полина Сергеевна', null, null, null, 126, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (135, 'Месяцева Наталья Вячеславовна', null, null, null, 126, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (136, 'Куров Иван Александрович', null, null, null, 126, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (137, 'Вишневский Павел Александрович', null, null, null, 4, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (138, 'Колпашников Константин Михайлович', null, null, null, 137, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (139, 'Луканин Александр Валерьевич', null, null, null, 137, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (140, 'Якушев Григорий Витальевич', null, null, null, 137, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (141, 'Пьяных Евгений Николаевич', null, null, null, 137, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (142, 'Тедеева Линда Ростиславовна', null, null, null, 137, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (143, 'Беликова Вероника Георгиевна', null, null, null, 137, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (144, 'Дорохина Елена Сергеевна', null, null, null, 137, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (145, 'Самарин Иван Юрьевич', null, null, null, 1, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (146, 'Тюрькин Евгений Андреевич', null, null, null, 1, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (147, 'Попов Андрей Михайлович', null, null, null, 145, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (148, 'Коробчану Евгений Юрьевич', null, null, null, 145, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (149, 'Чурилова Светлана Михайловна', null, null, null, 145, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (150, 'Миронова Екатерина Павловна', null, null, null, 145, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (151, 'Зелинский Андрей Николаевич', null, null, null, 145, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (152, 'Молева Анастасия Алексеевна', null, null, null, 145, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (153, 'Гетманская Валерия Владимировна', null, null, null, 145, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (154, 'Зайцева Кристина Константиновна', null, null, null, 145, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (155, 'Устинович Юлиана Феликсовна', null, null, null, 145, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (156, 'Замарина Юлия Валентиновна', null, null, null, 145, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (157, 'Молева Дарья Алексеевна', null, null, null, 145, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (158, 'Похлоненко Александр Михайлович', null, null, null, 145, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (159, 'Печенкин Алексей Викторович', null, null, null, 145, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (160, 'Веревкина Ольга Дмитриевна', null, null, null, 145, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (161, 'Дремин Андрей', null, null, null, 1, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (162, 'Микляева Галина Сергеевна', null, null, null, 1, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (163, 'Акимов Александр Викторович', null, null, null, 161, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (164, 'Короткова Олеся Эдуардовна', null, null, null, 161, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (165, 'Акимов Михаил Александрович', null, null, null, 161, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (166, 'Дупенко Владимир Сергеевич', null, null, null, 161, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (167, 'Крохалевский Игорь Владимирович', null, null, null, 161, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (168, 'Гутеев Роберт Андреевич', null, null, null, 161, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (169, 'Шатский Никита Александрович', null, null, null, 161, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (170, 'Шивцов Максим Владимирович', null, null, null, 161, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (171, 'Кунец Анастасия Леонидовна', null, null, null, 161, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (172, 'Щербаков Николай Владимирович', null, null, null, 161, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (173, 'Вегерин Евгений Алексеевич', null, null, null, 161, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (174, 'Мусаева Джамиля Лом-Алиевна', null, null, null, 161, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (175, 'Аскерова Елизавета Васильевна', null, null, null, 161, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (176, 'Буланцева Дарья Андреевна', null, null, null, 1, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (177, 'Ширяев Артём Игоревич', null, null, null, 176, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (178, 'Призенцев Иван Александрович', null, null, null, 176, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (179, 'Шатунова Юлия Викторовна', null, null, null, 176, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (180, 'Иевская Анастасия Сергеевна', null, null, null, 176, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (181, 'Зиндеева Елена Леонидовна', null, null, null, 179, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (182, 'Бубненкова Елена Вячеславовна', null, null, null, 161, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (183, 'Захарова Полина Андреевна', null, null, null, 161, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (184, 'Воробей Сергей Викторович', null, null, null, 161, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (185, 'Шедевр Олеся', null, null, null, 161, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (96, 'Гарнага Алексей Анатольевич', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (97, 'Джиндоев Юрий Мосесович', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (98, 'Пономарев Ярослав Валериевич', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (99, 'Кораблев Денис Алексеевич', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (100, 'Шабельников Андрей Владиленович', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (101, 'Чалоян Бемал Андраникович', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (102, 'Гайсуев Ислам Русланович', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (103, 'Асрян Артем Камоевич', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (104, 'Измайлов Станислав Юрьевич', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (105, 'Шилик Павел Олегович', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (106, 'Магафуров Айрат Раилевич', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (107, 'Боровков Егор Николаевич', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (108, 'Бауров Алексей Владимирович', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (109, 'Зятковский Владислав Олегович', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (110, 'Полянский Борис Петрович', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (111, 'Коваленко Юрий Александрович', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (112, 'Ражев Иван Юрьевич', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (113, 'Раченко Вячеслав Александрович', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (114, 'Прокопьев Вячеслав Алексеевич', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (115, 'Абрамов Руслан Владимирович', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (116, 'Дашкин Богдан Владимирович', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (117, 'Попов Сергей Павлович', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (118, 'Орлов Павел Александрович', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (119, 'Щербаков Ярослав Юрьевич', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (120, 'Салахутдинов Марат Рамилевич', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (121, 'Ермаков Алексей Владимирович', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (122, 'Зайцева Наталья Владимировна', null, null, null, 3, null);
insert into public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) values (16, 'Степанова Дарья Владимировна', 60, null, null, null, 1);

insert into public.leaves (leave_id, employee_id, start_date, end_date, type)
values  (1, 26, '2023-01-01', null, 'По уходу за ребенком');

insert into public.position_department (position_link_id, position_id, department_id, sort)
values  (3, 61, 1, 2),
        (2, 60, 1, 1),
        (6, 20, 1, 3),
        (7, 62, 1, 3),
        (9, 22, 1, 3),
        (4, 1, 1, 2),
        (5, 19, 1, 3),
        (15, 63, 1, 4),
        (8, 63, 1, 4);

insert into public.positions (position_id, name)
values  (2, 'Администратор'),
        (3, 'Аналитик'),
        (4, 'Аналитик-координатор'),
        (5, 'Архитектор'),
        (6, 'Ведущий аналитик'),
        (7, 'Ведущий аналитик СУИД'),
        (8, 'Ведущий дизайнер интерфейсов'),
        (9, 'Ведущий разработчик'),
        (10, 'Ведущий специалист информационной безопасности'),
        (11, 'Ведущий тестировщик'),
        (12, 'Главный аналитик'),
        (13, 'Главный бухгалтер'),
        (14, 'Главный разработчик I категории'),
        (15, 'Главный разработчик II категории'),
        (16, 'Главный тестировщик'),
        (17, 'Дизайнер'),
        (18, 'Дизайнер интерфейсов'),
        (19, 'Заместитель генерального директора по координации аналитики'),
        (20, 'Заместитель генерального директора по координации реализации планов ОИВ'),
        (21, 'Заместитель руководителя проекта'),
        (22, 'Исполнительный директор'),
        (23, 'Младший аналитик'),
        (24, 'Начальник отдела - Руководитель блока'),
        (25, 'Разработчик I категории'),
        (26, 'Разработчик II категории'),
        (27, 'Разработчик III категории'),
        (28, 'Разработчик IV категории'),
        (29, 'Руководитель направления закупочной деятельности'),
        (30, 'Руководитель направления кадрового администрирования'),
        (31, 'Руководитель направления правового обеспечения'),
        (32, 'Руководитель отдела тестирования'),
        (33, 'Руководитель проекта'),
        (34, 'Руководитель проектов по эксплуатации информационных систем'),
        (35, 'Системный администратор'),
        (36, 'Системный инженер I категории'),
        (37, 'Системный инженер II категории'),
        (38, 'Системный инженер III категории'),
        (39, 'Системный инженер IV категории'),
        (40, 'Советник'),
        (41, 'Специалист информационной безопасности'),
        (42, 'Специалист по административно-хозяйственному обеспечению'),
        (43, 'Специалист по бухгалтерскому учету и отчетности'),
        (44, 'Специалист по охране труда'),
        (45, 'Специалист по подбору персонала'),
        (46, 'Специалист по цифровым решениям'),
        (47, 'Специалист по цифровым решениям I категории'),
        (48, 'Специалист по цифровым решениям II категории'),
        (49, 'Специалист по цифровым решениям III категории'),
        (50, 'Специалист по цифровым решениям V категории'),
        (51, 'Специалист по цифровым решениям VI категории'),
        (52, 'Специалист технической поддержки'),
        (53, 'Старший аналитик'),
        (54, 'Старший разработчик I категории'),
        (55, 'Старший разработчик III категории'),
        (56, 'Старший разработчик IV категории'),
        (57, 'Тестировщик'),
        (58, 'Технический писатель'),
        (59, 'Юрист'),
        (60, 'ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА'),
        (62, 'Заместитель генерального директора по координации разработки
'),
        (63, 'Советник'),
        (61, 'Начальник управления'),
        (1, 'Генеральный директор');

insert into public.projects (project_id, name, department_id)
values  (6, 'ИАС УГД', 13),
        (7, 'СУИД', 7),
        (8, 'KPI', 11),
        (9, 'ОИВ', 11),
        (10, 'Герц', 11);