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
-- Name: set_deleted_timestamp(); Type: FUNCTION; Schema: public; Owner: -
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


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _dummy_position_references; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._dummy_position_references (
    id integer NOT NULL,
    position_id integer
);


--
-- Name: _dummy_position_references_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public._dummy_position_references_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _dummy_position_references_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public._dummy_position_references_id_seq OWNED BY public._dummy_position_references.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    department_id integer NOT NULL,
    name text NOT NULL,
    parent_department_id integer,
    parent_position_id integer,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);


--
-- Name: active_departments; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.active_departments AS
 SELECT department_id,
    name,
    parent_department_id,
    parent_position_id,
    deleted,
    deleted_at
   FROM public.departments
  WHERE (deleted = false);


--
-- Name: employeeprojects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employeeprojects (
    employee_id integer NOT NULL,
    project_id integer NOT NULL,
    role text NOT NULL,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);


--
-- Name: active_employeeprojects; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.active_employeeprojects AS
 SELECT employee_id,
    project_id,
    role,
    deleted,
    deleted_at
   FROM public.employeeprojects
  WHERE (deleted = false);


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: active_employees; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.active_employees AS
 SELECT employee_id,
    full_name,
    position_id,
    phone,
    email,
    manager_id,
    department_id,
    deleted,
    deleted_at
   FROM public.employees
  WHERE (deleted = false);


--
-- Name: leaves; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: active_leaves; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.active_leaves AS
 SELECT leave_id,
    employee_id,
    start_date,
    end_date,
    type,
    deleted,
    deleted_at
   FROM public.leaves
  WHERE (deleted = false);


--
-- Name: position_department; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: active_position_department; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.active_position_department AS
 SELECT position_link_id,
    position_id,
    department_id,
    sort,
    deleted,
    deleted_at,
    staff_units,
    current_count,
    vacancies
   FROM public.position_department
  WHERE (deleted = false);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    project_id integer NOT NULL,
    name text NOT NULL,
    description text,
    department_id integer,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);


--
-- Name: active_projects; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.active_projects AS
 SELECT project_id,
    name,
    description,
    department_id,
    deleted,
    deleted_at
   FROM public.projects
  WHERE (deleted = false);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: active_users; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.active_users AS
 SELECT id,
    username,
    email,
    password,
    created_at,
    deleted,
    deleted_at
   FROM public.users
  WHERE (deleted = false);


--
-- Name: departments_department_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departments_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: departments_department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;


--
-- Name: employees_employee_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employees_employee_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employees_employee_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employees_employee_id_seq OWNED BY public.employees.employee_id;


--
-- Name: leaves_leave_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leaves_leave_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leaves_leave_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leaves_leave_id_seq OWNED BY public.leaves.leave_id;


--
-- Name: position_department_position_link_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.position_department_position_link_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: position_department_position_link_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.position_department_position_link_id_seq OWNED BY public.position_department.position_link_id;


--
-- Name: position_position; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: TABLE position_position; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.position_position IS 'Таблица для хранения иерархических связей между должностями в контексте отделов';


--
-- Name: COLUMN position_position.position_relation_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.position_position.position_relation_id IS 'Уникальный идентификатор связи';


--
-- Name: COLUMN position_position.position_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.position_position.position_id IS 'ID подчиненной должности';


--
-- Name: COLUMN position_position.parent_position_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.position_position.parent_position_id IS 'ID родительской должности';


--
-- Name: COLUMN position_position.department_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.position_position.department_id IS 'ID отдела, в котором действует связь (опционально)';


--
-- Name: COLUMN position_position.sort; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.position_position.sort IS 'Порядок сортировки';


--
-- Name: COLUMN position_position.deleted; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.position_position.deleted IS 'Флаг удаления (мягкое удаление)';


--
-- Name: position_position_position_relation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.position_position_position_relation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: position_position_position_relation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.position_position_position_relation_id_seq OWNED BY public.position_position.position_relation_id;


--
-- Name: positions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.positions (
    position_id integer NOT NULL,
    name text NOT NULL,
    staff_units integer DEFAULT 0,
    current_count integer DEFAULT 0,
    vacancies integer DEFAULT 0,
    sort integer DEFAULT 0,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);


--
-- Name: positions_position_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.positions_position_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: positions_position_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.positions_position_id_seq OWNED BY public.positions.position_id;


