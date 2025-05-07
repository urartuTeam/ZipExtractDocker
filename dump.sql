--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12
-- Dumped by pg_dump version 15.12

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
-- Name: set_deleted_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_deleted_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    IF NEW.deleted = TRUE AND OLD.deleted = FALSE THEN

        NEW.deleted_at = NOW();

    ELSIF NEW.deleted = FALSE THEN

        NEW.deleted_at = NULL;

    END IF;

    RETURN NEW;

END;

$$;


ALTER FUNCTION public.set_deleted_timestamp() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _dummy_position_references; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._dummy_position_references (
    id integer NOT NULL,
    position_id integer
);


ALTER TABLE public._dummy_position_references OWNER TO postgres;

--
-- Name: _dummy_position_references_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._dummy_position_references_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._dummy_position_references_id_seq OWNER TO postgres;

--
-- Name: _dummy_position_references_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._dummy_position_references_id_seq OWNED BY public._dummy_position_references.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    department_id integer NOT NULL,
    name text NOT NULL,
    parent_department_id integer,
    parent_position_id integer,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: active_departments; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.active_departments AS
 SELECT departments.department_id,
    departments.name,
    departments.parent_department_id,
    departments.parent_position_id,
    departments.deleted,
    departments.deleted_at
   FROM public.departments
  WHERE (departments.deleted = false);


ALTER TABLE public.active_departments OWNER TO postgres;

--
-- Name: employeeprojects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employeeprojects (
    employee_id integer NOT NULL,
    project_id integer NOT NULL,
    role text NOT NULL,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);


ALTER TABLE public.employeeprojects OWNER TO postgres;

--
-- Name: active_employeeprojects; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.active_employeeprojects AS
 SELECT employeeprojects.employee_id,
    employeeprojects.project_id,
    employeeprojects.role,
    employeeprojects.deleted,
    employeeprojects.deleted_at
   FROM public.employeeprojects
  WHERE (employeeprojects.deleted = false);


ALTER TABLE public.active_employeeprojects OWNER TO postgres;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
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
    deleted_at timestamp without time zone,
    category_parent_id integer
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: active_employees; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.active_employees AS
 SELECT employees.employee_id,
    employees.full_name,
    employees.position_id,
    employees.phone,
    employees.email,
    employees.manager_id,
    employees.department_id,
    employees.deleted,
    employees.deleted_at
   FROM public.employees
  WHERE (employees.deleted = false);


ALTER TABLE public.active_employees OWNER TO postgres;

--
-- Name: leaves; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.leaves OWNER TO postgres;

--
-- Name: active_leaves; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.active_leaves AS
 SELECT leaves.leave_id,
    leaves.employee_id,
    leaves.start_date,
    leaves.end_date,
    leaves.type,
    leaves.deleted,
    leaves.deleted_at
   FROM public.leaves
  WHERE (leaves.deleted = false);


ALTER TABLE public.active_leaves OWNER TO postgres;

--
-- Name: position_department; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.position_department OWNER TO postgres;

--
-- Name: active_position_department; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.active_position_department AS
 SELECT position_department.position_link_id,
    position_department.position_id,
    position_department.department_id,
    position_department.sort,
    position_department.deleted,
    position_department.deleted_at,
    position_department.staff_units,
    position_department.current_count,
    position_department.vacancies
   FROM public.position_department
  WHERE (position_department.deleted = false);


ALTER TABLE public.active_position_department OWNER TO postgres;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    project_id integer NOT NULL,
    name text NOT NULL,
    description text,
    department_id integer,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: active_projects; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.active_projects AS
 SELECT projects.project_id,
    projects.name,
    projects.description,
    projects.department_id,
    projects.deleted,
    projects.deleted_at
   FROM public.projects
  WHERE (projects.deleted = false);


ALTER TABLE public.active_projects OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: active_users; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.active_users AS
 SELECT users.id,
    users.username,
    users.email,
    users.password,
    users.created_at,
    users.deleted,
    users.deleted_at
   FROM public.users
  WHERE (users.deleted = false);


ALTER TABLE public.active_users OWNER TO postgres;

--
-- Name: departments_department_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.departments_department_id_seq OWNER TO postgres;

--
-- Name: departments_department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;


--
-- Name: employees_employee_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employees_employee_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.employees_employee_id_seq OWNER TO postgres;

--
-- Name: employees_employee_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_employee_id_seq OWNED BY public.employees.employee_id;


--
-- Name: leaves_leave_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leaves_leave_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.leaves_leave_id_seq OWNER TO postgres;

--
-- Name: leaves_leave_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leaves_leave_id_seq OWNED BY public.leaves.leave_id;


--
-- Name: position_department_position_link_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.position_department_position_link_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.position_department_position_link_id_seq OWNER TO postgres;

--
-- Name: position_department_position_link_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.position_department_position_link_id_seq OWNED BY public.position_department.position_link_id;


--
-- Name: position_position; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.position_position (
    position_relation_id integer NOT NULL,
    position_id integer NOT NULL,
    parent_position_id integer NOT NULL,
    department_id integer,
    sort integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted boolean DEFAULT false,
    deleted_at timestamp with time zone
);


ALTER TABLE public.position_position OWNER TO postgres;

--
-- Name: TABLE position_position; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.position_position IS 'Таблица для хранения иерархических связей между должностями в контексте отделов';


--
-- Name: COLUMN position_position.position_relation_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.position_position.position_relation_id IS 'Уникальный идентификатор связи';


--
-- Name: COLUMN position_position.position_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.position_position.position_id IS 'ID подчиненной должности';


--
-- Name: COLUMN position_position.parent_position_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.position_position.parent_position_id IS 'ID родительской должности';


--
-- Name: COLUMN position_position.department_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.position_position.department_id IS 'ID отдела, в котором действует связь (опционально)';


--
-- Name: COLUMN position_position.sort; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.position_position.sort IS 'Порядок сортировки';


--
-- Name: COLUMN position_position.deleted; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.position_position.deleted IS 'Флаг удаления (мягкое удаление)';


--
-- Name: position_position_position_relation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.position_position_position_relation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.position_position_position_relation_id_seq OWNER TO postgres;

--
-- Name: position_position_position_relation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.position_position_position_relation_id_seq OWNED BY public.position_position.position_relation_id;


--
-- Name: positions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.positions (
    position_id integer NOT NULL,
    name text NOT NULL,
    staff_units integer DEFAULT 0,
    current_count integer DEFAULT 0,
    vacancies integer DEFAULT 0,
    sort integer DEFAULT 0,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    is_category boolean DEFAULT false
);


ALTER TABLE public.positions OWNER TO postgres;

--
-- Name: positions_position_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.positions_position_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.positions_position_id_seq OWNER TO postgres;

--
-- Name: positions_position_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.positions_position_id_seq OWNED BY public.positions.position_id;


