--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.positions VALUES (7, 'Заместитель генерального директора по координации разработки', 6, false, NULL, false);
INSERT INTO public.positions VALUES (47, 'Администратор проекта', 10, false, NULL, false);
INSERT INTO public.positions VALUES (48, 'Главный эксперт', 11, false, NULL, false);
INSERT INTO public.positions VALUES (45, 'Заместитель начальника управления', 8, false, NULL, false);
INSERT INTO public.positions VALUES (54, 'Начальник отдела (Руководитель команды)', 13, false, NULL, false);
INSERT INTO public.positions VALUES (56, 'Главный бухгалтер', 14, false, NULL, false);
INSERT INTO public.positions VALUES (57, 'Специалист по бухгалтерскому учету и отчетности ', 15, false, NULL, false);
INSERT INTO public.positions VALUES (58, 'Специалист по охране труда', 16, false, NULL, false);
INSERT INTO public.positions VALUES (59, 'Специалист по административно-хозяйственному обеспечению', 17, false, NULL, false);
INSERT INTO public.positions VALUES (60, 'Специалист по подбору персонала', 18, false, NULL, false);
INSERT INTO public.positions VALUES (61, 'Руководитель направления закупочной деятельности', 19, false, NULL, false);
INSERT INTO public.positions VALUES (62, 'Руководитель направления кадрового администрирования', 20, false, NULL, false);
INSERT INTO public.positions VALUES (63, 'Руководитель направления правового обеспечения', 21, false, NULL, false);
INSERT INTO public.positions VALUES (64, 'Юрист', 22, false, NULL, false);
INSERT INTO public.positions VALUES (65, 'Руководитель отдела тестирования', 23, false, NULL, false);
INSERT INTO public.positions VALUES (66, 'Главный тестировщик', 24, false, NULL, false);
INSERT INTO public.positions VALUES (67, 'Ведущий тестировщик', 25, false, NULL, false);
INSERT INTO public.positions VALUES (68, 'Тестировщик', 26, false, NULL, false);
INSERT INTO public.positions VALUES (69, 'Руководитель проекта', 27, false, NULL, false);
INSERT INTO public.positions VALUES (71, 'Главный аналитик', 29, false, NULL, false);
INSERT INTO public.positions VALUES (72, 'Ведущий аналитик', 30, false, NULL, false);
INSERT INTO public.positions VALUES (73, 'Старший аналитик', 31, false, NULL, false);
INSERT INTO public.positions VALUES (74, 'Администратор', 32, false, NULL, false);
INSERT INTO public.positions VALUES (75, 'Аналитик', 33, false, NULL, false);
INSERT INTO public.positions VALUES (76, 'Ведущий аналитик СУИД', 34, false, NULL, false);
INSERT INTO public.positions VALUES (77, 'Младший аналитик', 35, false, NULL, false);
INSERT INTO public.positions VALUES (78, 'Аналитик-координатор', 36, false, NULL, false);
INSERT INTO public.positions VALUES (80, 'Ведущий разработчик', 37, false, NULL, false);
INSERT INTO public.positions VALUES (83, 'Специалист по цифровым решениям', 38, false, NULL, false);
INSERT INTO public.positions VALUES (90, 'Главный разработчик I категории', 39, false, NULL, false);
INSERT INTO public.positions VALUES (91, 'Главный разработчик II категории', 40, false, NULL, false);
INSERT INTO public.positions VALUES (92, 'Старший разработчик I категории', 41, false, NULL, false);
INSERT INTO public.positions VALUES (93, 'Старший разработчик II категории', 42, false, NULL, false);
INSERT INTO public.positions VALUES (94, 'Старший разработчик III категории', 43, false, NULL, false);
INSERT INTO public.positions VALUES (95, 'Старший разработчик IV категории', 44, false, NULL, false);
INSERT INTO public.positions VALUES (96, 'Разработчик II категории', 45, false, NULL, false);
INSERT INTO public.positions VALUES (97, 'Разработчик III категории', 46, false, NULL, false);
INSERT INTO public.positions VALUES (98, 'Разработчик IV категории', 47, false, NULL, false);
INSERT INTO public.positions VALUES (99, 'Специалист по цифровым решениям I категории', 48, false, NULL, false);
INSERT INTO public.positions VALUES (100, 'Специалист по цифровым решениям II категории', 49, false, NULL, false);
INSERT INTO public.positions VALUES (101, 'Специалист по цифровым решениям III категории', 50, false, NULL, false);
INSERT INTO public.positions VALUES (102, 'Специалист по цифровым решениям IV категории', 51, false, NULL, false);
INSERT INTO public.positions VALUES (103, 'Специалист по цифровым решениям V категории', 52, false, NULL, false);
INSERT INTO public.positions VALUES (104, 'Специалист по цифровым решениям IV категории', 53, false, NULL, false);
INSERT INTO public.positions VALUES (105, 'Разработчик I категории', 54, false, NULL, false);
INSERT INTO public.positions VALUES (106, 'Руководитель проектов по эксплуатации информационных систем', 55, false, NULL, false);
INSERT INTO public.positions VALUES (107, 'Начальник отдела - Руководитель блока', 56, false, NULL, false);
INSERT INTO public.positions VALUES (108, 'Ведущий специалист информационной безопасности', 57, false, NULL, false);
INSERT INTO public.positions VALUES (109, 'Специалист информационной безопасности', 58, false, NULL, false);
INSERT INTO public.positions VALUES (110, 'Архитектор', 59, false, NULL, false);
INSERT INTO public.positions VALUES (111, 'Системный администратор', 60, false, NULL, false);
INSERT INTO public.positions VALUES (112, 'Технический писатель', 61, false, NULL, false);
INSERT INTO public.positions VALUES (113, 'Системный инженер I категории', 62, false, NULL, false);
INSERT INTO public.positions VALUES (114, 'Системный инженер II категории', 63, false, NULL, false);
INSERT INTO public.positions VALUES (115, 'Системный инженер III категории', 64, false, NULL, false);
INSERT INTO public.positions VALUES (116, 'Системный инженер IV категории', 65, false, NULL, false);
INSERT INTO public.positions VALUES (117, 'Ведущий дизайнер интерфейсов', 66, false, NULL, false);
INSERT INTO public.positions VALUES (118, 'Специалист технической поддержки', 67, false, NULL, false);
INSERT INTO public.positions VALUES (119, 'Дизайнер интерфейсов', 68, false, NULL, false);
INSERT INTO public.positions VALUES (120, 'Дизайнер', 69, false, NULL, false);
INSERT INTO public.positions VALUES (8, 'Исполнительный директор', 0, false, NULL, false);
INSERT INTO public.positions VALUES (4, 'Заместитель генерального директора по координации реализации планов ОИВ', 1, false, NULL, false);
INSERT INTO public.positions VALUES (2, 'Заместитель руководителя департамента', 4, false, NULL, false);
INSERT INTO public.positions VALUES (3, 'Генеральный директор', 2, false, NULL, false);
INSERT INTO public.positions VALUES (41, 'Главный специалист', 3, false, NULL, false);
INSERT INTO public.positions VALUES (46, 'Руководитель проекта', 9, false, NULL, false);
INSERT INTO public.positions VALUES (5, 'Заместитель генерального директора по координации аналитики', 5, false, NULL, false);
INSERT INTO public.positions VALUES (70, 'Заместитель руководителя проекта', 28, false, NULL, false);
INSERT INTO public.positions VALUES (121, 'Начальник управления', 0, false, NULL, false);
INSERT INTO public.positions VALUES (122, 'Ведущий специалист', 0, false, NULL, false);


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.departments VALUES (2, 'Администрация', NULL, NULL, false, NULL, false, NULL, 0);
INSERT INTO public.departments VALUES (3, 'ГБУ МСИ', NULL, 2, false, NULL, true, '/uploads/logo-1746807877873-135578036.png', 1);
INSERT INTO public.departments VALUES (4, 'ООО "Цифролаб"', NULL, 2, false, NULL, true, NULL, 2);
INSERT INTO public.departments VALUES (6, 'Управление цифрового развития', 3, NULL, false, NULL, false, NULL, 3);
INSERT INTO public.departments VALUES (5, 'Управление цифровизации и градостроительных данных', 3, NULL, false, NULL, false, NULL, 4);
INSERT INTO public.departments VALUES (16, 'отдел 1', NULL, 4, true, '2025-05-12 21:38:33.112', false, NULL, 0);
INSERT INTO public.departments VALUES (17, 'Отдел координации реализации планов ОИВ', NULL, 4, false, NULL, false, NULL, 0);
INSERT INTO public.departments VALUES (18, 'Отдел координации аналитики ПО Строительство', NULL, 5, false, NULL, false, NULL, 0);
INSERT INTO public.departments VALUES (19, 'Отдел координации аналитики ПО Земля', NULL, 5, false, NULL, false, NULL, 0);
INSERT INTO public.departments VALUES (20, 'Отдел координации аналитики ПО Градрешения', NULL, 5, false, NULL, false, NULL, 0);
INSERT INTO public.departments VALUES (21, 'Отдел координации аналитики ПО Аналитики и Мониторинга', NULL, 5, false, NULL, false, NULL, 0);
INSERT INTO public.departments VALUES (22, 'Отдел координации разработки', NULL, 7, false, NULL, false, NULL, 0);
INSERT INTO public.departments VALUES (23, 'Отдел инженерного обеспечения', NULL, 7, false, NULL, false, NULL, 0);
INSERT INTO public.departments VALUES (24, 'Отдел тестирования', NULL, 7, false, NULL, false, NULL, 0);
INSERT INTO public.departments VALUES (25, 'Отдел координации деятельности', NULL, 8, false, NULL, false, NULL, 0);


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.employees VALUES (18, 'Степанова Дарья Владимировна', NULL, '+71111111111', 'admin@test.ru', NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (19, 'Герц Владимир Андреевич', 121, NULL, NULL, NULL, 6, false, NULL, NULL);
INSERT INTO public.employees VALUES (20, 'Самарин Иван Юрьевич', 46, NULL, NULL, NULL, 5, false, NULL, NULL);
INSERT INTO public.employees VALUES (21, 'Тюрькин Евгений Андреевич', 46, NULL, NULL, NULL, 5, false, NULL, NULL);
INSERT INTO public.employees VALUES (22, 'Дремин Андрей', 46, NULL, NULL, 19, 6, false, NULL, NULL);
INSERT INTO public.employees VALUES (23, 'Микляева Галина Сергеевна', 46, NULL, NULL, 19, 6, false, NULL, NULL);
INSERT INTO public.employees VALUES (24, 'Попов Андрей Михайлович', 47, NULL, NULL, NULL, 5, false, NULL, NULL);
INSERT INTO public.employees VALUES (25, 'Коробчану Евгений Юрьевич', 47, NULL, NULL, NULL, 5, false, NULL, NULL);
INSERT INTO public.employees VALUES (26, 'Чурилова Светлана Михайловна', 47, NULL, NULL, NULL, 5, false, NULL, NULL);
INSERT INTO public.employees VALUES (27, 'Бубненкова Елена Вячеславовна', 47, NULL, NULL, 19, 6, false, NULL, NULL);
INSERT INTO public.employees VALUES (28, 'Захарова Полина Андреевна', 47, NULL, NULL, 19, 6, false, NULL, NULL);
INSERT INTO public.employees VALUES (29, 'Воробей Сергей Викторович', 47, NULL, NULL, 19, 6, false, NULL, NULL);
INSERT INTO public.employees VALUES (30, 'Шедевр Олеся', 47, NULL, NULL, 19, 6, false, NULL, NULL);
INSERT INTO public.employees VALUES (31, 'Миронова Екатерина Павловна', 48, NULL, NULL, NULL, 5, false, NULL, NULL);
INSERT INTO public.employees VALUES (32, 'Зелинский Андрей Николаевич', 48, NULL, NULL, NULL, 5, false, NULL, NULL);
INSERT INTO public.employees VALUES (33, 'Молева Анастасия Алексеевна', 48, NULL, NULL, NULL, 5, false, NULL, NULL);
INSERT INTO public.employees VALUES (34, 'Акимов Александр Викторович', 48, NULL, NULL, 19, 6, false, NULL, NULL);
INSERT INTO public.employees VALUES (35, 'Короткова Олеся Эдуардовна', 48, NULL, NULL, 19, 6, false, NULL, NULL);
INSERT INTO public.employees VALUES (36, 'Веревкина Ольга Дмитриевна', 41, NULL, NULL, NULL, 5, false, NULL, NULL);
INSERT INTO public.employees VALUES (37, 'Горошкевич Оксана Александровна', 41, NULL, NULL, NULL, 5, false, NULL, NULL);
INSERT INTO public.employees VALUES (38, 'Замарина Юлия Валентиновна', 41, NULL, NULL, NULL, 5, false, NULL, NULL);
INSERT INTO public.employees VALUES (39, 'Молева Дарья Алексеевна', 41, NULL, NULL, NULL, 5, false, NULL, NULL);
INSERT INTO public.employees VALUES (40, 'Похлоненко Александр Михайлович', 41, NULL, NULL, NULL, 5, false, NULL, NULL);
INSERT INTO public.employees VALUES (41, 'Печенкин Алексей Викторович', 41, NULL, NULL, NULL, 5, false, NULL, NULL);
INSERT INTO public.employees VALUES (42, 'Молева Дарья Алексеевна', NULL, NULL, NULL, NULL, NULL, true, '2025-05-12 17:12:38.445', NULL);
INSERT INTO public.employees VALUES (44, 'Мусаева Джамиля Лом-Алиевна', 41, NULL, NULL, 19, 6, false, NULL, NULL);
INSERT INTO public.employees VALUES (43, 'Вегерин Евгений Алексеевич', 41, NULL, NULL, 19, 6, false, NULL, NULL);
INSERT INTO public.employees VALUES (45, 'Акимов Михаил Александрович', 41, NULL, NULL, 19, 6, false, NULL, NULL);
INSERT INTO public.employees VALUES (46, 'Дупенко Владимир Сергеевич', 41, NULL, NULL, 19, 6, false, NULL, NULL);
INSERT INTO public.employees VALUES (47, 'Крохалевский Игорь Владимирович', 41, NULL, NULL, 19, 6, false, NULL, NULL);
INSERT INTO public.employees VALUES (48, 'Гутеев Роберт Андреевич', 41, NULL, NULL, 19, 6, false, NULL, NULL);
INSERT INTO public.employees VALUES (49, 'Шатский Никита Александрович', 41, NULL, NULL, 19, 6, false, NULL, NULL);
INSERT INTO public.employees VALUES (50, 'Шивцов Максим Владимирович', 41, NULL, NULL, 19, 6, false, NULL, NULL);
INSERT INTO public.employees VALUES (51, 'Кунец Анастасия Леонидовна', 41, NULL, NULL, 19, 6, false, NULL, NULL);
INSERT INTO public.employees VALUES (52, 'Щербаков Николай Владимирович', 41, NULL, NULL, 19, 6, false, NULL, NULL);
INSERT INTO public.employees VALUES (53, 'Аскерова Елизавета Васильевна', 41, NULL, NULL, 19, 6, false, NULL, NULL);
INSERT INTO public.employees VALUES (57, 'Подгорный Александр Владимирович', 8, NULL, NULL, NULL, 4, false, NULL, NULL);
INSERT INTO public.employees VALUES (54, 'Гетманская Валерия Владимировна', 122, NULL, NULL, NULL, 5, false, NULL, NULL);
INSERT INTO public.employees VALUES (55, 'Зайцева Кристина Константиновна', 122, NULL, NULL, NULL, 5, false, NULL, NULL);
INSERT INTO public.employees VALUES (56, 'Устинович Юлиана Феликсовна ', 122, NULL, NULL, NULL, 5, false, NULL, NULL);
INSERT INTO public.employees VALUES (58, 'Терновский Андрей Викторович', 7, NULL, NULL, NULL, 4, false, NULL, NULL);
INSERT INTO public.employees VALUES (59, 'Буланцева Дарья Андреевна', 56, NULL, NULL, NULL, 25, false, NULL, NULL);
INSERT INTO public.employees VALUES (60, 'Зиндеева Елена Леонидовна', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (61, 'Призенцев Иван Александрович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (62, 'Шатунова Юлия Викторовна', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (63, 'Иевская Анастасия Сергеевна', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (64, 'Косягин Дмитрий Сергеевич', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (66, 'Колпашников Константин Михайлович', 70, NULL, NULL, NULL, 17, false, NULL, NULL);
INSERT INTO public.employees VALUES (65, 'Вишневский Павел Александрович', 46, NULL, NULL, NULL, 17, false, NULL, NULL);
INSERT INTO public.employees VALUES (67, 'Луканин Александр Валерьевич', 70, NULL, NULL, NULL, 17, false, NULL, NULL);
INSERT INTO public.employees VALUES (68, 'Якушев Григорий Витальевич', 71, NULL, NULL, NULL, 17, false, NULL, NULL);
INSERT INTO public.employees VALUES (69, 'Пьяных Евгений Николаевич', 72, NULL, NULL, NULL, 17, false, NULL, NULL);
INSERT INTO public.employees VALUES (70, 'Тедеева Линда Ростиславовна', 73, NULL, NULL, NULL, 17, false, NULL, NULL);
INSERT INTO public.employees VALUES (71, 'Беликова Вероника Георгиевна', 74, NULL, NULL, NULL, 17, false, NULL, NULL);
INSERT INTO public.employees VALUES (72, 'Дорохина Елена Сергеевна', 74, NULL, NULL, NULL, 17, false, NULL, NULL);
INSERT INTO public.employees VALUES (73, 'Панов Егор Викторович', 46, NULL, NULL, NULL, 18, false, NULL, NULL);
INSERT INTO public.employees VALUES (74, 'Полякова Екатерина Валентиновна', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (75, 'Ануфриев Иван Дмитриевич', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (76, 'Данилкин Сергей Александрович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (77, 'Гилязова Ляйсан Анваровна', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (78, 'Чащин Павел Леонидович', 46, NULL, NULL, NULL, 19, false, NULL, NULL);
INSERT INTO public.employees VALUES (79, 'Сизёнова Анастасия Сергеевна', 70, NULL, NULL, NULL, 19, false, NULL, NULL);
INSERT INTO public.employees VALUES (80, 'Крюков Роман Николаевич', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (81, 'Вишневская Светлана Александровна', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (82, 'Коляндра Наталина Павловна', 46, NULL, NULL, NULL, 21, false, NULL, NULL);
INSERT INTO public.employees VALUES (83, 'Савченко Максим Павлович', 70, NULL, NULL, NULL, 21, false, NULL, NULL);
INSERT INTO public.employees VALUES (84, 'Назаров Алексей Викторович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (85, 'Карклис Алина Дмитриевна', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (86, 'Ямаева Ильвира Ирековна', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (87, 'Белякова Анна Сергеевна', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (88, 'Тураев Глеб Вадимович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (89, 'Гильгамешин Георгий Данилович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (90, 'Давыдова Полина Сергеевна', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (91, 'Месяцева Наталья Вячеславовна', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (92, 'Куров Иван Александрович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (94, 'Джиндоев Юрий Мосесович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (95, 'Асрян Артем Камоевич', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (93, 'Гарнага Алексей Анатольевич', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (96, 'Пономарев Ярослав Валериевич', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (99, 'Чалоян Бемал Андраникович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (100, 'Гайсуев Ислам Русланович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (101, 'Измайлов Станислав Юрьевич', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (103, 'Кораблев Денис Алексеевич', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (104, 'Шабельников Андрей Владиленович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (105, 'Ермаков Алексей Владимирович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (106, 'Шилик Павел Олегович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (107, 'Магафуров Айрат Раилевич', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (108, 'Боровков Егор Николаевич', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (109, 'Бауров Алексей Владимирович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (110, 'Зятковский Владислав Олегович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (111, 'Полянский Борис Петрович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (112, 'Коваленко Юрий Александрович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (113, 'Ражев Иван Юрьевич', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (114, 'Раченко Вячеслав Александрович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (115, 'Прокопьев Вячеслав Алексеевич', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (116, 'Абрамов Руслан Владимирович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (117, 'Дашкин Богдан Владимирович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (118, 'Попов Сергей Павлович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (119, 'Орлов Павел Александрович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (120, 'Щербаков Ярослав Юрьевич', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (121, 'Салахутдинов Марат Рамилевич', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (122, 'Зайцева Наталья Владимировна', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (123, 'Сухов Николай Николаевич', 106, NULL, NULL, NULL, 23, false, NULL, NULL);
INSERT INTO public.employees VALUES (124, 'Байков Михаил Сергеевич', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (125, 'Леденев Сергей Александрович', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (126, 'Пак Валерия Викторовна', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (127, 'Пинчук Екатерина Сергеевна', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (128, 'Халикова Элеонора Шахруховна', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (129, 'Аркадьева Олеся Александровна', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);
INSERT INTO public.employees VALUES (130, 'Филимонов Алексей Алексеевич', NULL, NULL, NULL, NULL, NULL, false, NULL, NULL);


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.projects VALUES (8, 'ЕИС МГЗ', '', NULL, false, NULL, NULL, 0);
INSERT INTO public.projects VALUES (14, 'SuperSet', '', NULL, false, NULL, NULL, 0);
INSERT INTO public.projects VALUES (15, 'АИС РЕОН', '', NULL, false, NULL, NULL, 0);
INSERT INTO public.projects VALUES (16, 'АИС РСМ', '', NULL, false, NULL, NULL, 0);
INSERT INTO public.projects VALUES (17, 'СУИД', '', NULL, false, NULL, NULL, 0);
INSERT INTO public.projects VALUES (18, 'BS', '', NULL, false, NULL, NULL, 0);
INSERT INTO public.projects VALUES (19, 'KPI', '', NULL, false, NULL, NULL, 0);
INSERT INTO public.projects VALUES (20, 'Рейтинг ОИВ', '', NULL, false, NULL, NULL, 0);
INSERT INTO public.projects VALUES (21, 'Производственные программы', '', NULL, false, NULL, NULL, 0);
INSERT INTO public.projects VALUES (22, 'ДБ Аналитика ', 'ДБ Аналитика (Сенина)', NULL, false, NULL, NULL, 0);
INSERT INTO public.projects VALUES (23, 'EXON', '', NULL, false, NULL, NULL, 0);
INSERT INTO public.projects VALUES (9, 'СУПД АКЦЕНТ', '', NULL, false, NULL, NULL, 0);
INSERT INTO public.projects VALUES (10, 'ИАС ОГД', '', NULL, false, NULL, NULL, 0);
INSERT INTO public.projects VALUES (24, 'тестовый', 'кпывфпвы', NULL, false, NULL, NULL, 0);


--
-- Data for Name: employeeprojects; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--



--
-- Data for Name: leaves; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--



--
-- Data for Name: position_department; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.position_department VALUES (40, 2, 2, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (43, 121, 6, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (44, 121, 5, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (45, 45, 6, 0, false, NULL, 0, 0, 2);
INSERT INTO public.position_department VALUES (46, 45, 5, 0, false, NULL, 0, 0, 2);
INSERT INTO public.position_department VALUES (47, 46, 6, 0, false, NULL, 0, 0, 4);
INSERT INTO public.position_department VALUES (48, 46, 5, 0, false, NULL, 0, 0, 3);
INSERT INTO public.position_department VALUES (49, 47, 6, 0, false, NULL, 0, 0, 4);
INSERT INTO public.position_department VALUES (50, 47, 5, 0, false, NULL, 0, 0, 3);
INSERT INTO public.position_department VALUES (51, 48, 6, 0, false, NULL, 0, 0, 2);
INSERT INTO public.position_department VALUES (52, 48, 5, 0, false, NULL, 0, 0, 3);
INSERT INTO public.position_department VALUES (54, 41, 6, 0, false, NULL, 0, 0, 13);
INSERT INTO public.position_department VALUES (55, 41, 5, 0, false, NULL, 0, 0, 6);
INSERT INTO public.position_department VALUES (59, 122, 5, 0, false, NULL, 0, 0, 3);
INSERT INTO public.position_department VALUES (60, 3, 4, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (61, 4, 4, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (62, 8, 4, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (63, 5, 4, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (64, 7, 4, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (66, 46, 17, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (67, 46, 18, 0, false, NULL, 0, 0, 2);
INSERT INTO public.position_department VALUES (68, 46, 19, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (69, 46, 20, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (70, 46, 21, 0, false, NULL, 0, 0, 2);
INSERT INTO public.position_department VALUES (71, 54, 22, 0, false, NULL, 0, 0, 8);
INSERT INTO public.position_department VALUES (72, 106, 23, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (73, 65, 24, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (74, 56, 25, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (75, 70, 17, 0, false, NULL, 0, 0, 2);
INSERT INTO public.position_department VALUES (80, 70, 18, 0, false, NULL, 0, 0, 2);
INSERT INTO public.position_department VALUES (81, 70, 19, 0, false, NULL, 0, 0, 3);
INSERT INTO public.position_department VALUES (82, 70, 20, 0, false, NULL, 0, 0, 2);
INSERT INTO public.position_department VALUES (83, 70, 21, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (84, 71, 17, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (85, 72, 17, 0, false, NULL, 0, 0, 2);
INSERT INTO public.position_department VALUES (86, 73, 17, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (87, 74, 17, 0, false, NULL, 0, 0, 5);
INSERT INTO public.position_department VALUES (88, 71, 18, 0, false, NULL, 0, 0, 3);
INSERT INTO public.position_department VALUES (89, 72, 18, 0, false, NULL, 0, 0, 3);
INSERT INTO public.position_department VALUES (90, 73, 18, 0, false, NULL, 0, 0, 3);
INSERT INTO public.position_department VALUES (91, 75, 18, 0, false, NULL, 0, 0, 4);
INSERT INTO public.position_department VALUES (92, 76, 18, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (93, 71, 19, 0, false, NULL, 0, 0, 5);
INSERT INTO public.position_department VALUES (94, 71, 20, 0, false, NULL, 0, 0, 3);
INSERT INTO public.position_department VALUES (95, 71, 21, 0, false, NULL, 0, 0, 2);
INSERT INTO public.position_department VALUES (96, 72, 19, 0, false, NULL, 0, 0, 3);
INSERT INTO public.position_department VALUES (98, 72, 21, 0, false, NULL, 0, 0, 2);
INSERT INTO public.position_department VALUES (99, 73, 19, 0, false, NULL, 0, 0, 3);
INSERT INTO public.position_department VALUES (100, 73, 20, 0, false, NULL, 0, 0, 2);
INSERT INTO public.position_department VALUES (101, 73, 21, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (102, 75, 19, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (103, 75, 20, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (104, 75, 21, 0, false, NULL, 0, 0, 2);
INSERT INTO public.position_department VALUES (105, 77, 19, 0, false, NULL, 0, 0, 2);
INSERT INTO public.position_department VALUES (106, 77, 20, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (107, 77, 21, 0, false, NULL, 0, 0, 2);
INSERT INTO public.position_department VALUES (108, 78, 21, 0, false, NULL, 0, 0, 2);
INSERT INTO public.position_department VALUES (109, 72, 20, 0, false, NULL, 0, 0, 2);


--
-- Data for Name: position_position; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.position_position VALUES (21, 45, 121, 6, NULL, '2025-05-12 16:45:59.959045+00', '2025-05-12 16:45:59.959045+00', false, NULL);
INSERT INTO public.position_position VALUES (22, 45, 121, 5, NULL, '2025-05-12 16:46:09.651562+00', '2025-05-12 16:46:09.651562+00', false, NULL);
INSERT INTO public.position_position VALUES (23, 46, 121, 6, NULL, '2025-05-12 16:46:54.653794+00', '2025-05-12 16:46:54.653794+00', false, NULL);
INSERT INTO public.position_position VALUES (24, 46, 121, 5, NULL, '2025-05-12 16:47:04.741776+00', '2025-05-12 16:47:04.741776+00', false, NULL);
INSERT INTO public.position_position VALUES (25, 47, 121, 6, NULL, '2025-05-12 16:53:17.64761+00', '2025-05-12 16:53:17.64761+00', false, NULL);
INSERT INTO public.position_position VALUES (26, 47, 121, 5, NULL, '2025-05-12 16:53:26.04075+00', '2025-05-12 16:53:26.04075+00', false, NULL);
INSERT INTO public.position_position VALUES (27, 48, 121, 6, NULL, '2025-05-12 16:54:05.452553+00', '2025-05-12 16:54:05.452553+00', false, NULL);
INSERT INTO public.position_position VALUES (28, 48, 121, 5, NULL, '2025-05-12 16:54:13.988508+00', '2025-05-12 16:54:13.988508+00', false, NULL);
INSERT INTO public.position_position VALUES (29, 41, 121, 6, NULL, '2025-05-12 16:54:58.323951+00', '2025-05-12 16:54:58.323951+00', false, NULL);
INSERT INTO public.position_position VALUES (30, 41, 121, 5, NULL, '2025-05-12 16:55:10.849132+00', '2025-05-12 16:55:10.849132+00', false, NULL);
INSERT INTO public.position_position VALUES (33, 122, 121, 5, NULL, '2025-05-12 17:01:32.856483+00', '2025-05-12 17:01:32.856483+00', false, NULL);
INSERT INTO public.position_position VALUES (34, 4, 3, 4, NULL, '2025-05-12 17:25:48.606703+00', '2025-05-12 17:25:48.606703+00', false, NULL);
INSERT INTO public.position_position VALUES (35, 8, 3, 4, NULL, '2025-05-12 17:25:56.542692+00', '2025-05-12 17:25:56.542692+00', false, NULL);
INSERT INTO public.position_position VALUES (36, 5, 3, 4, NULL, '2025-05-12 17:26:07.436739+00', '2025-05-12 17:26:07.436739+00', false, NULL);
INSERT INTO public.position_position VALUES (37, 7, 3, 4, NULL, '2025-05-12 17:26:17.634103+00', '2025-05-12 17:26:17.634103+00', false, NULL);
INSERT INTO public.position_position VALUES (38, 93, 4, 4, NULL, '2025-05-12 20:23:04.847787+00', '2025-05-12 20:23:04.847787+00', false, NULL);
INSERT INTO public.position_position VALUES (39, 70, 46, 17, NULL, '2025-05-12 21:50:36.580039+00', '2025-05-12 21:50:36.580039+00', false, NULL);
INSERT INTO public.position_position VALUES (40, 70, 46, 18, NULL, '2025-05-12 21:52:25.985564+00', '2025-05-12 21:52:25.985564+00', false, NULL);
INSERT INTO public.position_position VALUES (41, 70, 46, 19, NULL, '2025-05-12 21:53:16.556476+00', '2025-05-12 21:53:16.556476+00', false, NULL);
INSERT INTO public.position_position VALUES (42, 70, 46, 20, NULL, '2025-05-12 21:53:29.284679+00', '2025-05-12 21:53:29.284679+00', false, NULL);
INSERT INTO public.position_position VALUES (43, 70, 46, 21, NULL, '2025-05-12 21:53:40.85288+00', '2025-05-12 21:53:40.85288+00', false, NULL);
INSERT INTO public.position_position VALUES (44, 71, 46, 17, NULL, '2025-05-12 22:00:18.394075+00', '2025-05-12 22:00:18.394075+00', false, NULL);
INSERT INTO public.position_position VALUES (45, 72, 46, 17, NULL, '2025-05-12 22:00:36.116461+00', '2025-05-12 22:00:36.116461+00', false, NULL);
INSERT INTO public.position_position VALUES (46, 73, 46, 17, NULL, '2025-05-12 22:00:54.384333+00', '2025-05-12 22:00:54.384333+00', false, NULL);
INSERT INTO public.position_position VALUES (47, 74, 46, 17, NULL, '2025-05-12 22:01:20.560942+00', '2025-05-12 22:01:20.560942+00', false, NULL);
INSERT INTO public.position_position VALUES (48, 71, 46, 18, NULL, '2025-05-12 22:04:46.285531+00', '2025-05-12 22:04:46.285531+00', false, NULL);
INSERT INTO public.position_position VALUES (49, 72, 46, 18, NULL, '2025-05-12 22:05:00.689504+00', '2025-05-12 22:05:00.689504+00', false, NULL);
INSERT INTO public.position_position VALUES (50, 73, 46, 18, NULL, '2025-05-12 22:05:17.713741+00', '2025-05-12 22:05:17.713741+00', false, NULL);
INSERT INTO public.position_position VALUES (51, 75, 46, 18, NULL, '2025-05-12 22:05:35.054925+00', '2025-05-12 22:05:35.054925+00', false, NULL);
INSERT INTO public.position_position VALUES (52, 76, 46, 18, NULL, '2025-05-12 22:05:51.142696+00', '2025-05-12 22:05:51.142696+00', false, NULL);
INSERT INTO public.position_position VALUES (53, 71, 46, 19, NULL, '2025-05-12 22:06:16.168281+00', '2025-05-12 22:06:16.168281+00', false, NULL);
INSERT INTO public.position_position VALUES (54, 71, 46, 20, NULL, '2025-05-12 22:06:32.25405+00', '2025-05-12 22:06:32.25405+00', false, NULL);
INSERT INTO public.position_position VALUES (55, 71, 46, 21, NULL, '2025-05-12 22:06:48.684548+00', '2025-05-12 22:06:48.684548+00', false, NULL);
INSERT INTO public.position_position VALUES (56, 72, 46, 19, NULL, '2025-05-12 22:07:22.746798+00', '2025-05-12 22:07:22.746798+00', false, NULL);
INSERT INTO public.position_position VALUES (57, 72, 46, 21, NULL, '2025-05-12 22:07:52.676753+00', '2025-05-12 22:07:52.676753+00', false, NULL);
INSERT INTO public.position_position VALUES (58, 73, 46, 19, NULL, '2025-05-12 22:08:15.505027+00', '2025-05-12 22:08:15.505027+00', false, NULL);
INSERT INTO public.position_position VALUES (59, 73, 46, 20, NULL, '2025-05-12 22:08:29.513239+00', '2025-05-12 22:08:29.513239+00', false, NULL);
INSERT INTO public.position_position VALUES (60, 73, 46, 21, NULL, '2025-05-12 22:08:45.224831+00', '2025-05-12 22:08:45.224831+00', false, NULL);
INSERT INTO public.position_position VALUES (61, 75, 46, 19, NULL, '2025-05-12 22:09:06.018811+00', '2025-05-12 22:09:06.018811+00', false, NULL);
INSERT INTO public.position_position VALUES (62, 75, 46, 20, NULL, '2025-05-12 22:09:18.108112+00', '2025-05-12 22:09:18.108112+00', false, NULL);
INSERT INTO public.position_position VALUES (63, 75, 46, 21, NULL, '2025-05-12 22:09:31.559032+00', '2025-05-12 22:09:31.559032+00', false, NULL);
INSERT INTO public.position_position VALUES (64, 77, 46, 19, NULL, '2025-05-12 22:09:55.748213+00', '2025-05-12 22:09:55.748213+00', false, NULL);
INSERT INTO public.position_position VALUES (65, 77, 46, 20, NULL, '2025-05-12 22:10:09.072404+00', '2025-05-12 22:10:09.072404+00', false, NULL);
INSERT INTO public.position_position VALUES (66, 77, 46, 21, NULL, '2025-05-12 22:10:26.755467+00', '2025-05-12 22:10:26.755467+00', false, NULL);
INSERT INTO public.position_position VALUES (67, 78, 46, 21, NULL, '2025-05-12 22:10:45.945998+00', '2025-05-12 22:10:45.945998+00', false, NULL);
INSERT INTO public.position_position VALUES (68, 72, 46, 20, NULL, '2025-05-12 22:13:14.443148+00', '2025-05-12 22:13:14.443148+00', false, NULL);


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--



--
-- Data for Name: sort_tree; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.users VALUES (4, 'admin', 'admin@example.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', '2025-05-13 09:27:02.160941', false, NULL, 'admin');


--
-- Name: departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.departments_department_id_seq', 1, false);


--
-- Name: employees_employee_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.employees_employee_id_seq', 1, false);


--
-- Name: leaves_leave_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.leaves_leave_id_seq', 1, false);


--
-- Name: position_department_position_link_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.position_department_position_link_id_seq', 1, false);


--
-- Name: position_position_position_relation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.position_position_position_relation_id_seq', 1, false);


--
-- Name: positions_position_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.positions_position_id_seq', 1, false);


--
-- Name: projects_project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.projects_project_id_seq', 1, false);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.settings_id_seq', 1, false);


--
-- Name: sort_tree_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.sort_tree_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- PostgreSQL database dump complete
--