--
-- Name: projects_project_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.projects_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: projects_project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.projects_project_id_seq OWNED BY public.projects.project_id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    data_key text NOT NULL,
    data_value text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: sort_tree; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sort_tree (
    id integer NOT NULL,
    sort integer NOT NULL,
    type character varying(20) NOT NULL,
    type_id integer NOT NULL,
    parent_id integer,
    CONSTRAINT sort_tree_type_check CHECK (((type)::text = ANY ((ARRAY['department'::character varying, 'position'::character varying])::text[])))
);


--
-- Name: sort_tree_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sort_tree_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sort_tree_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sort_tree_id_seq OWNED BY public.sort_tree.id;


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: _dummy_position_references id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._dummy_position_references ALTER COLUMN id SET DEFAULT nextval('public._dummy_position_references_id_seq'::regclass);


--
-- Name: departments department_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);


--
-- Name: employees employee_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees ALTER COLUMN employee_id SET DEFAULT nextval('public.employees_employee_id_seq'::regclass);


--
-- Name: leaves leave_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaves ALTER COLUMN leave_id SET DEFAULT nextval('public.leaves_leave_id_seq'::regclass);


--
-- Name: position_department position_link_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.position_department ALTER COLUMN position_link_id SET DEFAULT nextval('public.position_department_position_link_id_seq'::regclass);


--
-- Name: position_position position_relation_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.position_position ALTER COLUMN position_relation_id SET DEFAULT nextval('public.position_position_position_relation_id_seq'::regclass);


--
-- Name: positions position_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions ALTER COLUMN position_id SET DEFAULT nextval('public.positions_position_id_seq'::regclass);


