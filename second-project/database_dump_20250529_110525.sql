--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
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
-- Name: departments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name text NOT NULL,
    logo_path text,
    is_managment boolean DEFAULT false
);


ALTER TABLE public.departments OWNER TO neondb_owner;

--
-- Name: employee_positions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.employee_positions (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    org_unit_id integer NOT NULL,
    is_head boolean DEFAULT false,
    assigned_at timestamp without time zone DEFAULT now(),
    position_id integer
);


ALTER TABLE public.employee_positions OWNER TO neondb_owner;

--
-- Name: employee_positions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.employee_positions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_positions_id_seq OWNER TO neondb_owner;

--
-- Name: employee_positions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.employee_positions_id_seq OWNED BY public.employee_positions.id;


--
-- Name: employee_project_roles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.employee_project_roles (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    project_role_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.employee_project_roles OWNER TO neondb_owner;

--
-- Name: employee_project_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.employee_project_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_project_roles_id_seq OWNER TO neondb_owner;

--
-- Name: employee_project_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.employee_project_roles_id_seq OWNED BY public.employee_project_roles.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    full_name text NOT NULL,
    email text,
    phone text,
    position_id integer,
    department_id integer,
    manager_id integer,
    created_at timestamp without time zone DEFAULT now(),
    legacy_id integer
);


ALTER TABLE public.employees OWNER TO neondb_owner;

--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_id_seq OWNER TO neondb_owner;

