


--
-- Данные для таблицы departments
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES
                                                                                                                        (1, 'Администрация', NULL, NULL, FALSE, NULL),
                                                                                                                        (2, 'Управление цифровизации и градостроительных данных', 1, 6, FALSE, NULL),
                                                                                                                        (3, 'Управление цифрового развития', 1, 6, FALSE, NULL),
                                                                                                                        (5, 'тестовая должность', NULL, 6, TRUE, '2025-04-26 11:51:46.653'),
                                                                                                                        (6, 'тестовый отдел', NULL, 6, FALSE, NULL),
                                                                                                                        (7, 'ОТДЕЛ КООРДИНАЦИИ РАЗРАБОТКИ', NULL, 9, FALSE, NULL);

-- Данные для таблицы employeeprojects
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES
                                                                                             (1, 1, 'Руководитель проекта', FALSE, NULL),
                                                                                             (2, 1, 'Архитектор системы', FALSE, NULL),
                                                                                             (3, 1, 'Технический директор', FALSE, NULL),
                                                                                             (4, 2, 'Руководитель проекта', FALSE, NULL),
                                                                                             (3, 3, 'Руководитель проекта', FALSE, NULL);

-- Данные для таблицы employees
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) VALUES
                                                                                                                                     (1, 'Степанова Дарья Владимировна', 1, '+7 (111) 111-11-11', 'mail@example.com', NULL, 1, FALSE, NULL),
                                                                                                                                     (2, 'Герц Владимир Андреевич', 6, NULL, NULL, 1, 1, FALSE, NULL),
                                                                                                                                     (3, 'Терновский Андрей Викторович', 9, NULL, NULL, NULL, 1, FALSE, NULL),
                                                                                                                                     (4, 'Подгорный Александр Владимирович', 4, NULL, NULL, NULL, 1, FALSE, NULL);

-- Данные для таблицы position_department
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES
                                                                                                                                                            (1, 1, 1, 0, FALSE, NULL, 1, 1, 0),
                                                                                                                                                            (2, 2, 1, 0, FALSE, NULL, 0, 0, 0),
                                                                                                                                                            (3, 3, 1, 0, FALSE, NULL, 0, 0, 0),
                                                                                                                                                            (4, 5, 1, 0, FALSE, NULL, 0, 0, 0),
                                                                                                                                                            (5, 6, 1, 0, FALSE, NULL, 0, 0, 0),
                                                                                                                                                            (6, 4, 1, 0, FALSE, NULL, 0, 0, 0),
                                                                                                                                                            (7, 7, 1, 0, FALSE, NULL, 0, 0, 0),
                                                                                                                                                            (8, 8, 1, 0, FALSE, NULL, 0, 0, 0),
                                                                                                                                                            (9, 9, 1, 0, FALSE, NULL, 0, 0, 0),
                                                                                                                                                            (10, 10, 1, 0, FALSE, NULL, 1, 0, 1);

-- Данные для таблицы positions
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, parent_position_id, sort, department_id, deleted, deleted_at) VALUES
                                                                                                                                                          (1, 'ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА', 1, 1, 0, NULL, 1, 1, FALSE, NULL),
                                                                                                                                                          (2, 'Главный эксперт', 0, 0, 0, NULL, 2, NULL, FALSE, NULL),
                                                                                                                                                          (3, 'Главный специалист', 0, 0, 0, NULL, 3, NULL, FALSE, NULL),
                                                                                                                                                          (5, 'Генеральный директор', 0, 0, 0, 1, 5, NULL, FALSE, NULL),
                                                                                                                                                          (6, 'Начальник управления', 0, 0, 0, 1, 6, NULL, FALSE, NULL),
                                                                                                                                                          (4, 'Исполнительный директор', 0, 0, 0, 5, 4, NULL, FALSE, NULL),
                                                                                                                                                          (7, 'Заместитель генерального директора по координации реализации планов ОИВ', 0, 0, 0, 5, 7, NULL, FALSE, NULL),
                                                                                                                                                          (8, 'Заместитель генерального директора по координации аналитики', 0, 0, 0, 5, 8, NULL, FALSE, NULL),
                                                                                                                                                          (9, 'Заместитель генерального директора по координации разработки', 0, 0, 0, 5, 9, NULL, FALSE, NULL),
                                                                                                                                                          (10, 'Директор по развитию', 1, 0, 1, 5, 10, 1, FALSE, NULL);

-- Данные для таблицы projects
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at) VALUES
                                                                                                    (1, 'Городской портал цифровизации', NULL, 2, FALSE, NULL),
                                                                                                    (2, 'Система аналитики градостроительных данных', NULL, 2, FALSE, NULL),
                                                                                                    (3, 'Разработка API градостроительных данных', NULL, 3, FALSE, NULL);

-- Данные для таблицы settings
INSERT INTO public.settings (id, data_key, data_value, created_at, updated_at) VALUES
    (1, 'hierarchy_initial_levels', '3', '2025-04-27 10:36:15.699481', '2025-04-27 15:17:50.873');

-- Данные для таблицы users
INSERT INTO public.users (id, username, email, password, created_at, deleted, deleted_at) VALUES
    (1, 'admin', 'admin@example.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', '2025-04-24 07:52:25.855195', FALSE, NULL);