--
-- Name: projects_project_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.projects_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projects_project_id_seq OWNER TO postgres;

--
-- Name: projects_project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.projects_project_id_seq OWNED BY public.projects.project_id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    data_key text NOT NULL,
    data_value text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.settings_id_seq OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: sort_tree; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sort_tree (
    id integer NOT NULL,
    sort integer NOT NULL,
    type character varying(20) NOT NULL,
    type_id integer NOT NULL,
    parent_id integer,
    CONSTRAINT sort_tree_type_check CHECK (((type)::text = ANY (ARRAY[('department'::character varying)::text, ('position'::character varying)::text])))
);


ALTER TABLE public.sort_tree OWNER TO postgres;

--
-- Name: sort_tree_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sort_tree_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sort_tree_id_seq OWNER TO postgres;

--
-- Name: sort_tree_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sort_tree_id_seq OWNED BY public.sort_tree.id;


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: _dummy_position_references id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._dummy_position_references ALTER COLUMN id SET DEFAULT nextval('public._dummy_position_references_id_seq'::regclass);


--
-- Name: departments department_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);


--
-- Name: employees employee_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN employee_id SET DEFAULT nextval('public.employees_employee_id_seq'::regclass);


--
-- Name: leaves leave_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves ALTER COLUMN leave_id SET DEFAULT nextval('public.leaves_leave_id_seq'::regclass);


--
-- Name: position_department position_link_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.position_department ALTER COLUMN position_link_id SET DEFAULT nextval('public.position_department_position_link_id_seq'::regclass);


--
-- Name: position_position position_relation_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.position_position ALTER COLUMN position_relation_id SET DEFAULT nextval('public.position_position_position_relation_id_seq'::regclass);


--
-- Name: positions position_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions ALTER COLUMN position_id SET DEFAULT nextval('public.positions_position_id_seq'::regclass);


--
-- Name: projects project_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects ALTER COLUMN project_id SET DEFAULT nextval('public.projects_project_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: sort_tree id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sort_tree ALTER COLUMN id SET DEFAULT nextval('public.sort_tree_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: _dummy_position_references; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._dummy_position_references (id, position_id) FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) FROM stdin;
21	Администрация	\N	\N	f	\N
22	Управление	\N	39	f	\N
23	Управление цифровизации и градостроительных данных	22	\N	f	\N
24	Управление цифрового развития	22	\N	f	\N
25	Отдел координации реализации планов ОИВ	\N	50	f	\N
26	Отдел координации аналитики ПО Строительство	\N	51	f	\N
27	Отдел координации аналитики ПО Земля	\N	51	f	\N
28	Отдел координации аналитики ПО Градрешения	\N	51	f	\N
29	Отдел координации аналитики ПО Аналитики и Мониторинга	\N	51	f	\N
30	Отдел координации разработки	\N	52	f	\N
31	Отдел инженерного обеспечения	\N	52	f	\N
33	Отдел координации деятельности	\N	53	f	\N
32	Отдел тестирования	\N	52	f	\N
\.


