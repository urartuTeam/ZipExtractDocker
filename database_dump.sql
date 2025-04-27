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
    parent_department_id integer,
    parent_position_id integer,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
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
    role text NOT NULL,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
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
    department_id integer,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
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
    type text NOT NULL,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
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
    sort integer DEFAULT 0,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    staff_units integer DEFAULT 0,
    current_count integer DEFAULT 0,
    vacancies integer DEFAULT 0
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
    sort integer DEFAULT 0,
    department_id integer,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
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
    department_id integer,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
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
-- Name: settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    data_key text NOT NULL,
    data_value text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.settings OWNER TO neondb_owner;

--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.settings_id_seq OWNER TO neondb_owner;

--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
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
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


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

COPY public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) FROM stdin;
1	Администрация	\N	\N	f	\N
2	Управление цифровизации и градостроительных данных	1	6	f	\N
3	Управление цифрового развития	1	6	f	\N
5	тестовая должность	\N	6	t	2025-04-26 11:51:46.653
6	тестовый отдел	\N	6	f	\N
7	ОТДЕЛ КООРДИНАЦИИ   РАЗРАБОТКИ	\N	9	f	\N
\.


--
-- Data for Name: employeeprojects; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) FROM stdin;
1	1	Руководитель проекта	f	\N
2	1	Архитектор системы	f	\N
3	1	Технический директор	f	\N
4	2	Руководитель проекта	f	\N
3	3	Руководитель проекта	f	\N
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) FROM stdin;
1	Степанова Дарья Владимировна	1	+7 (111) 111-11-11	mail@example.com	\N	1	f	\N
2	Герц Владимир Андреевич	6	\N	\N	1	1	f	\N
3	Терновский Андрей Викторович	9	\N	\N	\N	1	f	\N
4	Подгорный Александр Владимирович	4	\N	\N	\N	1	f	\N
\.


--
-- Data for Name: leaves; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.leaves (leave_id, employee_id, start_date, end_date, type, deleted, deleted_at) FROM stdin;
\.


--
-- Data for Name: position_department; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) FROM stdin;
1	1	1	0	f	\N	1	1	0
2	2	1	0	f	\N	0	0	0
3	3	1	0	f	\N	0	0	0
4	5	1	0	f	\N	0	0	0
5	6	1	0	f	\N	0	0	0
6	4	1	0	f	\N	0	0	0
7	7	1	0	f	\N	0	0	0
8	8	1	0	f	\N	0	0	0
9	9	1	0	f	\N	0	0	0
10	10	1	0	f	\N	1	0	1
\.


--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.positions (position_id, name, staff_units, current_count, vacancies, parent_position_id, sort, department_id, deleted, deleted_at) FROM stdin;
1	ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА	1	1	0	\N	1	1	f	\N
2	Главный эксперт	0	0	0	\N	2	\N	f	\N
3	Главный специалист	0	0	0	\N	3	\N	f	\N
5	Генеральный директор	0	0	0	1	5	\N	f	\N
6	Начальник управления	0	0	0	1	6	\N	f	\N
4	Исполнительный директор	0	0	0	5	4	\N	f	\N
7	Заместитель генерального директора по координации реализации планов ОИВ	0	0	0	5	7	\N	f	\N
8	Заместитель генерального директора по координации аналитики	0	0	0	5	8	\N	f	\N
9	Заместитель генерального директора по координации разработки	0	0	0	5	9	\N	f	\N
10	Директор по развитию	1	0	1	5	10	1	f	\N
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.projects (project_id, name, description, department_id, deleted, deleted_at) FROM stdin;
1	Городской портал цифровизации	\N	2	f	\N
2	Система аналитики градостроительных данных	\N	2	f	\N
3	Разработка API градостроительных данных	\N	3	f	\N
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.settings (id, data_key, data_value, created_at, updated_at) FROM stdin;
1	hierarchy_initial_levels	3	2025-04-27 10:36:15.699481	2025-04-27 15:17:50.873
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, email, password, created_at, deleted, deleted_at) FROM stdin;
1	admin	admin@example.com	4ec86d813dc530a40745900a6439209e6c1f6357b8ade99cb85f5e4dda8fc0d4927b840f8ae5710ef1ce55b7b4b8b9cf2a8c832d3be46a15a9082a4fb4e9751b.3c30567107e13e47c160c7456b9acade	2025-04-24 07:52:25.855195	f	\N
\.


--
-- Name: _dummy_position_references_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public._dummy_position_references_id_seq', 1, false);


--
-- Name: departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.departments_department_id_seq', 7, true);


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

SELECT pg_catalog.setval('public.position_department_position_link_id_seq', 4, true);


--
-- Name: positions_position_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.positions_position_id_seq', 8, true);


--
-- Name: projects_project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.projects_project_id_seq', 2, true);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.settings_id_seq', 1, true);


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
-- Name: settings settings_data_key_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_data_key_key UNIQUE (data_key);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


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

