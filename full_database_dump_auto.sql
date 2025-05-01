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

ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_department_id_departments_department_id_fk;
ALTER TABLE IF EXISTS ONLY public.position_department DROP CONSTRAINT IF EXISTS position_department_position_id_positions_position_id_fk;
ALTER TABLE IF EXISTS ONLY public.position_department DROP CONSTRAINT IF EXISTS position_department_department_id_departments_department_id_fk;
ALTER TABLE IF EXISTS ONLY public.leaves DROP CONSTRAINT IF EXISTS leaves_employee_id_employees_employee_id_fk;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_position_id_positions_position_id_fk;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_department_id_departments_department_id_fk;
ALTER TABLE IF EXISTS ONLY public.employeeprojects DROP CONSTRAINT IF EXISTS employeeprojects_project_id_projects_project_id_fk;
ALTER TABLE IF EXISTS ONLY public.employeeprojects DROP CONSTRAINT IF EXISTS employeeprojects_employee_id_employees_employee_id_fk;
ALTER TABLE IF EXISTS ONLY public._dummy_position_references DROP CONSTRAINT IF EXISTS _dummy_position_references_position_id_positions_position_id_fk;
DROP TRIGGER IF EXISTS set_users_deleted_timestamp ON public.users;
DROP TRIGGER IF EXISTS set_projects_deleted_timestamp ON public.projects;
DROP TRIGGER IF EXISTS set_positions_deleted_timestamp ON public.positions;
DROP TRIGGER IF EXISTS set_position_department_deleted_timestamp ON public.position_department;
DROP TRIGGER IF EXISTS set_leaves_deleted_timestamp ON public.leaves;
DROP TRIGGER IF EXISTS set_employees_deleted_timestamp ON public.employees;
DROP TRIGGER IF EXISTS set_employeeprojects_deleted_timestamp ON public.employeeprojects;
DROP TRIGGER IF EXISTS set_departments_deleted_timestamp ON public.departments;
DROP INDEX IF EXISTS public.sort_tree_type_type_id_parent_id_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY public.sort_tree DROP CONSTRAINT IF EXISTS sort_tree_pkey;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_pkey;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_data_key_key;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_pkey;
ALTER TABLE IF EXISTS ONLY public.leaves DROP CONSTRAINT IF EXISTS leaves_pkey;
ALTER TABLE IF EXISTS ONLY public.positions DROP CONSTRAINT IF EXISTS idx_position_id;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS idx_department_id;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_pkey;
ALTER TABLE IF EXISTS ONLY public.employeeprojects DROP CONSTRAINT IF EXISTS employeeprojects_employee_id_project_id_pk;
ALTER TABLE IF EXISTS ONLY public._dummy_position_references DROP CONSTRAINT IF EXISTS _dummy_position_references_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.sort_tree ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.projects ALTER COLUMN project_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.positions ALTER COLUMN position_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.position_department ALTER COLUMN position_link_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.leaves ALTER COLUMN leave_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.employees ALTER COLUMN employee_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.departments ALTER COLUMN department_id DROP DEFAULT;
ALTER TABLE IF EXISTS public._dummy_position_references ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP SEQUENCE IF EXISTS public.sort_tree_id_seq;
DROP TABLE IF EXISTS public.sort_tree;
DROP SEQUENCE IF EXISTS public.settings_id_seq;
DROP TABLE IF EXISTS public.settings;
DROP SEQUENCE IF EXISTS public.projects_project_id_seq;
DROP SEQUENCE IF EXISTS public.positions_position_id_seq;
DROP SEQUENCE IF EXISTS public.position_department_position_link_id_seq;
DROP SEQUENCE IF EXISTS public.leaves_leave_id_seq;
DROP SEQUENCE IF EXISTS public.employees_employee_id_seq;
DROP SEQUENCE IF EXISTS public.departments_department_id_seq;
DROP VIEW IF EXISTS public.active_users;
DROP TABLE IF EXISTS public.users;
DROP VIEW IF EXISTS public.active_projects;
DROP TABLE IF EXISTS public.projects;
DROP VIEW IF EXISTS public.active_positions;
DROP TABLE IF EXISTS public.positions;
DROP VIEW IF EXISTS public.active_position_department;
DROP TABLE IF EXISTS public.position_department;
DROP VIEW IF EXISTS public.active_leaves;
DROP TABLE IF EXISTS public.leaves;
DROP VIEW IF EXISTS public.active_employees;
DROP TABLE IF EXISTS public.employees;
DROP VIEW IF EXISTS public.active_employeeprojects;
DROP TABLE IF EXISTS public.employeeprojects;
DROP VIEW IF EXISTS public.active_departments;
DROP TABLE IF EXISTS public.departments;
DROP SEQUENCE IF EXISTS public._dummy_position_references_id_seq;
DROP TABLE IF EXISTS public._dummy_position_references;
DROP FUNCTION IF EXISTS public.set_deleted_timestamp();
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
-- Name: positions; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: active_positions; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.active_positions AS
 SELECT position_id,
    name,
    staff_units,
    current_count,
    vacancies,
    parent_position_id,
    sort,
    department_id,
    deleted,
    deleted_at
   FROM public.positions
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
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: -
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE public.positions DISABLE TRIGGER ALL;