--
-- Data for Name: employeeprojects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) FROM stdin;
82	7	Участник	f	\N
83	7	Участник	f	\N
91	7	Участник	t	2025-05-05 06:51:06.012317
84	7	Участник	t	2025-05-05 06:51:12.268273
85	7	Участник	t	2025-05-05 06:51:14.770815
88	7	Участник	f	\N
90	7	Участник	f	\N
128	7	Участник	f	\N
127	7	Участник	f	\N
86	7	Участник	f	\N
87	7	Участник	f	\N
101	7	Участник	f	\N
116	7	Участник	f	\N
118	7	Участник	f	\N
100	7	Участник	f	\N
117	7	Участник	f	\N
119	7	Участник	f	\N
108	7	Участник	f	\N
96	7	Участник	f	\N
110	7	Участник	f	\N
113	7	Участник	f	\N
114	7	Участник	f	\N
73	8	Участник	f	\N
74	8	Участник	f	\N
82	8	Участник	f	\N
83	8	Участник	f	\N
85	8	Участник	f	\N
89	8	Участник	f	\N
114	8	Участник	f	\N
93	8	Участник	f	\N
120	8	Участник	f	\N
112	8	Участник	f	\N
109	8	Участник	f	\N
107	8	Участник	f	\N
65	9	Участник	f	\N
69	9	Участник	f	\N
70	9	Участник	f	\N
81	9	Участник	f	\N
73	9	Участник	f	\N
74	9	Участник	f	\N
76	9	Участник	f	\N
77	9	Участник	f	\N
130	9	Участник	f	\N
82	9	Участник	f	\N
83	9	Участник	f	\N
85	9	Участник	f	\N
89	9	Участник	f	\N
101	9	Участник	f	\N
24	9	Участник	f	\N
108	9	Участник	f	\N
96	9	Участник	f	\N
110	9	Участник	f	\N
113	9	Участник	f	\N
114	9	Участник	f	\N
95	9	Участник	f	\N
105	9	Участник	f	\N
94	9	Участник	f	\N
121	9	Участник	f	\N
99	9	Участник	f	\N
82	10	Участник	f	\N
87	10	Участник	f	\N
101	10	Участник	f	\N
116	10	Участник	f	\N
118	10	Участник	f	\N
100	10	Участник	f	\N
117	10	Участник	f	\N
119	10	Участник	f	\N
108	10	Участник	f	\N
96	10	Участник	f	\N
110	10	Участник	f	\N
113	10	Участник	f	\N
114	10	Участник	f	\N
95	11	Участник	f	\N
111	11	Участник	f	\N
115	11	Участник	f	\N
82	12	Участник	f	\N
83	12	Участник	f	\N
128	12	Участник	f	\N
127	12	Участник	f	\N
86	12	Участник	f	\N
87	12	Участник	f	\N
95	12	Участник	f	\N
111	12	Участник	f	\N
115	12	Участник	f	\N
34	12	Участник	f	\N
46	12	Участник	f	\N
82	13	Участник	f	\N
83	13	Участник	f	\N
85	13	Участник	f	\N
91	13	Участник	f	\N
89	13	Участник	f	\N
90	13	Участник	f	\N
128	13	Участник	f	\N
127	13	Участник	f	\N
92	13	Участник	f	\N
114	13	Участник	f	\N
95	13	Участник	f	\N
105	13	Участник	f	\N
94	13	Участник	f	\N
121	13	Участник	f	\N
99	13	Участник	f	\N
106	14	Участник	f	\N
78	15	Участник	f	\N
79	15	Участник	f	\N
80	15	Участник	f	\N
93	15	Участник	f	\N
120	15	Участник	f	\N
112	15	Участник	f	\N
109	15	Участник	f	\N
107	15	Участник	f	\N
78	16	Участник	f	\N
79	16	Участник	f	\N
80	16	Участник	f	\N
93	16	Участник	f	\N
120	16	Участник	f	\N
112	16	Участник	f	\N
109	16	Участник	f	\N
107	16	Участник	f	\N
73	17	Участник	f	\N
74	17	Участник	f	\N
76	17	Участник	f	\N
82	17	Участник	f	\N
83	17	Участник	f	\N
85	17	Участник	f	\N
89	17	Участник	f	\N
74	18	Участник	f	\N
77	18	Участник	f	\N
80	18	Участник	f	\N
65	19	Участник	f	\N
69	19	Участник	f	\N
70	19	Участник	f	\N
81	19	Участник	f	\N
82	19	Участник	f	\N
83	19	Участник	f	\N
84	19	Участник	f	\N
82	20	Участник	f	\N
83	20	Участник	f	\N
85	20	Участник	f	\N
91	20	Участник	f	\N
89	20	Участник	f	\N
128	20	Участник	f	\N
127	20	Участник	f	\N
82	21	Участник	f	\N
83	21	Участник	f	\N
85	21	Участник	f	\N
89	21	Участник	f	\N
90	21	Участник	f	\N
128	21	Участник	f	\N
127	21	Участник	f	\N
86	21	Участник	f	\N
82	22	Участник	f	\N
83	22	Участник	f	\N
85	22	Участник	f	\N
89	22	Участник	f	\N
128	22	Участник	f	\N
127	22	Участник	f	\N
86	22	Участник	f	\N
82	23	Участник	f	\N
83	23	Участник	f	\N
85	23	Участник	f	\N
89	23	Участник	f	\N
92	23	Участник	f	\N
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) FROM stdin;
18	Степанова Дарья Владимировна	39	+71111111111	admin@test.ru	\N	21	f	\N	\N
20	Самарин Иван Юрьевия	46	\N	\N	\N	23	f	\N	\N
21	Тюрькин Евгений Андреевич	46	\N	\N	\N	23	f	\N	\N
22	Дремин Андрей	46	\N	\N	\N	24	f	\N	\N
23	Микляева Галина Сергеевна	46	\N	\N	\N	24	f	\N	\N
24	Попов Андрей Михайлович	47	\N	\N	\N	23	f	\N	\N
25	Коробчану Евгений Юрьевич	47	\N	\N	\N	23	f	\N	\N
27	Бубненкова Елена Вячеславовна	47	\N	\N	19	24	f	\N	\N
28	Захарова Полина Андреевна	47	\N	\N	19	24	f	\N	\N
29	Воробей Сергей Викторович	47	\N	\N	19	24	f	\N	\N
30	Шедевр Олеся	47	\N	\N	19	24	f	\N	\N
26	Чурилова Светлана Михайловна	47	\N	\N	\N	23	f	\N	\N
19	Герц Владимир Андреевич	44	\N	\N	\N	24	f	\N	\N
31	Миронова Екатерина Павловна	48	\N	\N	\N	23	f	\N	\N
32	Зелинский Андрей Николаевич	48	\N	\N	\N	23	f	\N	\N
33	Молева Анастасия Алексеевна	48	\N	\N	\N	23	f	\N	\N
34	Акимов Александр Викторович	48	\N	\N	19	24	f	\N	\N
35	Короткова Олеся Эдуардовна	48	\N	\N	19	24	f	\N	\N
36	Веревкина Ольга Дмитриевна	41	\N	\N	\N	23	f	\N	\N
37	Горошкевич Оксана Александровна	41	\N	\N	\N	23	f	\N	\N
38	Замарина Юлия Валентиновна	41	\N	\N	\N	23	f	\N	\N
39	Молева Дарья Алексеевна	41	\N	\N	\N	23	f	\N	\N
40	Похлоненко Александр Михайлович	41	\N	\N	\N	23	f	\N	\N
41	Печенкин Алексей Викторович	41	\N	\N	\N	23	f	\N	\N
42	Молева Дарья Алексеевна	41	\N	\N	\N	23	f	\N	\N
43	Вегерин Евгений Алексеевич	41	\N	\N	19	24	f	\N	\N
44	Мусаева Джамиля Лом-Алиевна	41	\N	\N	19	24	f	\N	\N
45	Акимов Михаил Александрович	41	\N	\N	19	24	f	\N	\N
46	Дупенко Владимир Сергеевич	41	\N	\N	19	24	f	\N	\N
47	Крохалевский Игорь Владимирович	41	\N	\N	19	24	f	\N	\N
48	Гутеев Роберт Андреевич	41	\N	\N	19	24	f	\N	\N
49	Шатский Никита Александрович	41	\N	\N	19	24	f	\N	\N
50	Шивцов Максим Владимирович	41	\N	\N	19	24	f	\N	\N
51	Кунец Анастасия Леонидовна	41	\N	\N	19	24	f	\N	\N
52	Щербаков Николай Владимирович	41	\N	\N	19	24	f	\N	\N
53	Аскерова Елизавета Васильевна	41	\N	\N	19	24	f	\N	\N
54	Гетманская Валерия Владимировна	49	\N	\N	\N	23	f	\N	\N
55	Зайцева Кристина Константиновна	49	\N	\N	\N	23	f	\N	\N
56	Устинович Юлиана Феликсовна 	49	\N	\N	\N	23	f	\N	\N
57	Подгорный Александр Владимирович	53	\N	\N	\N	21	f	\N	\N
58	Терновский Андрей Викторович	52	\N	\N	\N	21	f	\N	\N
59	Буланцева Дарья Андреевна	56	\N	\N	57	33	f	\N	\N
62	Шатунова Юлия Викторовна	62	\N	\N	57	33	f	\N	\N
63	Иевская Анастасия Сергеевна	63	\N	\N	57	33	f	\N	\N
61	Призенцев Иван Александрович	61	\N	\N	57	33	f	\N	\N
60	Зиндеева Елена Леонидовна	60	\N	\N	57	33	f	\N	\N
64	Косягин Дмитрий Сергеевич	66	\N	\N	\N	32	f	\N	\N
65	Вишневский Павел Александрович	69	\N	\N	\N	25	f	\N	\N
66	Колпашников Константин Михайлович	70	\N	\N	\N	25	f	\N	\N
67	Луканин Александр Валерьевич	70	\N	\N	\N	25	f	\N	\N
68	Якушев Григорий Витальевич	71	\N	\N	\N	25	f	\N	\N
69	Пьяных Евгений Николаевич	72	\N	\N	\N	25	f	\N	\N
70	Тедеева Линда Ростиславовна	73	\N	\N	\N	25	f	\N	\N
71	Беликова Вероника Георгиевна	74	\N	\N	\N	25	f	\N	\N
72	Дорохина Елена Сергеевна	74	\N	\N	\N	25	f	\N	\N
73	Панов Егор Викторович	69	\N	\N	\N	26	f	\N	\N
74	Полякова Екатерина Валентиновна	71	\N	\N	\N	26	f	\N	\N
75	Ануфриев Иван Дмитриевич	73	\N	\N	\N	26	f	\N	\N
76	Данилкин Сергей Александрович	75	\N	\N	\N	26	f	\N	\N
77	Гилязова Ляйсан Анваровна	76	\N	\N	\N	26	f	\N	\N
78	Чащин Павел Леонидович	69	\N	\N	\N	27	f	\N	\N
79	Сизёнова Анастасия Сергеевна	70	\N	\N	\N	27	f	\N	\N
80	Крюков Роман Николаевич	72	\N	\N	\N	27	f	\N	\N
81	Вишневская Светлана Александровна	73	\N	\N	\N	28	f	\N	\N
82	Коляндра Наталина Павловна	69	\N	\N	\N	29	f	\N	\N
83	Савченко Максим Павлович	70	\N	\N	82	29	f	\N	\N
84	Назаров Алексей Викторович	71	\N	\N	82	29	f	\N	\N
85	Карклис Алина Дмитриевна	72	\N	\N	82	29	f	\N	\N
86	Ямаева Ильвира Ирековна	73	\N	\N	82	29	f	\N	\N
87	Белякова Анна Сергеевна	75	\N	\N	82	29	f	\N	\N
88	Тураев Глеб Вадимович	75	\N	\N	82	29	f	\N	\N
89	Гильгамешин Георгий Данилович	77	\N	\N	82	29	f	\N	\N
90	Давыдова Полина Сергеевна	77	\N	\N	82	29	f	\N	\N
91	Месяцева Наталья Вячеславовна	78	\N	\N	82	29	f	\N	\N
92	Куров Иван Александрович	78	\N	\N	82	29	f	\N	\N
94	Джиндоев Юрий Мосесович	80	\N	\N	\N	30	f	\N	\N
95	Асрян Артем Камоевич	80	\N	\N	\N	30	f	\N	\N
93	Гарнага Алексей Анатольевич	85	\N	\N	\N	30	f	\N	79
105	Ермаков Алексей Владимирович	83	\N	\N	\N	30	f	\N	\N
102	Пономарев Ярослав Валериевич	85	\N	\N	\N	30	t	2025-05-05 01:17:05.141034	81
96	Пономарев Ярослав Валериевич	93	\N	\N	\N	30	f	\N	\N
97	Кораблев Денис Алексеевич	85	\N	\N	\N	30	t	2025-05-05 01:17:33.471029	81
103	Кораблев Денис Алексеевич	93	\N	\N	\N	30	f	\N	\N
98	Шабельников Андрей Владиленович	85	\N	\N	\N	30	t	2025-05-05 01:17:49.590375	81
104	Шабельников Андрей Владиленович	93	\N	\N	\N	30	f	\N	\N
99	Чалоян Бемал Андраникович	94	\N	\N	\N	30	f	\N	\N
100	Гайсуев Ислам Русланович	94	\N	\N	\N	30	f	\N	\N
101	Измайлов Станислав Юрьевич	95	\N	\N	\N	30	f	\N	\N
106	Шилик Павел Олегович	105	\N	\N	\N	30	f	\N	\N
107	Магафуров Айрат Раилевич	105	\N	\N	\N	30	f	\N	\N
108	Боровков Егор Николаевич	105	\N	\N	\N	30	f	\N	\N
109	Бауров Алексей Владимирович	105	\N	\N	\N	30	f	\N	\N
110	Зятковский Владислав Олегович	105	\N	\N	\N	30	f	\N	\N
111	Полянский Борис Петрович	105	\N	\N	\N	30	f	\N	\N
112	Коваленко Юрий Александрович	96	\N	\N	\N	30	f	\N	\N
113	Ражев Иван Юрьевич	96	\N	\N	\N	30	f	\N	\N
114	Раченко Вячеслав Александрович	96	\N	\N	\N	30	f	\N	\N
115	Прокопьев Вячеслав Алексеевич	96	\N	\N	\N	30	f	\N	\N
116	Абрамов Руслан Владимирович	96	\N	\N	\N	30	f	\N	\N
117	Дашкин Богдан Владимирович	96	\N	\N	\N	30	f	\N	\N
118	Попов Сергей Павлович	96	\N	\N	\N	30	f	\N	\N
119	Орлов Павел Александрович	97	\N	\N	\N	30	f	\N	\N
120	Щербаков Ярослав Юрьевич	98	\N	\N	\N	30	f	\N	\N
121	Салахутдинов Марат Рамилевич	98	\N	\N	\N	30	f	\N	\N
122	Зайцева Наталья Владимировна	103	\N	\N	\N	30	f	\N	\N
123	Сухов Николай Николаевич	106	\N	\N	\N	31	f	\N	\N
124	Байков Михаил Сергеевич	114	\N	\N	\N	31	f	\N	\N
125	Леденев Сергей Александрович	118	\N	\N	\N	31	f	\N	\N
126	Пак Валерия Викторовна	119	\N	\N	\N	31	f	\N	\N
127	Пинчук Екатерина Сергеевна	119	\N	\N	\N	31	f	\N	\N
128	Халикова Элеонора Шахруховна	120	\N	\N	\N	31	f	\N	\N
129	Аркадьева Олеся Александровна	120	\N	\N	\N	31	f	\N	\N
130	Филимонов Алексей Алексеевич	75	\N	\N	73	26	f	\N	\N
\.