--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: org_units; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.org_units (
    id integer NOT NULL,
    type text NOT NULL,
    type_id integer NOT NULL,
    parent_id integer,
    staff_count integer DEFAULT 1,
    logo text,
    head_employee_id integer,
    head_position_id integer,
    position_x real DEFAULT 0,
    position_y real DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.org_units OWNER TO neondb_owner;

--
-- Name: org_units_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.org_units_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.org_units_id_seq OWNER TO neondb_owner;

--
-- Name: org_units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.org_units_id_seq OWNED BY public.org_units.id;


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.organizations (
    id integer NOT NULL,
    name text NOT NULL,
    logo_path text
);


ALTER TABLE public.organizations OWNER TO neondb_owner;

--
-- Name: positions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.positions (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.positions OWNER TO neondb_owner;

--
-- Name: project_roles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.project_roles (
    id integer NOT NULL,
    name text NOT NULL,
    project_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.project_roles OWNER TO neondb_owner;

--
-- Name: project_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.project_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.project_roles_id_seq OWNER TO neondb_owner;

--
-- Name: project_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.project_roles_id_seq OWNED BY public.project_roles.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.projects OWNER TO neondb_owner;

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projects_id_seq OWNER TO neondb_owner;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: employee_positions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_positions ALTER COLUMN id SET DEFAULT nextval('public.employee_positions_id_seq'::regclass);


--
-- Name: employee_project_roles id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_project_roles ALTER COLUMN id SET DEFAULT nextval('public.employee_project_roles_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: org_units id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.org_units ALTER COLUMN id SET DEFAULT nextval('public.org_units_id_seq'::regclass);


--
-- Name: project_roles id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.project_roles ALTER COLUMN id SET DEFAULT nextval('public.project_roles_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.departments (id, name, logo_path, is_managment) FROM stdin;
1	Администрация	\N	f
2	Отдел координации аналитики ПО Строительство	\N	f
3	Управление цифрового развития	\N	t
4	Отдел координации реализации планов ОИВ	\N	f
5	Управление цифровизации и градостроительных данных	\N	t
6	Отдел координации аналитики ПО Земля	\N	f
8	Отдел координации аналитики ПО Аналитики и Мониторинга	\N	f
7	Отдел координации аналитики ПО Градрешения	\N	f
9	Отдел координации разработки	\N	f
10	Отдел инженерного обеспечения	\N	f
11	Отдел тестирования	\N	f
12	Отдел координации деятельности	\N	f
\.


--
-- Data for Name: employee_positions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.employee_positions (id, employee_id, org_unit_id, is_head, assigned_at, position_id) FROM stdin;
27	54	24	f	2025-05-24 19:36:10.206461	46
35	26	17	f	2025-05-26 10:14:53.989645	3
36	60	17	f	2025-05-26 10:14:54.197134	3
37	51	17	f	2025-05-26 10:14:54.371502	3
38	26	22	f	2025-05-26 15:49:53.50825	8
\.


--
-- Data for Name: employee_project_roles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.employee_project_roles (id, employee_id, project_role_id, created_at) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.employees (id, full_name, email, phone, position_id, department_id, manager_id, created_at, legacy_id) FROM stdin;
26	Гутеев Роберт Андреевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	48
60	Давыдова Полина Сергеевна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	90
51	Данилкин Сергей Александрович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	76
109	Дашкин Богдан Владимирович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	117
62	Джиндоев Юрий Мосесович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	94
76	Долгов Кирилл Сергеевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	3
43	Дорохина Елена Сергеевна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	72
3	Дремин Андрей	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	22
24	Дупенко Владимир Сергеевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	46
115	Ермаков Алексей Владимирович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	105
86	Жданова Наталия Витальевна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	12
82	Жуков Дмитрий Владимирович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	8
32	Зайцева Кристина Константиновна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	55
116	Зайцева Наталья Владимировна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	122
16	Замарина Юлия Валентиновна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	38
72	Захарова Полина Андреевна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	28
10	Зелинский Андрей Николаевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	32
136	Землякова Тамара Алексеевна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	139
65	Зиндеева Елена Леонидовна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	60
103	Зятковский Владислав Олегович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	110
67	Иевская Анастасия Сергеевна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	63
99	Измайлов Станислав Юрьевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	101
56	Карклис Алина Дмитриевна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	85
74	Коваленко Ольга Андреевна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	1
97	Коваленко Юрий Александрович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	112
134	Койнак Марина Петровна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	137
36	Колпашников Константин Михайлович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	66
46	Коляндра Наталина Павловна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	82
92	Кораблев Денис Алексеевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	103
5	Коробчану Евгений Юрьевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	25
13	Короткова Олеся Эдуардовна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	35
83	Корягина Наталья Владимировна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	9
64	Косягин Дмитрий Сергеевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	64
126	Котик Алисия Александровна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	132
121	Красильникова Анна Алексеевна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	131
25	Крохалевский Игорь Владимирович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	47
53	Крюков Роман Николаевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	80
78	Кузнеченко Дмитрий Александрович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	4
28	Кунец Анастасия Леонидовна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	51
61	Куров Иван Александрович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	92
35	Буланцева Дарья Андреевна	\N	\N	121	\N	\N	2025-05-22 21:21:11.374598	59
102	Бауров Алексей Владимирович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	109
52	Бубненкова Елена Вячеславовна	\N	\N	121	\N	\N	2025-05-22 21:21:11.374598	27
14	Веревкина Ольга Дмитриевна	\N	\N	121	\N	\N	2025-05-22 21:21:11.374598	36
101	Боровков Егор Николаевич	\N	\N	46	\N	\N	2025-05-22 21:21:11.374598	108
96	Гайсуев Ислам Русланович	\N	\N	60	\N	\N	2025-05-22 21:21:11.374598	100
90	Гарнага Алексей Анатольевич	\N	\N	7	\N	\N	2025-05-22 21:21:11.374598	93
37	Вишневский Павел Александрович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	65
30	Аскерова Елизавета Васильевна	\N	\N	48	\N	\N	2025-05-22 21:21:11.374598	53
22	Вегерин Евгений Алексеевич	\N	\N	58	\N	\N	2025-05-22 21:21:11.374598	43
131	Бородин Денис Геннадиевич	\N	\N	58	\N	\N	2025-05-22 21:21:11.374598	134
112	Виденин Юрий Алексеевич	\N	\N	48	\N	\N	2025-05-22 21:21:11.374598	15
108	Абрамов Руслан Владимирович	\N	\N	1	\N	\N	2025-05-22 21:21:11.374598	116
50	Ануфриев Иван Дмитриевич	\N	\N	1	\N	\N	2025-05-22 21:21:11.374598	75
42	Беликова Вероника Георгиевна	\N	\N	60	\N	\N	2025-05-22 21:21:11.374598	71
59	Гильманшин Георгий Данилович	\N	\N	60	\N	\N	2025-05-22 21:21:11.374598	89
57	Белякова Анна Сергеевна	\N	\N	48	\N	\N	2025-05-22 21:21:11.374598	87
125	Аркадьева Олеся Александровна	\N	\N	48	\N	\N	2025-05-22 21:21:11.374598	129
23	Акимов Михаил Александрович	\N	\N	48	\N	\N	2025-05-22 21:21:11.374598	45
12	Акимов Александр Викторович	\N	\N	5	\N	\N	2025-05-22 21:21:11.374598	34
63	Асрян Артем Камоевич	\N	\N	5	\N	\N	2025-05-22 21:21:11.374598	95
54	Вишневская Светлана Александровна	\N	\N	5	\N	\N	2025-05-22 21:21:11.374598	81
7	Воробей Сергей Викторович	\N	\N	2	\N	\N	2025-05-22 21:21:11.374598	29
31	Гетманская Валерия Владимировна	\N	\N	2	\N	\N	2025-05-22 21:21:11.374598	54
129	Герц Владимир Андреевич	\N	\N	2	\N	\N	2025-05-22 21:21:11.374598	19
45	Гилязова Ляйсан Анваровна	\N	\N	1	\N	\N	2025-05-22 21:21:11.374598	77
15	Горошкевич Оксана Александровна	\N	\N	1	\N	\N	2025-05-22 21:21:11.374598	37
75	Лапенкова Наталья Владимировна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	2
120	Леденев Сергей Александрович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	125
38	Луканин Александр Валерьевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	67
94	Магафуров Айрат Раилевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	107
98	Мальцев Никита Вадимович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	14
89	Месяцева Наталья Вячеславовна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	91
135	Мещеряков Денис Александрович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	138
130	Микляева Галина Сергеевна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	23
9	Миронова Екатерина Павловна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	31
11	Молева Анастасия Алексеевна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	33
20	Молева Дарья Алексеевна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	42
17	Молева Дарья Алексеевна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	39
21	Мусаева Джамиля Лом-Алиевна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	44
55	Назаров Алексей Викторович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	84
132	Никишова Анастасия Васильевна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	135
111	Орлов Павел Александрович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	119
122	Пак Валерия Викторовна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	126
44	Панов Егор Викторович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	73
19	Печенкин Алексей Викторович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	41
123	Пинчук Екатерина Сергеевна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	127
48	Подгорный Александр Владимирович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	57
49	Полякова Екатерина Валентиновна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	74
104	Полянский Борис Петрович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	111
91	Пономарев Ярослав Валериевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	96
4	Попов Андрей Михайлович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	24
110	Попов Сергей Павлович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	118
18	Похлоненко Александр Михайлович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	40
119	Пресняков Илья Сергеевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	17
128	Призенцев Иван Александрович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	61
107	Прокопьев Вячеслав Алексеевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	115
40	Пьяных Евгений Николаевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	69
105	Ражев Иван Юрьевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	113
106	Раченко Вячеслав Александрович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	114
47	Савченко Максим Павлович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	83
114	Салахутдинов Марат Рамилевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	121
1	Самарин Иван Юрьевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	20
133	Сапожникова Алексия Федоровна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	136
85	Свеженцева Капитолина Владимировна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	11
68	Сизёнова Анастасия Сергеевна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	79
117	Соловьев Владислав Романович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	16
71	Степанова Дарья Владимировна	admin@test.ru	+71111111111	\N	\N	\N	2025-05-22 21:21:11.374598	18
70	Сухов Николай Николаевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	123
41	Тедеева Линда Ростиславовна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	70
34	Терновский Андрей Викторович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	58
58	Тураев Глеб Вадимович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	88
2	Тюрькин Евгений Андреевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	21
33	Устинович Юлиана Феликсовна 	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	56
77	Филимонов Алексей Алексеевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	130
124	Халикова Элеонора Шахруховна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	128
79	Хиялов Аламшад Залимхан	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	5
81	Хуртина Екатерина Денисовна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	7
95	Чалоян Бемал Андраникович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	99
69	Чащин Павел Леонидович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	78
80	Черняк Наталья Андреевна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	6
6	Чурилова Светлана Михайловна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	26
87	Чучалин Кирилл Владимирович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	13
93	Шабельников Андрей Владиленович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	104
27	Шатский Никита Александрович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	49
66	Шатунова Юлия Викторовна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	62
8	Шедевр Олеся	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	30
73	Шивцов Максим Владимирович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	50
100	Шилик Павел Олегович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	106
127	Ширяев Артём Игоревич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	133
84	Ширяева Лайло Бойназаровна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	10
29	Щербаков Николай Владимирович	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	52
113	Щербаков Ярослав Юрьевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	120
39	Якушев Григорий Витальевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	68
88	Ямаева Ильвира Ирековна	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	86
118	Байков Михаил Сергеевич	\N	\N	\N	\N	\N	2025-05-22 21:21:11.374598	124
\.


--
-- Data for Name: org_units; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.org_units (id, type, type_id, parent_id, staff_count, logo, head_employee_id, head_position_id, position_x, position_y, created_at) FROM stdin;
31	department	4	\N	1	\N	\N	\N	400	50	2025-05-25 16:36:37.685358
32	department	4	\N	1	\N	\N	\N	400	50	2025-05-25 16:38:39.69995
33	department	4	\N	1	\N	\N	\N	400	50	2025-05-25 16:38:58.647362
7	organization	1	93	1	\N	\N	\N	508.3259	329.2132	2025-05-23 08:58:01.745447
25	position	48	22	1	\N	\N	\N	23	595.8	2025-05-24 19:37:08.959253
27	position	60	22	1	\N	\N	\N	245	732.8	2025-05-24 19:40:32.037733
22	department	3	7	1	\N	\N	\N	85.61574	400.71936	2025-05-23 10:31:45.144291
35	department	5	7	1	\N	\N	\N	370.341	459.31116	2025-05-25 23:09:18.685139
93	position	2	\N	1	\N	\N	\N	680	133.5	2025-05-22 21:45:04.174105
14	organization	2	93	1	\N	\N	\N	902	308	2025-05-23 09:05:41.331148
17	position	3	14	1	\N	\N	\N	1192.3475	388.6952	2025-05-23 09:10:58.730673
34	department	4	\N	1	\N	\N	\N	334.5	-76.159966	2025-05-25 16:39:25.190077
19	position	5	17	1	\N	\N	\N	1105.072	582.45825	2025-05-23 09:42:08.22038
29	position	1	14	1	\N	\N	\N	219.23315	60.14656	2025-05-25 12:06:24.118294
36	organization	1	93	1	\N	\N	\N	138.51758	231.76697	2025-05-26 10:20:56.937484
30	department	1	17	1	\N	\N	\N	-109.05488	9.927194	2025-05-25 12:06:35.794502
21	position	8	17	1	\N	\N	\N	432.1063	575.6174	2025-05-23 10:02:54.035815
18	position	4	17	1	\N	\N	\N	1840	524	2025-05-23 09:24:16.425412
24	department	12	21	1	\N	\N	\N	645	803	2025-05-23 13:21:13.126146
20	position	7	17	1	\N	\N	\N	1404	719	2025-05-23 09:59:28.00076
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.organizations (id, name, logo_path) FROM stdin;
1	ГБУ МСИ	/uploads/logo-1747640004458-28298313.png
2	ООО "Цифролаб"	\N
\.


--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.positions (id, name) FROM stdin;
1	тесто
2	Заместитель руководителя департамента
3	Генеральный директор
4	Заместитель генерального директора по координации реализации планов ОИВ
5	Заместитель генерального директора по координации аналитики
6	Советник
7	Заместитель генерального директора по координации разработки
8	Исполнительный директор
41	Главный специалист
45	Заместитель начальника управления
46	Руководитель проекта
47	Администратор проекта
48	Главный эксперт
54	Начальник отдела (Руководитель команды)
56	Главный бухгалтер
57	Специалист по бухгалтерскому учету и отчетности 
58	Специалист по охране труда
59	Специалист по административно-хозяйственному обеспечению
60	Специалист по подбору персонала
61	Руководитель направления закупочной деятельности
62	Руководитель направления кадрового администрирования
63	Руководитель направления правового обеспечения
64	Юрист
65	Руководитель отдела тестирования
66	Главный тестировщик
67	Ведущий тестировщик
68	Тестировщик
69	Руководитель проекта
70	Заместитель руководителя проекта
71	Главный аналитик
72	Ведущий аналитик
73	Старший аналитик
74	Администратор
75	Аналитик
76	Ведущий аналитик СУИД
77	Младший аналитик
78	Аналитик-координатор
80	Ведущий разработчик
83	Специалист по цифровым решениям
90	Главный разработчик I категории
91	Главный разработчик II категории
92	Старший разработчик I категории
93	Старший разработчик II категории
94	Старший разработчик III категории
95	Старший разработчик IV категории
96	Разработчик II категории
97	Разработчик III категории
98	Разработчик IV категории
99	Специалист по цифровым решениям I категории
100	Специалист по цифровым решениям II категории
101	Специалист по цифровым решениям III категории
102	Специалист по цифровым решениям IV категории
103	Специалист по цифровым решениям V категории
104	Специалист по цифровым решениям IV категории
105	Разработчик I категории
106	Руководитель проектов по эксплуатации информационных систем
107	Начальник отдела - Руководитель блока
108	Ведущий специалист информационной безопасности
109	Специалист информационной безопасности
110	Архитектор
111	Системный администратор
112	Технический писатель
113	Системный инженер I категории
114	Системный инженер II категории
115	Системный инженер III категории
116	Системный инженер IV категории
117	Ведущий дизайнер интерфейсов
118	Специалист технической поддержки
119	Дизайнер интерфейсов
120	Дизайнер
121	Начальник управления
122	Ведущий специалист
123	Ведущий дизайнер
\.


--
-- Data for Name: project_roles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.project_roles (id, name, project_id, created_at) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.projects (id, name, description, status, created_at) FROM stdin;
\.


--
-- Name: employee_positions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.employee_positions_id_seq', 38, true);


--
-- Name: employee_project_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.employee_project_roles_id_seq', 1, false);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.employees_id_seq', 1, false);


--
-- Name: org_units_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.org_units_id_seq', 36, true);


--
-- Name: project_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.project_roles_id_seq', 1, false);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.projects_id_seq', 1, false);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: employee_positions employee_positions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_positions
    ADD CONSTRAINT employee_positions_pkey PRIMARY KEY (id);


--
-- Name: employee_project_roles employee_project_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_project_roles
    ADD CONSTRAINT employee_project_roles_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: org_units org_units_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.org_units
    ADD CONSTRAINT org_units_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);


--
-- Name: project_roles project_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.project_roles
    ADD CONSTRAINT project_roles_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: employee_positions employee_positions_employee_id_employees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_positions
    ADD CONSTRAINT employee_positions_employee_id_employees_id_fk FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_positions employee_positions_org_unit_id_org_units_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_positions
    ADD CONSTRAINT employee_positions_org_unit_id_org_units_id_fk FOREIGN KEY (org_unit_id) REFERENCES public.org_units(id) ON DELETE CASCADE;


--
-- Name: employee_positions employee_positions_position_id_positions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_positions
    ADD CONSTRAINT employee_positions_position_id_positions_id_fk FOREIGN KEY (position_id) REFERENCES public.positions(id) ON DELETE SET NULL;


--
-- Name: employee_project_roles employee_project_roles_employee_id_employees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_project_roles
    ADD CONSTRAINT employee_project_roles_employee_id_employees_id_fk FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_project_roles employee_project_roles_project_role_id_project_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_project_roles
    ADD CONSTRAINT employee_project_roles_project_role_id_project_roles_id_fk FOREIGN KEY (project_role_id) REFERENCES public.project_roles(id) ON DELETE CASCADE;


--
-- Name: employees employees_department_id_org_units_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_department_id_org_units_id_fk FOREIGN KEY (department_id) REFERENCES public.org_units(id);


--
-- Name: employees employees_manager_id_employees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_manager_id_employees_id_fk FOREIGN KEY (manager_id) REFERENCES public.employees(id);


--
-- Name: employees employees_position_id_positions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_position_id_positions_id_fk FOREIGN KEY (position_id) REFERENCES public.positions(id);


--
-- Name: org_units org_units_parent_id_org_units_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.org_units
    ADD CONSTRAINT org_units_parent_id_org_units_id_fk FOREIGN KEY (parent_id) REFERENCES public.org_units(id) ON DELETE CASCADE;


--
-- Name: project_roles project_roles_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.project_roles
    ADD CONSTRAINT project_roles_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


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