INSERT INTO public.positions VALUES (11, 'Обновленная тестовая должность', 3, 1, 1, 1, 100, NULL, true, '2025-04-27 22:45:45.385');
INSERT INTO public.positions VALUES (21, 'Директор по развитию', 1, 0, 1, 5, 10, 1, true, '2025-04-30 08:11:43.105495');
INSERT INTO public.positions VALUES (1, 'ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА', 1, 1, 0, NULL, 1, 1, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.positions VALUES (2, 'Главный эксперт', 0, 0, 0, NULL, 2, NULL, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.positions VALUES (3, 'Главный специалист', 0, 0, 0, NULL, 3, NULL, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.positions VALUES (5, 'Генеральный директор', 0, 0, 0, 1, 5, NULL, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.positions VALUES (6, 'Начальник управления', 0, 0, 0, 1, 6, NULL, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.positions VALUES (4, 'Исполнительный директор', 0, 0, 0, 5, 4, NULL, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.positions VALUES (7, 'Заместитель генерального директора по координации реализации планов ОИВ', 0, 0, 0, 5, 7, NULL, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.positions VALUES (8, 'Заместитель генерального директора по координации аналитики', 0, 0, 0, 5, 8, NULL, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.positions VALUES (9, 'Заместитель генерального директора по координации разработки', 0, 0, 0, 5, 9, NULL, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.positions VALUES (10, 'Директор по развитию', 1, 0, 1, 5, 10, 1, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.positions VALUES (12, 'ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА', 1, 1, 0, NULL, 1, 1, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.positions VALUES (13, 'Главный эксперт', 0, 0, 0, NULL, 2, NULL, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.positions VALUES (14, 'Главный специалист', 0, 0, 0, NULL, 3, NULL, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.positions VALUES (15, 'Исполнительный директор', 0, 0, 0, 5, 4, NULL, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.positions VALUES (16, 'Генеральный директор', 0, 0, 0, 1, 5, NULL, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.positions VALUES (17, 'Начальник управления', 0, 0, 0, 1, 6, NULL, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.positions VALUES (18, 'Заместитель генерального директора по координации реализации планов ОИВ', 0, 0, 0, 5, 7, NULL, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.positions VALUES (19, 'Заместитель генерального директора по координации аналитики', 0, 0, 0, 5, 8, NULL, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.positions VALUES (20, 'Заместитель генерального директора по координации разработки', 0, 0, 0, 5, 9, NULL, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.positions VALUES (22, 'Заместитель руководителя департамента', 0, 0, 0, NULL, 0, 17, true, '2025-04-30 08:30:48.443727');
INSERT INTO public.positions VALUES (23, 'Заместитель руководителя департамента', 0, 0, 0, NULL, 0, 17, false, NULL);
INSERT INTO public.positions VALUES (24, 'Начальник управления', 0, 0, 0, 23, 0, NULL, false, NULL);
INSERT INTO public.positions VALUES (25, 'Генеральный директор', 0, 0, 0, 23, 0, 17, false, NULL);
INSERT INTO public.positions VALUES (26, 'Главный эксперт', 0, 0, 0, NULL, 0, 17, false, NULL);
INSERT INTO public.positions VALUES (27, 'Главный специалист', 0, 0, 0, NULL, 0, 17, false, NULL);
INSERT INTO public.positions VALUES (29, 'Заместитель начальника управления', 0, 0, 0, 24, 0, 20, false, NULL);
INSERT INTO public.positions VALUES (30, 'Руководитель проекта', 0, 0, 0, 24, 0, 19, false, NULL);
INSERT INTO public.positions VALUES (31, 'Руководитель проекта', 0, 0, 0, 24, 0, 20, false, NULL);
INSERT INTO public.positions VALUES (32, 'Самарин Иван Юрьевич', 0, 0, 0, 24, 0, 19, true, '2025-04-30 13:01:43.857683');
INSERT INTO public.positions VALUES (33, 'Администратор проекта', 0, 0, 0, 24, 0, 19, false, NULL);
INSERT INTO public.positions VALUES (34, 'Главный эксперт', 0, 0, 0, 24, 0, 19, false, NULL);
INSERT INTO public.positions VALUES (28, 'Заместитель начальника управления', 0, 0, 0, 24, 0, NULL, false, NULL);
INSERT INTO public.positions VALUES (35, 'Заместитель начальника управления', 0, 0, 0, 24, 0, NULL, false, NULL);


ALTER TABLE public.positions ENABLE TRIGGER ALL;

--
-- Data for Name: _dummy_position_references; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public._dummy_position_references DISABLE TRIGGER ALL;



ALTER TABLE public._dummy_position_references ENABLE TRIGGER ALL;

--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.departments DISABLE TRIGGER ALL;

INSERT INTO public.departments VALUES (5, 'тестовая должность', NULL, 6, true, '2025-04-26 11:51:46.653');
INSERT INTO public.departments VALUES (9, 'Тестовый отдел создан через API', 1, NULL, true, '2025-04-27 22:17:38.782');
INSERT INTO public.departments VALUES (10, 'Обновленный тестовый отдел', 1, NULL, true, '2025-04-27 22:45:45.44');
INSERT INTO public.departments VALUES (1, 'Администрация', NULL, NULL, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.departments VALUES (2, 'Управление цифровизации и градостроительных данных', 1, 6, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.departments VALUES (3, 'Управление цифрового развития', 1, 6, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.departments VALUES (6, 'тестовый отдел', NULL, 6, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.departments VALUES (7, 'ОТДЕЛ КООРДИНАЦИИ   РАЗРАБОТКИ', NULL, 9, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.departments VALUES (8, 'Управление', NULL, 1, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.departments VALUES (11, 'Администрация', NULL, NULL, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.departments VALUES (12, 'Управление цифровизации и градостроительных данных', 1, 6, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.departments VALUES (13, 'Управление цифрового развития', 1, 6, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.departments VALUES (14, 'тестовый отдел', NULL, 6, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.departments VALUES (15, 'ОТДЕЛ КООРДИНАЦИИ РАЗРАБОТКИ', NULL, 9, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.departments VALUES (16, 'Управление 1', NULL, 1, true, '2025-04-30 08:13:11.604396');
INSERT INTO public.departments VALUES (17, 'Администрация', NULL, NULL, false, NULL);
INSERT INTO public.departments VALUES (20, 'Управление цифрового развития', 18, NULL, false, NULL);
INSERT INTO public.departments VALUES (19, 'Управление цифровизации и градостроительных данных', 18, NULL, false, NULL);
INSERT INTO public.departments VALUES (18, 'Управление', NULL, 23, false, NULL);


ALTER TABLE public.departments ENABLE TRIGGER ALL;

--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.employees DISABLE TRIGGER ALL;

INSERT INTO public.employees VALUES (3, 'Терновский Андрей Викторович', 9, NULL, NULL, NULL, 1, false, NULL);
INSERT INTO public.employees VALUES (4, 'Подгорный Александр Владимирович', 4, NULL, NULL, NULL, 1, false, NULL);
INSERT INTO public.employees VALUES (5, 'Обновленный Тестовый Сотрудник', 11, '+7 (999) 987-65-43', 'test@example.com', NULL, 10, true, '2025-04-27 22:45:45.315');
INSERT INTO public.employees VALUES (1, 'Степанова Дарья Владимировна', 23, '+7 (111) 111-11-11', 'mail@example.com', NULL, 17, false, NULL);
INSERT INTO public.employees VALUES (6, 'Степанова Дарья Владимировна', 1, '+7 (111) 111-11-11', 'mail@example.com', NULL, 1, true, '2025-04-30 08:37:00.689685');
INSERT INTO public.employees VALUES (7, 'Герц Владимир Андреевич', 6, NULL, NULL, 1, 1, true, '2025-04-30 08:37:04.008906');
INSERT INTO public.employees VALUES (8, 'Терновский Андрей Викторович', 9, NULL, NULL, NULL, 1, true, '2025-04-30 08:37:07.690364');
INSERT INTO public.employees VALUES (9, 'Подгорный Александр Владимирович', 4, NULL, NULL, NULL, 1, true, '2025-04-30 08:37:10.764734');
INSERT INTO public.employees VALUES (2, 'Герц Владимир Андреевич', 24, NULL, NULL, 1, 20, false, NULL);
INSERT INTO public.employees VALUES (10, 'Самарин Иван Юрьевич', 30, NULL, NULL, NULL, 19, false, NULL);
INSERT INTO public.employees VALUES (11, 'Тюрькин Евгений Андреевич', 30, NULL, NULL, NULL, 19, false, NULL);
INSERT INTO public.employees VALUES (12, 'Попов Андрей Михайлович', 33, NULL, NULL, NULL, 19, false, NULL);
INSERT INTO public.employees VALUES (13, 'Коробчану Евгений Юрьевич', 33, NULL, NULL, NULL, 19, false, NULL);
INSERT INTO public.employees VALUES (14, 'Чурилова Светлана Михайловна', 33, NULL, NULL, NULL, 19, false, NULL);
INSERT INTO public.employees VALUES (15, 'Миронова Екатерина Павловна', 34, NULL, NULL, NULL, 19, false, NULL);
INSERT INTO public.employees VALUES (16, 'Зелинский Андрей Николаевич', 34, NULL, NULL, NULL, 19, false, NULL);
INSERT INTO public.employees VALUES (17, 'Молева Анастасия Алексеевна', 34, NULL, NULL, NULL, 19, false, NULL);


ALTER TABLE public.employees ENABLE TRIGGER ALL;

--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.projects DISABLE TRIGGER ALL;

INSERT INTO public.projects VALUES (1, 'Городской портал цифровизации', NULL, 2, false, NULL);
INSERT INTO public.projects VALUES (2, 'Система аналитики градостроительных данных', NULL, 2, false, NULL);
INSERT INTO public.projects VALUES (3, 'Разработка API градостроительных данных', NULL, 3, false, NULL);
INSERT INTO public.projects VALUES (4, 'Городской портал цифровизации', NULL, 2, false, NULL);
INSERT INTO public.projects VALUES (5, 'Система аналитики градостроительных данных', NULL, 2, false, NULL);
INSERT INTO public.projects VALUES (6, 'Разработка API градостроительных данных', NULL, 3, false, NULL);


ALTER TABLE public.projects ENABLE TRIGGER ALL;

--
-- Data for Name: employeeprojects; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.employeeprojects DISABLE TRIGGER ALL;

INSERT INTO public.employeeprojects VALUES (1, 1, 'Руководитель проекта', false, NULL);
INSERT INTO public.employeeprojects VALUES (2, 1, 'Архитектор системы', false, NULL);
INSERT INTO public.employeeprojects VALUES (3, 1, 'Технический директор', false, NULL);
INSERT INTO public.employeeprojects VALUES (4, 2, 'Руководитель проекта', false, NULL);
INSERT INTO public.employeeprojects VALUES (3, 3, 'Руководитель проекта', false, NULL);


ALTER TABLE public.employeeprojects ENABLE TRIGGER ALL;

--
-- Data for Name: leaves; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.leaves DISABLE TRIGGER ALL;



ALTER TABLE public.leaves ENABLE TRIGGER ALL;

--
-- Data for Name: position_department; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.position_department DISABLE TRIGGER ALL;

INSERT INTO public.position_department VALUES (1, 1, 1, 0, true, '2025-04-30 08:13:11.604396', 1, 1, 0);
INSERT INTO public.position_department VALUES (2, 2, 1, 0, true, '2025-04-30 08:13:11.604396', 0, 0, 0);
INSERT INTO public.position_department VALUES (3, 3, 1, 0, true, '2025-04-30 08:13:11.604396', 0, 0, 0);
INSERT INTO public.position_department VALUES (4, 5, 1, 0, true, '2025-04-30 08:13:11.604396', 0, 0, 0);
INSERT INTO public.position_department VALUES (5, 6, 1, 0, true, '2025-04-30 08:13:11.604396', 0, 0, 0);
INSERT INTO public.position_department VALUES (6, 4, 1, 0, true, '2025-04-30 08:13:11.604396', 0, 0, 0);
INSERT INTO public.position_department VALUES (7, 7, 1, 0, true, '2025-04-30 08:13:11.604396', 0, 0, 0);
INSERT INTO public.position_department VALUES (8, 8, 1, 0, true, '2025-04-30 08:13:11.604396', 0, 0, 0);
INSERT INTO public.position_department VALUES (9, 9, 1, 0, true, '2025-04-30 08:13:11.604396', 0, 0, 0);
INSERT INTO public.position_department VALUES (10, 10, 1, 0, true, '2025-04-30 08:13:11.604396', 1, 0, 1);
INSERT INTO public.position_department VALUES (11, 1, 1, 0, true, '2025-04-30 08:13:11.604396', 1, 1, 0);
INSERT INTO public.position_department VALUES (12, 2, 1, 0, true, '2025-04-30 08:13:11.604396', 0, 0, 0);
INSERT INTO public.position_department VALUES (13, 3, 1, 0, true, '2025-04-30 08:13:11.604396', 0, 0, 0);
INSERT INTO public.position_department VALUES (14, 5, 1, 0, true, '2025-04-30 08:13:11.604396', 0, 0, 0);
INSERT INTO public.position_department VALUES (15, 6, 1, 0, true, '2025-04-30 08:13:11.604396', 0, 0, 0);
INSERT INTO public.position_department VALUES (16, 4, 1, 0, true, '2025-04-30 08:13:11.604396', 0, 0, 0);
INSERT INTO public.position_department VALUES (17, 7, 1, 0, true, '2025-04-30 08:13:11.604396', 0, 0, 0);
INSERT INTO public.position_department VALUES (18, 8, 1, 0, true, '2025-04-30 08:13:11.604396', 0, 0, 0);
INSERT INTO public.position_department VALUES (19, 9, 1, 0, true, '2025-04-30 08:13:11.604396', 0, 0, 0);
INSERT INTO public.position_department VALUES (20, 10, 1, 0, true, '2025-04-30 08:13:11.604396', 1, 0, 1);
INSERT INTO public.position_department VALUES (22, 24, 17, 0, true, '2025-04-30 08:46:38.370004', 0, 0, 0);
INSERT INTO public.position_department VALUES (32, 32, 19, 0, false, NULL, 0, 0, 0);
INSERT INTO public.position_department VALUES (24, 24, 20, 0, true, '2025-04-30 13:42:18.644272', 0, 0, 0);
INSERT INTO public.position_department VALUES (27, 24, 19, 0, true, '2025-04-30 13:42:20.03701', 0, 0, 0);
INSERT INTO public.position_department VALUES (35, 24, 19, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (30, 30, 19, 0, false, NULL, 0, 0, 3);
INSERT INTO public.position_department VALUES (31, 31, 20, 0, false, NULL, 0, 0, 3);
INSERT INTO public.position_department VALUES (25, 26, 17, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (26, 27, 17, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (29, 29, 20, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (33, 33, 19, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (36, 24, 20, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (34, 34, 19, 0, false, NULL, 0, 0, 3);
INSERT INTO public.position_department VALUES (28, 28, 19, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (37, 35, 20, 0, false, NULL, 0, 0, 1);
INSERT INTO public.position_department VALUES (23, 25, 17, 0, true, '2025-05-01 17:04:05.026372', 0, 0, 1);
INSERT INTO public.position_department VALUES (21, 23, 17, 0, true, '2025-05-01 17:13:01.803343', 0, 0, 1);


ALTER TABLE public.position_department ENABLE TRIGGER ALL;

--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.settings DISABLE TRIGGER ALL;

INSERT INTO public.settings VALUES (1, 'hierarchy_initial_levels', '2', '2025-04-27 10:36:15.699481', '2025-04-30 09:04:44.087');


ALTER TABLE public.settings ENABLE TRIGGER ALL;

--
-- Data for Name: sort_tree; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.sort_tree DISABLE TRIGGER ALL;

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
INSERT INTO public.sort_tree VALUES (16, 0, 'position', 27, NULL);
INSERT INTO public.sort_tree VALUES (11, 0, 'department', 20, NULL);
INSERT INTO public.sort_tree VALUES (3, 0, 'department', 19, NULL);
INSERT INTO public.sort_tree VALUES (18, 0, 'position', 23, 17);
INSERT INTO public.sort_tree VALUES (17, 1, 'position', 27, 17);
INSERT INTO public.sort_tree VALUES (19, 2, 'position', 26, 17);


ALTER TABLE public.sort_tree ENABLE TRIGGER ALL;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.users DISABLE TRIGGER ALL;

INSERT INTO public.users VALUES (1, 'admin', 'admin@example.com', '4ec86d813dc530a40745900a6439209e6c1f6357b8ade99cb85f5e4dda8fc0d4927b840f8ae5710ef1ce55b7b4b8b9cf2a8c832d3be46a15a9082a4fb4e9751b.3c30567107e13e47c160c7456b9acade', '2025-04-24 07:52:25.855195', false, NULL);


ALTER TABLE public.users ENABLE TRIGGER ALL;

--
-- Name: _dummy_position_references_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public._dummy_position_references_id_seq', 1, false);


--
-- Name: departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.departments_department_id_seq', 20, true);


--
-- Name: employees_employee_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employees_employee_id_seq', 17, true);


--
-- Name: leaves_leave_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leaves_leave_id_seq', 1, false);


--
-- Name: position_department_position_link_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.position_department_position_link_id_seq', 37, true);


--
-- Name: positions_position_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.positions_position_id_seq', 35, true);


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

SELECT pg_catalog.setval('public.sort_tree_id_seq', 19, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 2, false);


--
-- PostgreSQL database dump complete
--


-- Установка значений последовательностей на основе максимальных ID
SELECT setval('departments_department_id_seq', (SELECT COALESCE(MAX(department_id), 0) + 1 FROM departments), false);
SELECT setval('positions_position_id_seq', (SELECT COALESCE(MAX(position_id), 0) + 1 FROM positions), false);
SELECT setval('position_department_position_link_id_seq', (SELECT COALESCE(MAX(position_link_id), 0) + 1 FROM position_department), false);
SELECT setval('employees_employee_id_seq', (SELECT COALESCE(MAX(employee_id), 0) + 1 FROM employees), false);
SELECT setval('projects_project_id_seq', (SELECT COALESCE(MAX(project_id), 0) + 1 FROM projects), false);
SELECT setval('leaves_leave_id_seq', 1, false);
SELECT setval('settings_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM settings), false);
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM users), false);