--
-- Data for Name: leaves; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leaves (leave_id, employee_id, start_date, end_date, type, deleted, deleted_at) FROM stdin;
\.


--
-- Data for Name: position_department; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) FROM stdin;
52	40	21	0	f	\N	0	0	1
53	41	21	0	f	\N	0	0	1
54	42	21	0	f	\N	1	0	1
55	43	21	0	f	\N	0	0	1
56	44	23	0	f	\N	0	0	1
57	44	24	0	f	\N	0	0	1
60	46	23	0	f	\N	0	0	1
61	46	24	0	f	\N	0	0	1
58	45	23	0	f	\N	0	0	2
59	45	24	0	f	\N	0	0	2
64	47	23	0	f	\N	0	0	3
65	47	24	0	f	\N	0	0	4
66	48	23	0	f	\N	0	0	3
67	48	24	0	f	\N	0	0	2
69	41	24	0	f	\N	0	0	13
70	49	23	0	f	\N	0	0	3
68	41	23	0	f	\N	0	0	7
71	50	21	0	f	\N	0	0	1
72	51	21	0	f	\N	0	0	1
73	52	21	0	f	\N	0	0	1
74	53	21	0	f	\N	0	0	1
75	54	30	0	f	\N	0	0	1
76	56	33	0	f	\N	0	0	1
78	58	33	0	f	\N	0	0	1
79	59	33	0	f	\N	0	0	1
81	64	33	0	f	\N	0	0	1
82	63	33	0	f	\N	0	0	1
83	62	33	0	f	\N	0	0	1
84	61	33	0	f	\N	0	0	1
80	60	33	0	f	\N	0	0	2
85	65	32	0	f	\N	0	0	1
86	66	32	0	f	\N	0	0	4
87	67	32	0	f	\N	0	0	4
88	68	32	0	f	\N	0	0	2
89	57	33	0	f	\N	0	0	1
51	39	21	0	f	\N	0	0	1
90	69	25	0	f	\N	0	0	1
91	70	25	0	f	\N	0	0	2
92	71	25	0	f	\N	0	0	1
93	74	25	0	f	\N	0	0	5
94	73	25	0	f	\N	0	0	1
95	72	25	0	f	\N	0	0	2
98	69	26	0	f	\N	0	0	2
101	70	26	0	f	\N	0	0	2
102	71	26	0	f	\N	0	0	3
103	72	26	0	f	\N	0	0	3
104	73	26	0	f	\N	0	0	3
106	75	26	0	f	\N	0	0	4
107	76	26	0	f	\N	0	0	1
108	69	27	0	f	\N	0	0	1
110	71	27	0	f	\N	0	0	5
111	70	27	0	f	\N	0	0	3
112	72	27	0	f	\N	0	0	3
113	73	27	0	f	\N	0	0	3
114	75	27	0	f	\N	0	0	1
115	77	27	0	f	\N	0	0	2
116	69	28	0	f	\N	0	0	1
117	70	28	0	f	\N	0	0	2
118	71	28	0	f	\N	0	0	3
119	72	28	0	f	\N	0	0	2
120	73	28	0	f	\N	0	0	2
121	75	28	0	f	\N	0	0	1
122	77	28	0	f	\N	0	0	1
123	69	29	0	f	\N	0	0	2
124	70	29	0	f	\N	0	0	1
125	71	29	0	f	\N	0	0	2
126	72	29	0	f	\N	0	0	3
127	73	29	0	f	\N	0	0	1
128	75	29	0	f	\N	0	0	2
129	77	29	0	f	\N	0	0	2
130	78	29	0	f	\N	0	0	2
133	81	30	0	f	\N	0	0	1
135	79	30	0	f	\N	0	0	1
136	82	30	0	f	\N	0	0	1
137	83	30	0	f	\N	0	0	1
165	99	30	0	f	\N	0	0	1
170	104	30	0	f	\N	0	0	1
171	103	30	0	f	\N	0	0	1
173	102	30	0	f	\N	0	0	1
174	101	30	0	f	\N	0	0	1
180	110	31	0	f	\N	0	0	2
134	80	30	0	f	\N	0	0	11
160	94	30	0	f	\N	0	0	4
161	95	30	0	f	\N	0	0	2
162	96	30	0	f	\N	0	0	7
163	97	30	0	f	\N	0	0	3
164	98	30	0	f	\N	0	0	2
172	100	30	0	f	\N	0	0	2
169	90	30	0	f	\N	0	0	12
168	92	30	0	f	\N	0	0	3
167	91	30	0	f	\N	0	0	11
166	93	30	0	f	\N	0	0	4
175	105	30	0	f	\N	0	0	6
176	106	31	0	f	\N	0	0	1
177	107	31	0	f	\N	0	0	1
178	108	31	0	f	\N	0	0	1
179	109	31	0	f	\N	0	0	1
181	111	31	0	f	\N	0	0	3
182	112	31	0	f	\N	0	0	4
183	113	31	0	f	\N	0	0	1
184	114	31	0	f	\N	0	0	3
185	115	31	0	f	\N	0	0	3
186	116	31	0	f	\N	0	0	4
187	117	31	0	f	\N	0	0	5
188	118	31	0	f	\N	0	0	1
189	119	31	0	f	\N	0	0	3
190	120	31	0	f	\N	0	0	2
\.


