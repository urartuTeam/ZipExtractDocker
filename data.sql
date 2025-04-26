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
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.departments VALUES (1, 'Администрация', NULL, NULL);
INSERT INTO public.departments VALUES (2, 'Управление цифровизации и градостроительных данных', 1, NULL);
INSERT INTO public.departments VALUES (3, 'Управление цифрового развития', 1, NULL);


--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.positions VALUES (1, 'ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА', 1, 1, 1, 0, NULL, 1);
INSERT INTO public.positions VALUES (2, 'Главный эксперт', NULL, 0, 0, 0, NULL, 2);
INSERT INTO public.positions VALUES (3, 'Главный специалист', NULL, 0, 0, 0, NULL, 3);
INSERT INTO public.positions VALUES (5, 'Генеральный директор', NULL, 0, 0, 0, 1, 5);
INSERT INTO public.positions VALUES (6, 'Начальник управления', NULL, 0, 0, 0, 1, 6);
INSERT INTO public.positions VALUES (4, 'Исполнительный директор', NULL, 0, 0, 0, 5, 4);
INSERT INTO public.positions VALUES (7, 'Заместитель генерального директора по координации реализации планов ОИВ', NULL, 0, 0, 0, 5, 7);
INSERT INTO public.positions VALUES (8, 'Заместитель генерального директора по координации аналитики', NULL, 0, 0, 0, 5, 8);
INSERT INTO public.positions VALUES (9, 'Заместитель генерального директора по координации разработки', NULL, 0, 0, 0, 5, 9);
INSERT INTO public.positions VALUES (10, 'Директор по развитию', 1, 1, 0, 1, 5, 10);


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.employees VALUES (1, 'Степанова Дарья Владимировна', 1, '+7 (111) 111-11-11', 'mail@example.com', NULL, 1);
INSERT INTO public.employees VALUES (2, 'Герц Владимир Андреевич', 6, NULL, NULL, 1, 1);
INSERT INTO public.employees VALUES (3, 'Терновский Андрей Викторович', 9, NULL, NULL, NULL, 1);
INSERT INTO public.employees VALUES (4, 'Подгорный Александр Владимирович', 4, NULL, NULL, NULL, 1);
INSERT INTO public.employees VALUES (5, 'Иванов Иван Иванович', 10, '+7 (222) 222-22-22', 'ivanov@example.com', 1, 1);


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.projects VALUES (1, 'Городской портал цифровизации', 2);
INSERT INTO public.projects VALUES (2, 'Система аналитики градостроительных данных', 2);
INSERT INTO public.projects VALUES (3, 'Разработка API градостроительных данных', 3);


--
-- Data for Name: employeeprojects; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.employeeprojects VALUES (1, 1, 'Руководитель проекта');
INSERT INTO public.employeeprojects VALUES (2, 1, 'Архитектор системы');
INSERT INTO public.employeeprojects VALUES (3, 1, 'Технический директор');
INSERT INTO public.employeeprojects VALUES (4, 2, 'Руководитель проекта');
INSERT INTO public.employeeprojects VALUES (5, 2, 'Аналитик');
INSERT INTO public.employeeprojects VALUES (3, 3, 'Руководитель проекта');
INSERT INTO public.employeeprojects VALUES (5, 3, 'Разработчик API');


--
-- Data for Name: leaves; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: position_department; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES (1, 'admin', 'admin@example.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', '2025-04-24 07:52:25.855195');


--
-- Name: departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.departments_department_id_seq', 1, false);


--
-- Name: employees_employee_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employees_employee_id_seq', 1, false);


--
-- Name: leaves_leave_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leaves_leave_id_seq', 1, false);


--
-- Name: position_department_position_link_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.position_department_position_link_id_seq', 1, false);


--
-- Name: positions_position_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.positions_position_id_seq', 1, false);


--
-- Name: projects_project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.projects_project_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- PostgreSQL database dump complete
--