--
-- Name: projects project_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects ALTER COLUMN project_id SET DEFAULT nextval('public.projects_project_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: sort_tree id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sort_tree ALTER COLUMN id SET DEFAULT nextval('public.sort_tree_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: _dummy_position_references; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.departments VALUES (21, 'Администрация', NULL, NULL, false, NULL);
INSERT INTO public.departments VALUES (22, 'Управление', NULL, 39, false, NULL);
INSERT INTO public.departments VALUES (23, 'Управление цифровизации и градостроительных данных', 22, NULL, false, NULL);
INSERT INTO public.departments VALUES (24, 'Управление цифрового развития', 22, NULL, false, NULL);
INSERT INTO public.departments VALUES (25, 'Отдел координации реализации планов ОИВ', NULL, 50, false, NULL);
INSERT INTO public.departments VALUES (26, 'Отдел координации аналитики ПО Строительство', NULL, 51, false, NULL);
INSERT INTO public.departments VALUES (27, 'Отдел координации аналитики ПО Земля', NULL, 51, false, NULL);
INSERT INTO public.departments VALUES (28, 'Отдел координации аналитики ПО Градрешения', NULL, 51, false, NULL);
INSERT INTO public.departments VALUES (29, 'Отдел координации аналитики ПО Аналитики и Мониторинга', NULL, 51, false, NULL);
INSERT INTO public.departments VALUES (30, 'Отдел координации разработки', NULL, 52, false, NULL);
INSERT INTO public.departments VALUES (31, 'Отдел инженерного обеспечения', NULL, 52, false, NULL);
INSERT INTO public.departments VALUES (32, 'Отдел инженерного тестирования', NULL, 52, false, NULL);
INSERT INTO public.departments VALUES (33, 'Отдел координации деятельности', NULL, 53, false, NULL);


--
-- Data for Name: employeeprojects; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.employees VALUES (18, 'Степанова Дарья Владимировна', 39, '+71111111111', 'admin@test.ru', NULL, 21, false, NULL);
INSERT INTO public.employees VALUES (20, 'Самарин Иван Юрьевия', 46, NULL, NULL, NULL, 23, false, NULL);
INSERT INTO public.employees VALUES (21, 'Тюрькин Евгений Андреевич', 46, NULL, NULL, NULL, 23, false, NULL);
INSERT INTO public.employees VALUES (22, 'Дремин Андрей', 46, NULL, NULL, NULL, 24, false, NULL);
INSERT INTO public.employees VALUES (23, 'Микляева Галина Сергеевна', 46, NULL, NULL, NULL, 24, false, NULL);
INSERT INTO public.employees VALUES (24, 'Попов Андрей Михайлович', 47, NULL, NULL, NULL, 23, false, NULL);
INSERT INTO public.employees VALUES (25, 'Коробчану Евгений Юрьевич', 47, NULL, NULL, NULL, 23, false, NULL);
INSERT INTO public.employees VALUES (27, 'Бубненкова Елена Вячеславовна', 47, NULL, NULL, 19, 24, false, NULL);
INSERT INTO public.employees VALUES (28, 'Захарова Полина Андреевна', 47, NULL, NULL, 19, 24, false, NULL);
INSERT INTO public.employees VALUES (29, 'Воробей Сергей Викторович', 47, NULL, NULL, 19, 24, false, NULL);
INSERT INTO public.employees VALUES (30, 'Шедевр Олеся', 47, NULL, NULL, 19, 24, false, NULL);
INSERT INTO public.employees VALUES (26, 'Чурилова Светлана Михайловна', 47, NULL, NULL, NULL, 23, false, NULL);
INSERT INTO public.employees VALUES (19, 'Герц Владимир Андреевич', 44, NULL, NULL, NULL, 24, false, NULL);
INSERT INTO public.employees VALUES (31, 'Миронова Екатерина Павловна', 48, NULL, NULL, NULL, 23, false, NULL);
INSERT INTO public.employees VALUES (32, 'Зелинский Андрей Николаевич', 48, NULL, NULL, NULL, 23, false, NULL);
INSERT INTO public.employees VALUES (33, 'Молева Анастасия Алексеевна', 48, NULL, NULL, NULL, 23, false, NULL);
INSERT INTO public.employees VALUES (34, 'Акимов Александр Викторович', 48, NULL, NULL, 19, 24, false, NULL);
INSERT INTO public.employees VALUES (35, 'Короткова Олеся Эдуардовна', 48, NULL, NULL, 19, 24, false, NULL);
INSERT INTO public.employees VALUES (36, 'Веревкина Ольга Дмитриевна', 41, NULL, NULL, NULL, 23, false, NULL);
INSERT INTO public.employees VALUES (37, 'Горошкевич Оксана Александровна', 41, NULL, NULL, NULL, 23, false, NULL);
INSERT INTO public.employees VALUES (38, 'Замарина Юлия Валентиновна', 41, NULL, NULL, NULL, 23, false, NULL);
INSERT INTO public.employees VALUES (39, 'Молева Дарья Алексеевна', 41, NULL, NULL, NULL, 23, false, NULL);
INSERT INTO public.employees VALUES (40, 'Похлоненко Александр Михайлович', 41, NULL, NULL, NULL, 23, false, NULL);
INSERT INTO public.employees VALUES (41, 'Печенкин Алексей Викторович', 41, NULL, NULL, NULL, 23, false, NULL);
INSERT INTO public.employees VALUES (42, 'Молева Дарья Алексеевна', 41, NULL, NULL, NULL, 23, false, NULL);
INSERT INTO public.employees VALUES (43, 'Вегерин Евгений Алексеевич', 41, NULL, NULL, 19, 24, false, NULL);
INSERT INTO public.employees VALUES (44, 'Мусаева Джамиля Лом-Алиевна', 41, NULL, NULL, 19, 24, false, NULL);
INSERT INTO public.employees VALUES (45, 'Акимов Михаил Александрович', 41, NULL, NULL, 19, 24, false, NULL);
INSERT INTO public.employees VALUES (46, 'Дупенко Владимир Сергеевич', 41, NULL, NULL, 19, 24, false, NULL);
INSERT INTO public.employees VALUES (47, 'Крохалевский Игорь Владимирович', 41, NULL, NULL, 19, 24, false, NULL);
INSERT INTO public.employees VALUES (48, 'Гутеев Роберт Андреевич', 41, NULL, NULL, 19, 24, false, NULL);
INSERT INTO public.employees VALUES (49, 'Шатский Никита Александрович', 41, NULL, NULL, 19, 24, false, NULL);
INSERT INTO public.employees VALUES (50, 'Шивцов Максим Владимирович', 41, NULL, NULL, 19, 24, false, NULL);
INSERT INTO public.employees VALUES (51, 'Кунец Анастасия Леонидовна', 41, NULL, NULL, 19, 24, false, NULL);
INSERT INTO public.employees VALUES (52, 'Щербаков Николай Владимирович', 41, NULL, NULL, 19, 24, false, NULL);
INSERT INTO public.employees VALUES (53, 'Аскерова Елизавета Васильевна', 41, NULL, NULL, 19, 24, false, NULL);
INSERT INTO public.employees VALUES (54, 'Гетманская Валерия Владимировна', 49, NULL, NULL, NULL, 23, false, NULL);
INSERT INTO public.employees VALUES (55, 'Зайцева Кристина Константиновна', 49, NULL, NULL, NULL, 23, false, NULL);
INSERT INTO public.employees VALUES (56, 'Устинович Юлиана Феликсовна ', 49, NULL, NULL, NULL, 23, false, NULL);
INSERT INTO public.employees VALUES (57, 'Подгорный Александр Владимирович', 53, NULL, NULL, NULL, 21, false, NULL);
INSERT INTO public.employees VALUES (58, 'Терновский Андрей Викторович', 52, NULL, NULL, NULL, 21, false, NULL);
INSERT INTO public.employees VALUES (59, 'Буланцева Дарья Андреевна', 56, NULL, NULL, 57, 33, false, NULL);
INSERT INTO public.employees VALUES (62, 'Шатунова Юлия Викторовна', 62, NULL, NULL, 57, 33, false, NULL);
INSERT INTO public.employees VALUES (63, 'Иевская Анастасия Сергеевна', 63, NULL, NULL, 57, 33, false, NULL);
INSERT INTO public.employees VALUES (61, 'Призенцев Иван Александрович', 61, NULL, NULL, 57, 33, false, NULL);
INSERT INTO public.employees VALUES (60, 'Зиндеева Елена Леонидовна', 60, NULL, NULL, 57, 33, false, NULL);
INSERT INTO public.employees VALUES (64, 'Косягин Дмитрий Сергеевич', 66, NULL, NULL, NULL, 32, false, NULL);


--
-- Data for Name: leaves; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: position_department; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.position_department VALUES (51, 39, 21, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (52, 40, 21, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (53, 41, 21, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (54, 42, 21, 0, false, NULL, 1, 0, 1);
INSERT INTO public.position_department VALUES (55, 43, 21, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (56, 44, 23, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (57, 44, 24, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (60, 46, 23, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (61, 46, 24, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (58, 45, 23, 0, false, NULL, 0, 0, 2);
INSERT INTO public.position_department VALUES (59, 45, 24, 0, false, NULL, 0, 0, 2);
INSERT INTO public.position_department VALUES (64, 47, 23, 0, false, NULL, 0, 0, 3);
INSERT INTO public.position_department VALUES (65, 47, 24, 0, false, NULL, 0, 0, 4);
INSERT INTO public.position_department VALUES (66, 48, 23, 0, false, NULL, 0, 0, 3);
INSERT INTO public.position_department VALUES (67, 48, 24, 0, false, NULL, 0, 0, 2);
INSERT INTO public.position_department VALUES (69, 41, 24, 0, false, NULL, 0, 0, 13);
INSERT INTO public.position_department VALUES (70, 49, 23, 0, false, NULL, 0, 0, 3);
INSERT INTO public.position_department VALUES (68, 41, 23, 0, false, NULL, 0, 0, 7);
INSERT INTO public.position_department VALUES (71, 50, 21, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (72, 51, 21, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (73, 52, 21, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (74, 53, 21, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (75, 54, 30, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (76, 56, 33, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (78, 58, 33, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (79, 59, 33, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (81, 64, 33, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (82, 63, 33, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (83, 62, 33, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (84, 61, 33, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (80, 60, 33, 0, false, NULL, 0, 0, 2);
INSERT INTO public.position_department VALUES (85, 65, 32, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (86, 66, 32, 0, false, NULL, 0, 0, 4);
INSERT INTO public.position_department VALUES (87, 67, 32, 0, false, NULL, 0, 0, 4);
INSERT INTO public.position_department VALUES (88, 68, 32, 0, false, NULL, 0, 0, 2);
INSERT INTO public.position_department VALUES (89, 57, 33, 0, false, NULL, 0, 0, 1);


--
-- Data for Name: position_position; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.position_position VALUES (15, 43, 39, 21, NULL, '2025-05-02 16:02:57.987649+00', '2025-05-02 16:02:57.987649+00', false, NULL);
INSERT INTO public.position_position VALUES (16, 45, 44, 23, NULL, '2025-05-02 17:45:07.21656+00', '2025-05-02 17:45:07.21656+00', false, NULL);
INSERT INTO public.position_position VALUES (17, 45, 44, 24, NULL, '2025-05-02 17:45:14.827438+00', '2025-05-02 17:45:14.827438+00', false, NULL);
INSERT INTO public.position_position VALUES (18, 46, 44, 23, NULL, '2025-05-03 08:39:16.125723+00', '2025-05-03 08:39:16.125723+00', false, NULL);
INSERT INTO public.position_position VALUES (19, 46, 44, 24, NULL, '2025-05-03 08:39:23.693913+00', '2025-05-03 08:39:23.693913+00', false, NULL);
INSERT INTO public.position_position VALUES (20, 47, 44, 23, NULL, '2025-05-03 08:53:43.261121+00', '2025-05-03 08:53:43.261121+00', false, NULL);
INSERT INTO public.position_position VALUES (21, 47, 44, 24, NULL, '2025-05-03 08:53:54.785652+00', '2025-05-03 08:53:54.785652+00', false, NULL);
INSERT INTO public.position_position VALUES (22, 48, 44, 23, NULL, '2025-05-03 09:05:31.042169+00', '2025-05-03 09:05:31.042169+00', false, NULL);
INSERT INTO public.position_position VALUES (23, 48, 44, 24, NULL, '2025-05-03 09:05:50.772632+00', '2025-05-03 09:05:50.772632+00', false, NULL);
INSERT INTO public.position_position VALUES (24, 41, 44, 23, NULL, '2025-05-03 09:11:34.005764+00', '2025-05-03 09:11:34.005764+00', false, NULL);
INSERT INTO public.position_position VALUES (25, 41, 44, 24, NULL, '2025-05-03 09:13:09.338969+00', '2025-05-03 09:13:09.338969+00', false, NULL);
INSERT INTO public.position_position VALUES (26, 49, 44, 23, NULL, '2025-05-03 09:25:34.047093+00', '2025-05-03 09:25:34.047093+00', false, NULL);
INSERT INTO public.position_position VALUES (27, 50, 43, 21, NULL, '2025-05-03 09:30:36.820582+00', '2025-05-03 09:30:36.820582+00', false, NULL);
INSERT INTO public.position_position VALUES (28, 51, 43, 21, NULL, '2025-05-03 09:31:35.735612+00', '2025-05-03 09:31:35.735612+00', false, NULL);
INSERT INTO public.position_position VALUES (29, 52, 43, 21, NULL, '2025-05-03 09:32:07.992658+00', '2025-05-03 09:32:07.992658+00', false, NULL);
INSERT INTO public.position_position VALUES (30, 53, 43, 21, NULL, '2025-05-03 09:32:34.735864+00', '2025-05-03 09:32:34.735864+00', false, NULL);
INSERT INTO public.position_position VALUES (31, 66, 65, 32, NULL, '2025-05-03 10:01:01.31997+00', '2025-05-03 10:01:01.31997+00', false, NULL);
INSERT INTO public.position_position VALUES (32, 67, 65, 32, NULL, '2025-05-03 10:01:23.499397+00', '2025-05-03 10:01:23.499397+00', false, NULL);
INSERT INTO public.position_position VALUES (33, 68, 65, 32, NULL, '2025-05-03 10:01:37.709655+00', '2025-05-03 10:01:37.709655+00', false, NULL);
INSERT INTO public.position_position VALUES (34, 57, 56, 33, NULL, '2025-05-03 10:03:05.226585+00', '2025-05-03 10:03:05.226585+00', false, NULL);


--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.positions VALUES (39, 'Заместитель руководителя департамента', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (40, 'Главный эксперт', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (41, 'Главный специалист', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (42, 'Руководитель', 1, 0, 1, 0, true, '2025-05-02 15:35:40.893504');
INSERT INTO public.positions VALUES (43, 'Генеральный директор', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (44, 'Начальник управления', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (45, 'Заместитель начальника управления', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (46, 'Руководитель проекта', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (47, 'Администратор проекта', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (48, 'Главный эксперт', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (49, 'Ведущий специались', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (50, 'Заместитель генерального директора по координации реализации планов ОИВ', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (51, 'Заместитель генерального директора по координации аналитики', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (52, 'Заместитель генерального директора по координации разработки', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (53, 'Исполнительный директор', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (54, 'Начальник отдела (Руководитель команды)', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (55, 'Начальник отдела (Руководитель команды)', 0, 0, 0, 0, true, '2025-05-03 09:44:37.97579');
INSERT INTO public.positions VALUES (56, 'Главный бухгалтер', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (57, 'Специалист по бухгалтерскому учету и отчетности ', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (58, 'Специалист по охране труда', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (59, 'Специалист по административно-хозяйственному обеспечению', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (60, 'Специалист по подбору персонала', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (61, 'Руководитель направления закупочной деятельности', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (62, 'Руководитель направления кадрового администрирования', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (63, 'Руководитель направления правового обеспечения', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (64, 'Юрист', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (65, 'Руководитель отдела тестирования', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (66, 'Главный тестировщик', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (67, 'Ведущий тестировщик', 0, 0, 0, 0, false, NULL);
INSERT INTO public.positions VALUES (68, 'Тестировщик', 0, 0, 0, 0, false, NULL);


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.settings VALUES (1, 'hierarchy_initial_levels', '3', '2025-04-27 10:36:15.699481', '2025-05-03 09:00:46.694');


--
-- Data for Name: sort_tree; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.sort_tree VALUES (2, 0, 'position', 24, NULL);
INSERT INTO public.sort_tree VALUES (1, 0, 'position', 23, NULL);
INSERT INTO public.sort_tree VALUES (4, 0, 'department', 17, NULL);
INSERT INTO public.sort_tree VALUES (5, 0, 'position', 25, NULL);
INSERT INTO public.sort_tree VALUES (6, 0, 'department', 18, NULL);
INSERT INTO public.sort_tree VALUES (7, 0, 'position', 33, NULL);
INSERT INTO public.sort_tree VALUES (8, 0, 'position', 30, NULL);
INSERT INTO public.sort_tree VALUES (9, 0, 'position', 28, NULL);
INSERT INTO public.sort_tree VALUES (10, 0, 'position', 34, NULL);
INSERT INTO public.sort_tree VALUES (12, 0, 'position', 31, NULL);
INSERT INTO public.sort_tree VALUES (13, 0, 'position', 35, NULL);
INSERT INTO public.sort_tree VALUES (14, 0, 'position', 26, NULL);
INSERT INTO public.sort_tree VALUES (15, 0, 'position', 29, NULL);
INSERT INTO public.sort_tree VALUES (11, 0, 'department', 20, NULL);
INSERT INTO public.sort_tree VALUES (3, 0, 'department', 19, NULL);
INSERT INTO public.sort_tree VALUES (18, 0, 'position', 23, 17);
INSERT INTO public.sort_tree VALUES (19, 2, 'position', 26, 17);
INSERT INTO public.sort_tree VALUES (21, 0, 'department', 19, 18);
INSERT INTO public.sort_tree VALUES (20, 1, 'department', 20, 18);
INSERT INTO public.sort_tree VALUES (22, 21, 'department', 21, NULL);
INSERT INTO public.sort_tree VALUES (24, 0, 'position', 39, 21);
INSERT INTO public.sort_tree VALUES (23, 1, 'position', 41, 21);
INSERT INTO public.sort_tree VALUES (25, 2, 'position', 40, 21);
INSERT INTO public.sort_tree VALUES (26, 1, 'position', 41, 23);
INSERT INTO public.sort_tree VALUES (27, 0, 'position', 45, 23);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES (1, 'admin', 'admin@example.com', '4ec86d813dc530a40745900a6439209e6c1f6357b8ade99cb85f5e4dda8fc0d4927b840f8ae5710ef1ce55b7b4b8b9cf2a8c832d3be46a15a9082a4fb4e9751b.3c30567107e13e47c160c7456b9acade', '2025-04-24 07:52:25.855195', false, NULL);


--
-- Name: _dummy_position_references_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public._dummy_position_references_id_seq', 1, false);


--
-- Name: departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.departments_department_id_seq', 33, true);


--
-- Name: employees_employee_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employees_employee_id_seq', 64, true);


--
-- Name: leaves_leave_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leaves_leave_id_seq', 1, false);


--
-- Name: position_department_position_link_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.position_department_position_link_id_seq', 89, true);


--
-- Name: position_position_position_relation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.position_position_position_relation_id_seq', 34, true);


--
-- Name: positions_position_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.positions_position_id_seq', 68, true);


--
-- Name: projects_project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.projects_project_id_seq', 7, false);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.settings_id_seq', 2, false);


--
-- Name: sort_tree_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sort_tree_id_seq', 27, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 2, false);


--
-- Name: _dummy_position_references _dummy_position_references_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._dummy_position_references
    ADD CONSTRAINT _dummy_position_references_pkey PRIMARY KEY (id);


--
-- Name: employeeprojects employeeprojects_employee_id_project_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employeeprojects
    ADD CONSTRAINT employeeprojects_employee_id_project_id_pk PRIMARY KEY (employee_id, project_id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (employee_id);


--
-- Name: departments idx_department_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT idx_department_id UNIQUE (department_id);


--
-- Name: positions idx_position_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT idx_position_id UNIQUE (position_id);


--
-- Name: leaves leaves_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_pkey PRIMARY KEY (leave_id);


--
-- Name: position_position position_position_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.position_position
    ADD CONSTRAINT position_position_pkey PRIMARY KEY (position_relation_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (project_id);


--
-- Name: settings settings_data_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_data_key_key UNIQUE (data_key);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: sort_tree sort_tree_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sort_tree
    ADD CONSTRAINT sort_tree_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: idx_position_position_department_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_position_position_department_id ON public.position_position USING btree (department_id);


--
-- Name: idx_position_position_parent_position_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_position_position_parent_position_id ON public.position_position USING btree (parent_position_id);


--
-- Name: idx_position_position_position_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_position_position_position_id ON public.position_position USING btree (position_id);


--
-- Name: idx_position_position_unique_relation; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_position_position_unique_relation ON public.position_position USING btree (position_id, parent_position_id, department_id) WHERE (deleted = false);


--
-- Name: sort_tree_type_type_id_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sort_tree_type_type_id_parent_id_unique ON public.sort_tree USING btree (type, type_id, parent_id);


--
-- Name: departments set_departments_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_departments_deleted_timestamp BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: employeeprojects set_employeeprojects_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_employeeprojects_deleted_timestamp BEFORE UPDATE ON public.employeeprojects FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: employees set_employees_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_employees_deleted_timestamp BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: leaves set_leaves_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_leaves_deleted_timestamp BEFORE UPDATE ON public.leaves FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: position_department set_position_department_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_position_department_deleted_timestamp BEFORE UPDATE ON public.position_department FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: positions set_positions_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_positions_deleted_timestamp BEFORE UPDATE ON public.positions FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: projects set_projects_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_projects_deleted_timestamp BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: users set_users_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_users_deleted_timestamp BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: _dummy_position_references _dummy_position_references_position_id_positions_position_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._dummy_position_references
    ADD CONSTRAINT _dummy_position_references_position_id_positions_position_id_fk FOREIGN KEY (position_id) REFERENCES public.positions(position_id);


--
-- Name: employeeprojects employeeprojects_employee_id_employees_employee_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employeeprojects
    ADD CONSTRAINT employeeprojects_employee_id_employees_employee_id_fk FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id);


--
-- Name: employeeprojects employeeprojects_project_id_projects_project_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employeeprojects
    ADD CONSTRAINT employeeprojects_project_id_projects_project_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- Name: employees employees_department_id_departments_department_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_department_id_departments_department_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: employees employees_position_id_positions_position_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_position_id_positions_position_id_fk FOREIGN KEY (position_id) REFERENCES public.positions(position_id);


--
-- Name: position_position fk_department; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.position_position
    ADD CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: position_position fk_parent_position; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.position_position
    ADD CONSTRAINT fk_parent_position FOREIGN KEY (parent_position_id) REFERENCES public.positions(position_id);


--
-- Name: position_position fk_position; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.position_position
    ADD CONSTRAINT fk_position FOREIGN KEY (position_id) REFERENCES public.positions(position_id);


--
-- Name: leaves leaves_employee_id_employees_employee_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_employee_id_employees_employee_id_fk FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id);


--
-- Name: position_department position_department_department_id_departments_department_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.position_department
    ADD CONSTRAINT position_department_department_id_departments_department_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: position_department position_department_position_id_positions_position_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.position_department
    ADD CONSTRAINT position_department_position_id_positions_position_id_fk FOREIGN KEY (position_id) REFERENCES public.positions(position_id);


--
-- Name: projects projects_department_id_departments_department_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_department_id_departments_department_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- PostgreSQL database dump complete
--