--
-- Data for Name: position_position; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.position_position (position_relation_id, position_id, parent_position_id, department_id, sort, created_at, updated_at, deleted, deleted_at) FROM stdin;
15	43	39	21	\N	2025-05-02 16:02:57.987649+00	2025-05-02 16:02:57.987649+00	f	\N
16	45	44	23	\N	2025-05-02 17:45:07.21656+00	2025-05-02 17:45:07.21656+00	f	\N
17	45	44	24	\N	2025-05-02 17:45:14.827438+00	2025-05-02 17:45:14.827438+00	f	\N
18	46	44	23	\N	2025-05-03 08:39:16.125723+00	2025-05-03 08:39:16.125723+00	f	\N
19	46	44	24	\N	2025-05-03 08:39:23.693913+00	2025-05-03 08:39:23.693913+00	f	\N
20	47	44	23	\N	2025-05-03 08:53:43.261121+00	2025-05-03 08:53:43.261121+00	f	\N
21	47	44	24	\N	2025-05-03 08:53:54.785652+00	2025-05-03 08:53:54.785652+00	f	\N
22	48	44	23	\N	2025-05-03 09:05:31.042169+00	2025-05-03 09:05:31.042169+00	f	\N
23	48	44	24	\N	2025-05-03 09:05:50.772632+00	2025-05-03 09:05:50.772632+00	f	\N
24	41	44	23	\N	2025-05-03 09:11:34.005764+00	2025-05-03 09:11:34.005764+00	f	\N
25	41	44	24	\N	2025-05-03 09:13:09.338969+00	2025-05-03 09:13:09.338969+00	f	\N
26	49	44	23	\N	2025-05-03 09:25:34.047093+00	2025-05-03 09:25:34.047093+00	f	\N
27	50	43	21	\N	2025-05-03 09:30:36.820582+00	2025-05-03 09:30:36.820582+00	f	\N
28	51	43	21	\N	2025-05-03 09:31:35.735612+00	2025-05-03 09:31:35.735612+00	f	\N
29	52	43	21	\N	2025-05-03 09:32:07.992658+00	2025-05-03 09:32:07.992658+00	f	\N
30	53	43	21	\N	2025-05-03 09:32:34.735864+00	2025-05-03 09:32:34.735864+00	f	\N
31	66	65	32	\N	2025-05-03 10:01:01.31997+00	2025-05-03 10:01:01.31997+00	f	\N
32	67	65	32	\N	2025-05-03 10:01:23.499397+00	2025-05-03 10:01:23.499397+00	f	\N
33	68	65	32	\N	2025-05-03 10:01:37.709655+00	2025-05-03 10:01:37.709655+00	f	\N
34	57	56	33	\N	2025-05-03 10:03:05.226585+00	2025-05-03 10:03:05.226585+00	f	\N
35	70	69	26	\N	2025-05-04 22:11:39.335914+00	2025-05-04 22:11:39.335914+00	f	\N
36	71	69	26	\N	2025-05-04 22:11:52.009142+00	2025-05-04 22:11:52.009142+00	f	\N
37	72	69	26	\N	2025-05-04 22:12:08.888426+00	2025-05-04 22:12:08.888426+00	f	\N
38	73	69	26	\N	2025-05-04 22:12:18.468362+00	2025-05-04 22:12:18.468362+00	f	\N
39	75	69	26	\N	2025-05-04 22:13:47.092749+00	2025-05-04 22:13:47.092749+00	f	\N
40	76	69	26	\N	2025-05-04 22:14:02.456516+00	2025-05-04 22:14:02.456516+00	f	\N
41	71	69	27	\N	2025-05-04 22:17:29.817671+00	2025-05-04 22:17:29.817671+00	f	\N
42	70	69	27	\N	2025-05-04 22:17:41.590679+00	2025-05-04 22:17:41.590679+00	f	\N
43	72	69	27	\N	2025-05-04 22:18:07.081169+00	2025-05-04 22:18:07.081169+00	f	\N
44	73	69	27	\N	2025-05-04 22:18:20.808417+00	2025-05-04 22:18:20.808417+00	f	\N
45	75	69	27	\N	2025-05-04 22:18:36.603745+00	2025-05-04 22:18:36.603745+00	f	\N
46	77	69	27	\N	2025-05-04 22:18:50.558863+00	2025-05-04 22:18:50.558863+00	f	\N
47	70	69	28	\N	2025-05-04 22:21:27.704023+00	2025-05-04 22:21:27.704023+00	f	\N
48	71	69	28	\N	2025-05-04 22:21:42.429567+00	2025-05-04 22:21:42.429567+00	f	\N
49	72	69	28	\N	2025-05-04 22:22:06.878976+00	2025-05-04 22:22:06.878976+00	f	\N
50	73	69	28	\N	2025-05-04 22:22:22.222901+00	2025-05-04 22:22:22.222901+00	f	\N
51	75	69	28	\N	2025-05-04 22:22:32.622221+00	2025-05-04 22:22:32.622221+00	f	\N
52	77	69	28	\N	2025-05-04 22:22:43.968587+00	2025-05-04 22:22:43.968587+00	f	\N
53	70	69	29	\N	2025-05-04 22:24:52.77278+00	2025-05-04 22:24:52.77278+00	f	\N
54	71	69	29	\N	2025-05-04 22:25:14.929075+00	2025-05-04 22:25:14.929075+00	f	\N
55	72	69	29	\N	2025-05-04 22:25:29.984018+00	2025-05-04 22:25:29.984018+00	f	\N
56	73	69	29	\N	2025-05-04 22:25:43.800011+00	2025-05-04 22:25:43.800011+00	f	\N
57	75	69	29	\N	2025-05-04 22:25:57.391485+00	2025-05-04 22:25:57.391485+00	f	\N
58	77	69	29	\N	2025-05-04 22:26:11.742372+00	2025-05-04 22:26:11.742372+00	f	\N
59	78	69	29	\N	2025-05-04 22:26:23.934023+00	2025-05-04 22:26:23.934023+00	f	\N
60	81	54	30	\N	2025-05-04 22:37:04.812661+00	2025-05-04 22:37:04.812661+00	f	\N
61	80	54	30	\N	2025-05-04 22:37:22.277064+00	2025-05-04 22:37:22.277064+00	f	\N
62	79	54	30	\N	2025-05-04 22:37:41.613471+00	2025-05-04 22:37:41.613471+00	f	\N
63	82	54	30	\N	2025-05-04 22:37:53.962867+00	2025-05-04 22:37:53.962867+00	f	\N
64	83	54	30	\N	2025-05-04 22:38:06.479205+00	2025-05-04 22:38:06.479205+00	f	\N
81	84	81	30	\N	2025-05-05 00:55:27.709389+00	2025-05-05 00:55:27.709389+00	f	\N
82	85	81	30	\N	2025-05-05 00:56:14.755831+00	2025-05-05 00:56:14.755831+00	f	\N
83	84	79	30	\N	2025-05-05 01:03:36.902336+00	2025-05-05 01:03:36.902336+00	f	\N
84	84	82	30	\N	2025-05-05 01:03:56.437478+00	2025-05-05 01:03:56.437478+00	f	\N
85	84	83	30	\N	2025-05-05 01:04:05.773758+00	2025-05-05 01:04:05.773758+00	f	\N
87	94	54	30	\N	2025-05-05 01:13:24.317057+00	2025-05-05 01:13:24.317057+00	f	\N
88	95	54	30	\N	2025-05-05 01:13:32.723086+00	2025-05-05 01:13:32.723086+00	f	\N
89	96	54	30	\N	2025-05-05 01:13:39.466678+00	2025-05-05 01:13:39.466678+00	f	\N
90	97	54	30	\N	2025-05-05 01:13:46.170505+00	2025-05-05 01:13:46.170505+00	f	\N
91	98	54	30	\N	2025-05-05 01:13:53.707726+00	2025-05-05 01:13:53.707726+00	f	\N
92	99	54	30	\N	2025-05-05 01:14:02.322388+00	2025-05-05 01:14:02.322388+00	f	\N
93	93	54	30	\N	2025-05-05 01:14:13.813203+00	2025-05-05 01:14:13.813203+00	f	\N
94	91	54	30	\N	2025-05-05 01:14:21.595401+00	2025-05-05 01:14:21.595401+00	f	\N
95	92	54	30	\N	2025-05-05 01:14:27.755572+00	2025-05-05 01:14:27.755572+00	f	\N
96	90	54	30	\N	2025-05-05 01:14:34.489668+00	2025-05-05 01:14:34.489668+00	f	\N
97	104	54	30	\N	2025-05-05 01:14:39.867056+00	2025-05-05 01:14:39.867056+00	f	\N
98	103	54	30	\N	2025-05-05 01:14:46.594245+00	2025-05-05 01:14:46.594245+00	f	\N
99	100	54	30	\N	2025-05-05 01:14:54.692782+00	2025-05-05 01:14:54.692782+00	f	\N
100	102	54	30	\N	2025-05-05 01:15:01.475243+00	2025-05-05 01:15:01.475243+00	f	\N
101	101	54	30	\N	2025-05-05 01:15:08.732347+00	2025-05-05 01:15:08.732347+00	f	\N
102	105	54	30	\N	2025-05-05 01:20:37.449776+00	2025-05-05 01:20:37.449776+00	f	\N
103	107	106	31	\N	2025-05-05 06:35:05.333506+00	2025-05-05 06:35:05.333506+00	f	\N
104	108	107	31	\N	2025-05-05 06:35:15.39495+00	2025-05-05 06:35:15.39495+00	f	\N
105	109	107	31	\N	2025-05-05 06:35:26.740697+00	2025-05-05 06:35:26.740697+00	f	\N
106	110	107	31	\N	2025-05-05 06:35:40.533908+00	2025-05-05 06:35:40.533908+00	f	\N
107	111	107	31	\N	2025-05-05 06:35:51.717673+00	2025-05-05 06:35:51.717673+00	f	\N
108	112	107	31	\N	2025-05-05 06:36:04.276304+00	2025-05-05 06:36:04.276304+00	f	\N
109	113	107	31	\N	2025-05-05 06:36:17.451825+00	2025-05-05 06:36:17.451825+00	f	\N
110	114	107	31	\N	2025-05-05 06:36:30.610733+00	2025-05-05 06:36:30.610733+00	f	\N
111	115	107	31	\N	2025-05-05 06:36:47.091124+00	2025-05-05 06:36:47.091124+00	f	\N
112	116	107	31	\N	2025-05-05 06:36:58.363919+00	2025-05-05 06:36:58.363919+00	f	\N
113	117	107	31	\N	2025-05-05 06:37:13.955864+00	2025-05-05 06:37:13.955864+00	f	\N
114	118	107	31	\N	2025-05-05 06:37:28.745988+00	2025-05-05 06:37:28.745988+00	f	\N
115	119	107	31	\N	2025-05-05 06:37:43.98634+00	2025-05-05 06:37:43.98634+00	f	\N
116	120	107	31	\N	2025-05-05 06:37:57.571035+00	2025-05-05 06:37:57.571035+00	f	\N
\.


