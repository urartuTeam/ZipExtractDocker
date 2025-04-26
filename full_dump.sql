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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _dummy_position_references; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public._dummy_position_references (
    id integer NOT NULL,
    position_id integer
);


ALTER TABLE public._dummy_position_references OWNER TO neondb_owner;

--
-- Name: _dummy_position_references_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public._dummy_position_references_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public._dummy_position_references_id_seq OWNER TO neondb_owner;

--
-- Name: _dummy_position_references_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public._dummy_position_references_id_seq OWNED BY public._dummy_position_references.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.departments (
    department_id integer NOT NULL,
    name text NOT NULL,
    parent_position_id integer
);


ALTER TABLE public.departments OWNER TO neondb_owner;

--
-- Name: departments_department_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.departments_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_department_id_seq OWNER TO neondb_owner;

--
-- Name: departments_department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;


--
-- Name: employeeprojects; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.employeeprojects (
    employee_id integer NOT NULL,
    project_id integer NOT NULL,
    role text NOT NULL
);


ALTER TABLE public.employeeprojects OWNER TO neondb_owner;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.employees (
    employee_id integer NOT NULL,
    full_name text NOT NULL,
    position_id integer,
    phone text,
    email text,
    manager_id integer,
    department_id integer
);


ALTER TABLE public.employees OWNER TO neondb_owner;

--
-- Name: employees_employee_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.employees_employee_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_employee_id_seq OWNER TO neondb_owner;

--
-- Name: employees_employee_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.employees_employee_id_seq OWNED BY public.employees.employee_id;


--
-- Name: leaves; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.leaves (
    leave_id integer NOT NULL,
    employee_id integer,
    start_date date NOT NULL,
    end_date date,
    type text NOT NULL
);


ALTER TABLE public.leaves OWNER TO neondb_owner;

--
-- Name: leaves_leave_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.leaves_leave_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leaves_leave_id_seq OWNER TO neondb_owner;

--
-- Name: leaves_leave_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.leaves_leave_id_seq OWNED BY public.leaves.leave_id;


--
-- Name: position_department; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.position_department (
    position_link_id integer NOT NULL,
    position_id integer,
    department_id integer,
    sort integer DEFAULT 0
);


ALTER TABLE public.position_department OWNER TO neondb_owner;

--
-- Name: position_department_position_link_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.position_department_position_link_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.position_department_position_link_id_seq OWNER TO neondb_owner;

--
-- Name: position_department_position_link_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.position_department_position_link_id_seq OWNED BY public.position_department.position_link_id;


--
-- Name: positions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.positions (
    position_id integer NOT NULL,
    name text NOT NULL,
    staff_units integer DEFAULT 0,
    current_count integer DEFAULT 0,
    vacancies integer DEFAULT 0,
    parent_position_id integer,
    sort integer DEFAULT 0
);


ALTER TABLE public.positions OWNER TO neondb_owner;

--
-- Name: positions_position_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.positions_position_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.positions_position_id_seq OWNER TO neondb_owner;

--
-- Name: positions_position_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.positions_position_id_seq OWNED BY public.positions.position_id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.projects (
    project_id integer NOT NULL,
    name text NOT NULL,
    description text,
    department_id integer
);


ALTER TABLE public.projects OWNER TO neondb_owner;

--
-- Name: projects_project_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.projects_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projects_project_id_seq OWNER TO neondb_owner;

--
-- Name: projects_project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.projects_project_id_seq OWNED BY public.projects.project_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: _dummy_position_references id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._dummy_position_references ALTER COLUMN id SET DEFAULT nextval('public._dummy_position_references_id_seq'::regclass);


--
-- Name: departments department_id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);


--
-- Name: employees employee_id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employees ALTER COLUMN employee_id SET DEFAULT nextval('public.employees_employee_id_seq'::regclass);


--
-- Name: leaves leave_id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leaves ALTER COLUMN leave_id SET DEFAULT nextval('public.leaves_leave_id_seq'::regclass);


--
-- Name: position_department position_link_id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.position_department ALTER COLUMN position_link_id SET DEFAULT nextval('public.position_department_position_link_id_seq'::regclass);


--
-- Name: positions position_id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.positions ALTER COLUMN position_id SET DEFAULT nextval('public.positions_position_id_seq'::regclass);


--
-- Name: projects project_id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.projects ALTER COLUMN project_id SET DEFAULT nextval('public.projects_project_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


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
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.projects (project_id, name, description, department_id) FROM stdin;
1	Система управления организацией	Внутренняя система для учета персонала и организационной структуры	1
2	Мобильное приложение	Разработка мобильного приложения для клиентов	2
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
-- Name: _dummy_position_references _dummy_position_references_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._dummy_position_references
    ADD CONSTRAINT _dummy_position_references_pkey PRIMARY KEY (id);


--
-- Name: employeeprojects employeeprojects_employee_id_project_id_pk; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employeeprojects
    ADD CONSTRAINT employeeprojects_employee_id_project_id_pk PRIMARY KEY (employee_id, project_id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (employee_id);


--
-- Name: departments idx_department_id; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT idx_department_id UNIQUE (department_id);


--
-- Name: positions idx_position_id; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT idx_position_id UNIQUE (position_id);


--
-- Name: position_department idx_position_link_id; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.position_department
    ADD CONSTRAINT idx_position_link_id UNIQUE (position_link_id);


--
-- Name: leaves leaves_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_pkey PRIMARY KEY (leave_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (project_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: _dummy_position_references _dummy_position_references_position_id_positions_position_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._dummy_position_references
    ADD CONSTRAINT _dummy_position_references_position_id_positions_position_id_fk FOREIGN KEY (position_id) REFERENCES public.positions(position_id);


--
-- Name: departments departments_parent_position_id_positions_position_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_parent_position_id_positions_position_id_fk FOREIGN KEY (parent_position_id) REFERENCES public.positions(position_id);


--
-- Name: employeeprojects employeeprojects_employee_id_employees_employee_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employeeprojects
    ADD CONSTRAINT employeeprojects_employee_id_employees_employee_id_fk FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id);


--
-- Name: employeeprojects employeeprojects_project_id_projects_project_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employeeprojects
    ADD CONSTRAINT employeeprojects_project_id_projects_project_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- Name: employees employees_department_id_departments_department_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_department_id_departments_department_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: employees employees_position_id_positions_position_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_position_id_positions_position_id_fk FOREIGN KEY (position_id) REFERENCES public.positions(position_id);


--
-- Name: leaves leaves_employee_id_employees_employee_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_employee_id_employees_employee_id_fk FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id);


--
-- Name: position_department position_department_department_id_departments_department_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.position_department
    ADD CONSTRAINT position_department_department_id_departments_department_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: position_department position_department_position_id_positions_position_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.position_department
    ADD CONSTRAINT position_department_position_id_positions_position_id_fk FOREIGN KEY (position_id) REFERENCES public.positions(position_id);


--
-- Name: projects projects_department_id_departments_department_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_department_id_departments_department_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

