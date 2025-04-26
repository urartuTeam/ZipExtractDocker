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

COPY public.positions (position_id, name, staff_units, current_count, vacancies, parent_position_id, sort) FROM stdin;
1	Генеральный директор	1	1	0	\N	1
2	Директор по IT	1	1	0	1	2
3	Начальник отдела разработки	1	1	0	2	3
4	Старший разработчик	2	1	1	3	4
5	Разработчик	3	2	1	4	5
6	тестовая должность	0	0	0	1	0
7	тестовая должность	0	0	0	2	0
\.


--
-- Data for Name: _dummy_position_references; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public._dummy_position_references (id, position_id) FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.departments (department_id, name, parent_position_id) FROM stdin;
1	ИТ Департамент	2
2	Отдел разработки	3
3	тестовая должность	1
4	Начальник управления	\N
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) FROM stdin;
1	Иванов Иван	1	+7999111222	ivanov@example.com	\N	\N
2	Петров Петр	2	+7999222333	petrov@example.com	1	1
3	Сидоров Сидор	3	+7999333444	sidorov@example.com	2	1
4	Смирнов Виктор	4	+7999444555	smirnov@example.com	3	2
5	Соколов Андрей	5	+7999555666	sokolov@example.com	4	2
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.projects (project_id, name, description, department_id) FROM stdin;
1	Система управления организацией	Внутренняя система для учета персонала и организационной структуры	1
2	Мобильное приложение	Разработка мобильного приложения для клиентов	2
\.


--
-- Data for Name: employeeprojects; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.employeeprojects (employee_id, project_id, role) FROM stdin;
3	1	Руководитель проекта
4	1	Архитектор
5	1	Разработчик
4	2	Технический лидер
5	2	Разработчик
\.


--
-- Data for Name: leaves; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.leaves (leave_id, employee_id, start_date, end_date, type) FROM stdin;
\.


--
-- Data for Name: position_department; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.position_department (position_link_id, position_id, department_id, sort) FROM stdin;
1	3	1	1
2	4	2	1
3	5	2	2
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, email, password, created_at) FROM stdin;
4	admin	admin@example.com	8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918	2025-04-26 10:00:54.561031
\.


--
-- Name: _dummy_position_references_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public._dummy_position_references_id_seq', 1, false);


--
-- Name: departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.departments_department_id_seq', 4, true);


--
-- Name: employees_employee_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.employees_employee_id_seq', 5, true);


--
-- Name: leaves_leave_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.leaves_leave_id_seq', 1, false);


--
-- Name: position_department_position_link_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.position_department_position_link_id_seq', 3, true);


--
-- Name: positions_position_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.positions_position_id_seq', 7, true);


--
-- Name: projects_project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.projects_project_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- PostgreSQL database dump complete
--