--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.positions (position_id, name, staff_units, current_count, vacancies, sort, deleted, deleted_at, is_category) FROM stdin;
39	Заместитель руководителя департамента	0	0	0	0	f	\N	f
40	Главный эксперт	0	0	0	0	f	\N	f
41	Главный специалист	0	0	0	0	f	\N	f
43	Генеральный директор	0	0	0	0	f	\N	f
44	Начальник управления	0	0	0	0	f	\N	f
45	Заместитель начальника управления	0	0	0	0	f	\N	f
46	Руководитель проекта	0	0	0	0	f	\N	f
47	Администратор проекта	0	0	0	0	f	\N	f
48	Главный эксперт	0	0	0	0	f	\N	f
50	Заместитель генерального директора по координации реализации планов ОИВ	0	0	0	0	f	\N	f
51	Заместитель генерального директора по координации аналитики	0	0	0	0	f	\N	f
52	Заместитель генерального директора по координации разработки	0	0	0	0	f	\N	f
53	Исполнительный директор	0	0	0	0	f	\N	f
54	Начальник отдела (Руководитель команды)	0	0	0	0	f	\N	f
56	Главный бухгалтер	0	0	0	0	f	\N	f
57	Специалист по бухгалтерскому учету и отчетности 	0	0	0	0	f	\N	f
58	Специалист по охране труда	0	0	0	0	f	\N	f
59	Специалист по административно-хозяйственному обеспечению	0	0	0	0	f	\N	f
60	Специалист по подбору персонала	0	0	0	0	f	\N	f
61	Руководитель направления закупочной деятельности	0	0	0	0	f	\N	f
62	Руководитель направления кадрового администрирования	0	0	0	0	f	\N	f
63	Руководитель направления правового обеспечения	0	0	0	0	f	\N	f
64	Юрист	0	0	0	0	f	\N	f
65	Руководитель отдела тестирования	0	0	0	0	f	\N	f
66	Главный тестировщик	0	0	0	0	f	\N	f
67	Ведущий тестировщик	0	0	0	0	f	\N	f
68	Тестировщик	0	0	0	0	f	\N	f
69	Руководитель проекта	0	0	0	0	f	\N	f
70	Заместитель руководителя 	0	0	0	0	f	\N	f
71	Главный аналитик	0	0	0	0	f	\N	f
72	Ведущий аналитик	0	0	0	0	f	\N	f
73	Старший аналитик	0	0	0	0	f	\N	f
74	Администратор	0	0	0	0	f	\N	f
75	Аналитик	0	0	0	0	f	\N	f
49	Ведущий специалист	0	0	0	0	f	\N	f
76	Ведущий аналитик СУИД	0	0	0	0	f	\N	f
77	Младший аналитик	0	0	0	0	f	\N	f
78	Аналитик-координатор	0	0	0	0	f	\N	f
80	Ведущий разработчик	0	0	0	0	f	\N	f
83	Специалист по цифровым решениям	0	0	0	0	f	\N	f
94	Старший разработчик III категории	0	0	0	0	f	\N	f
95	Старший разработчик IV категории	0	0	0	0	f	\N	f
96	Разработчик II категории	0	0	0	0	f	\N	f
97	Разработчик III категории	0	0	0	0	f	\N	f
98	Разработчик IV категории	0	0	0	0	f	\N	f
99	Специалист по цифровым решениям I категории	0	0	0	0	f	\N	f
100	Специалист по цифровым решениям II категории	0	0	0	0	f	\N	f
101	Специалист по цифровым решениям III категории	0	0	0	0	f	\N	f
102	Специалист по цифровым решениям IV категории	0	0	0	0	f	\N	f
103	Специалист по цифровым решениям V категории	0	0	0	0	f	\N	f
104	Специалист по цифровым решениям IV категории	0	0	0	0	f	\N	f
90	Главный разработчик I категории	0	0	0	0	f	\N	f
92	Старший разработчик I категории	0	0	0	0	f	\N	f
91	Главный разработчик II категории	0	0	0	0	f	\N	f
93	Старший разработчик II категории	0	0	0	0	f	\N	f
105	Разработчик I категории	0	0	0	0	f	\N	f
106	Руководитель проектов по эксплуатации информационных систем	0	0	0	0	f	\N	f
107	Начальник отдела - Руководитель блока	0	0	0	0	f	\N	f
108	Ведущий специалист информационной безопасности	0	0	0	0	f	\N	f
109	Специалист информационной безопасности	0	0	0	0	f	\N	f
110	Архитектор	0	0	0	0	f	\N	f
111	Системный администратор	0	0	0	0	f	\N	f
112	Технический писатель	0	0	0	0	f	\N	f
113	Системный инженер I категории	0	0	0	0	f	\N	f
114	Системный инженер II категории	0	0	0	0	f	\N	f
115	Системный инженер III категории	0	0	0	0	f	\N	f
116	Системный инженер IV категории	0	0	0	0	f	\N	f
117	Ведущий дизайнер интерфейсов	0	0	0	0	f	\N	f
118	Специалист технической поддержки	0	0	0	0	f	\N	f
119	Дизайнер интерфейсов	0	0	0	0	f	\N	f
120	Дизайнер	0	0	0	0	f	\N	f
121	Руководитель отдела тестирования	0	0	0	0	f	\N	f
124	Тестировщик	0	0	0	0	t	2025-05-05 06:43:19.79533	f
122	Главный тестировщик	0	0	0	0	t	2025-05-05 06:43:23.137931	f
123	Ведущий тестировщик	0	0	0	0	t	2025-05-05 06:43:26.18248	f
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (project_id, name, description, department_id, deleted, deleted_at) FROM stdin;
7	ИАС УГД		\N	f	\N
8	ЕИС МГЗ		\N	f	\N
11	СтройМос		\N	f	\N
12	СтроимПросто		\N	f	\N
13	Строймониторинг		\N	f	\N
14	SuperSet		\N	f	\N
15	АИС РЕОН		\N	f	\N
16	АИС РСМ		\N	f	\N
17	СУИД		\N	f	\N
18	BS		\N	f	\N
19	KPI		\N	f	\N
20	Рейтинг ОИВ		\N	f	\N
21	Производственные программы		\N	f	\N
22	ДБ Аналитика 	ДБ Аналитика (Сенина)	\N	f	\N
23	EXON		\N	f	\N
9	СУПД АКЦЕНТ		\N	f	\N
10	ИАС ОГД		\N	f	\N
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, data_key, data_value, created_at, updated_at) FROM stdin;
1	hierarchy_initial_levels	3	2025-04-27 10:36:15.699481	2025-05-03 09:00:46.694
\.


--
-- Data for Name: sort_tree; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sort_tree (id, sort, type, type_id, parent_id) FROM stdin;
2	0	position	24	\N
1	0	position	23	\N
4	0	department	17	\N
5	0	position	25	\N
6	0	department	18	\N
7	0	position	33	\N
8	0	position	30	\N
9	0	position	28	\N
10	0	position	34	\N
12	0	position	31	\N
13	0	position	35	\N
14	0	position	26	\N
15	0	position	29	\N
11	0	department	20	\N
3	0	department	19	\N
18	0	position	23	17
19	2	position	26	17
21	0	department	19	18
20	1	department	20	18
22	21	department	21	\N
24	0	position	39	21
23	1	position	41	21
25	2	position	40	21
26	1	position	41	23
27	0	position	45	23
29	0	position	80	30
30	1	position	83	30
31	2	position	90	30
32	3	position	91	30
34	5	position	93	30
35	6	position	94	30
33	4	position	92	30
28	8	position	105	30
36	7	position	95	30
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, created_at, deleted, deleted_at) FROM stdin;
1	admin	admin@example.com	8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918	2025-04-24 07:52:25.855195	f	\N
\.


--
-- Name: _dummy_position_references_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public._dummy_position_references_id_seq', 1, false);


--
-- Name: departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_department_id_seq', 33, true);


--
-- Name: employees_employee_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_employee_id_seq', 130, true);


--
-- Name: leaves_leave_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leaves_leave_id_seq', 1, false);


--
-- Name: position_department_position_link_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.position_department_position_link_id_seq', 190, true);


--
-- Name: position_position_position_relation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.position_position_position_relation_id_seq', 116, true);


--
-- Name: positions_position_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.positions_position_id_seq', 124, true);


--
-- Name: projects_project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projects_project_id_seq', 23, true);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settings_id_seq', 2, false);


--
-- Name: sort_tree_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sort_tree_id_seq', 36, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, false);


--
-- Name: _dummy_position_references _dummy_position_references_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._dummy_position_references
    ADD CONSTRAINT _dummy_position_references_pkey PRIMARY KEY (id);


--
-- Name: employeeprojects employeeprojects_employee_id_project_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employeeprojects
    ADD CONSTRAINT employeeprojects_employee_id_project_id_pk PRIMARY KEY (employee_id, project_id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (employee_id);


--
-- Name: departments idx_department_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT idx_department_id UNIQUE (department_id);


--
-- Name: positions idx_position_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT idx_position_id UNIQUE (position_id);


--
-- Name: leaves leaves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_pkey PRIMARY KEY (leave_id);


--
-- Name: position_position position_position_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.position_position
    ADD CONSTRAINT position_position_pkey PRIMARY KEY (position_relation_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (project_id);


--
-- Name: settings settings_data_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_data_key_key UNIQUE (data_key);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: sort_tree sort_tree_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sort_tree
    ADD CONSTRAINT sort_tree_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: idx_position_position_department_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_position_position_department_id ON public.position_position USING btree (department_id);


--
-- Name: idx_position_position_parent_position_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_position_position_parent_position_id ON public.position_position USING btree (parent_position_id);


--
-- Name: idx_position_position_position_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_position_position_position_id ON public.position_position USING btree (position_id);


--
-- Name: idx_position_position_unique_relation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_position_position_unique_relation ON public.position_position USING btree (position_id, parent_position_id, department_id) WHERE (deleted = false);


--
-- Name: sort_tree_type_type_id_parent_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX sort_tree_type_type_id_parent_id_unique ON public.sort_tree USING btree (type, type_id, parent_id);


--
-- Name: departments set_departments_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_departments_deleted_timestamp BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: employeeprojects set_employeeprojects_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_employeeprojects_deleted_timestamp BEFORE UPDATE ON public.employeeprojects FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: employees set_employees_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_employees_deleted_timestamp BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: leaves set_leaves_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_leaves_deleted_timestamp BEFORE UPDATE ON public.leaves FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: position_department set_position_department_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_position_department_deleted_timestamp BEFORE UPDATE ON public.position_department FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: positions set_positions_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_positions_deleted_timestamp BEFORE UPDATE ON public.positions FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: projects set_projects_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_projects_deleted_timestamp BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: users set_users_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_users_deleted_timestamp BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: _dummy_position_references _dummy_position_references_position_id_positions_position_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._dummy_position_references
    ADD CONSTRAINT _dummy_position_references_position_id_positions_position_id_fk FOREIGN KEY (position_id) REFERENCES public.positions(position_id);


--
-- Name: employeeprojects employeeprojects_employee_id_employees_employee_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employeeprojects
    ADD CONSTRAINT employeeprojects_employee_id_employees_employee_id_fk FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id);


--
-- Name: employeeprojects employeeprojects_project_id_projects_project_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employeeprojects
    ADD CONSTRAINT employeeprojects_project_id_projects_project_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- Name: employees employees_department_id_departments_department_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_department_id_departments_department_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: position_position fk_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.position_position
    ADD CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: leaves leaves_employee_id_employees_employee_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_employee_id_employees_employee_id_fk FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id);


--
-- Name: position_department position_department_department_id_departments_department_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.position_department
    ADD CONSTRAINT position_department_department_id_departments_department_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: projects projects_department_id_departments_department_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_department_id_departments_department_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- PostgreSQL database dump complete
--

