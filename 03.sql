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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


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

-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
                                    department_id integer NOT NULL,
                                    name text NOT NULL,
                                    parent_department_id integer,
                                    parent_position_id integer,
                                    deleted boolean DEFAULT false,
                                    deleted_at timestamp without time zone,
                                    is_organization boolean DEFAULT false,
                                    logo_path text,
                                    sort integer DEFAULT 0
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
                                  deleted_at timestamp without time zone,
                                  category_parent_id integer
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
       deleted_at,
       category_parent_id
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
                                  sort integer DEFAULT 0,
                                  deleted boolean DEFAULT false,
                                  deleted_at timestamp without time zone,
                                  is_category boolean DEFAULT false
);


--
-- Name: active_positions; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.active_positions AS
SELECT position_id,
       name,
       sort,
       deleted,
       deleted_at,
       is_category
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
                                 deleted_at timestamp without time zone,
                                 id_organization integer,
                                 sort integer DEFAULT 0
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
                              deleted_at timestamp without time zone,
                              role character varying(20) DEFAULT 'user'::character varying
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
                                  CONSTRAINT sort_tree_type_check CHECK (((type)::text = ANY (ARRAY[('department'::character varying)::text, ('position'::character varying)::text])))
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
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);


--
-- Name: employeeprojects employeeprojects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employeeprojects
    ADD CONSTRAINT employeeprojects_pkey PRIMARY KEY (employee_id, project_id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (employee_id);


--
-- Name: leaves leaves_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_pkey PRIMARY KEY (leave_id);


--
-- Name: position_department position_department_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.position_department
    ADD CONSTRAINT position_department_pkey PRIMARY KEY (position_link_id);


--
-- Name: position_position position_position_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.position_position
    ADD CONSTRAINT position_position_pkey PRIMARY KEY (position_relation_id);


--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (position_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (project_id);


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
-- Name: sort_tree sort_tree_type_type_id_parent_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sort_tree
    ADD CONSTRAINT sort_tree_type_type_id_parent_id_unique UNIQUE (type, type_id, parent_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: departments departments_parent_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_parent_department_id_fkey FOREIGN KEY (parent_department_id) REFERENCES public.departments(department_id);


--
-- Name: departments departments_parent_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_parent_position_id_fkey FOREIGN KEY (parent_position_id) REFERENCES public.positions(position_id);


--
-- Name: employeeprojects employeeprojects_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employeeprojects
    ADD CONSTRAINT employeeprojects_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id);


--
-- Name: employeeprojects employeeprojects_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employeeprojects
    ADD CONSTRAINT employeeprojects_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- Name: employees employees_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: employees employees_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.employees(employee_id);


--
-- Name: employees employees_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(position_id);


--
-- Name: projects fk_organization; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_organization FOREIGN KEY (id_organization) REFERENCES public.departments(department_id);


--
-- Name: leaves leaves_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id);


--
-- Name: position_department position_department_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.position_department
    ADD CONSTRAINT position_department_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: position_department position_department_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.position_department
    ADD CONSTRAINT position_department_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(position_id);


--
-- Name: position_position position_position_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.position_position
    ADD CONSTRAINT position_position_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: position_position position_position_parent_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.position_position
    ADD CONSTRAINT position_position_parent_position_id_fkey FOREIGN KEY (parent_position_id) REFERENCES public.positions(position_id);


--
-- Name: position_position position_position_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.position_position
    ADD CONSTRAINT position_position_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(position_id);


--
-- Name: projects projects_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: projects projects_id_organization_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_id_organization_fkey FOREIGN KEY (id_organization) REFERENCES public.departments(department_id);


--
-- PostgreSQL database dump complete
--
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (7, 'Заместитель генерального директора по координации разработки', 6, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (47, 'Администратор проекта', 10, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (48, 'Главный эксперт', 11, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (49, 'Ведущий специалист', 12, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (45, 'Заместитель начальника управления', 8, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (54, 'Начальник отдела (Руководитель команды)', 13, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (56, 'Главный бухгалтер', 14, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (57, 'Специалист по бухгалтерскому учету и отчетности ', 15, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (58, 'Специалист по охране труда', 16, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (59, 'Специалист по административно-хозяйственному обеспечению', 17, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (60, 'Специалист по подбору персонала', 18, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (61, 'Руководитель направления закупочной деятельности', 19, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (62, 'Руководитель направления кадрового администрирования', 20, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (63, 'Руководитель направления правового обеспечения', 21, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (64, 'Юрист', 22, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (65, 'Руководитель отдела тестирования', 23, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (66, 'Главный тестировщик', 24, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (67, 'Ведущий тестировщик', 25, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (68, 'Тестировщик', 26, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (69, 'Руководитель проекта', 27, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (70, 'Заместитель руководителя ', 28, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (71, 'Главный аналитик', 29, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (72, 'Ведущий аналитик', 30, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (73, 'Старший аналитик', 31, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (74, 'Администратор', 32, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (75, 'Аналитик', 33, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (76, 'Ведущий аналитик СУИД', 34, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (77, 'Младший аналитик', 35, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (78, 'Аналитик-координатор', 36, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (80, 'Ведущий разработчик', 37, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (83, 'Специалист по цифровым решениям', 38, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (90, 'Главный разработчик I категории', 39, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (91, 'Главный разработчик II категории', 40, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (92, 'Старший разработчик I категории', 41, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (93, 'Старший разработчик II категории', 42, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (94, 'Старший разработчик III категории', 43, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (95, 'Старший разработчик IV категории', 44, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (96, 'Разработчик II категории', 45, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (97, 'Разработчик III категории', 46, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (98, 'Разработчик IV категории', 47, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (99, 'Специалист по цифровым решениям I категории', 48, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (100, 'Специалист по цифровым решениям II категории', 49, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (101, 'Специалист по цифровым решениям III категории', 50, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (102, 'Специалист по цифровым решениям IV категории', 51, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (103, 'Специалист по цифровым решениям V категории', 52, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (104, 'Специалист по цифровым решениям IV категории', 53, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (105, 'Разработчик I категории', 54, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (106, 'Руководитель проектов по эксплуатации информационных систем', 55, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (107, 'Начальник отдела - Руководитель блока', 56, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (108, 'Ведущий специалист информационной безопасности', 57, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (109, 'Специалист информационной безопасности', 58, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (110, 'Архитектор', 59, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (111, 'Системный администратор', 60, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (112, 'Технический писатель', 61, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (113, 'Системный инженер I категории', 62, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (114, 'Системный инженер II категории', 63, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (115, 'Системный инженер III категории', 64, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (116, 'Системный инженер IV категории', 65, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (117, 'Ведущий дизайнер интерфейсов', 66, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (118, 'Специалист технической поддержки', 67, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (119, 'Дизайнер интерфейсов', 68, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (120, 'Дизайнер', 69, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (8, 'Исполнительный директор', 0, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (4, 'Заместитель генерального директора по координации реализации планов ОИВ', 1, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (2, 'Заместитель руководителя департамента', 4, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (3, 'Генеральный директор', 2, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (41, 'Главный специалист', 3, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (46, 'Руководитель проекта', 9, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (5, 'Заместитель генерального директора по координации аналитики', 5, false, null, false);
INSERT INTO public.positions (position_id, name, sort, deleted, deleted_at, is_category) VALUES (44, 'Начальник управления', 7, false, null, false);

INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at, is_organization, logo_path, sort) VALUES (2, 'Администрация', null, null, false, null, false, null, 0);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at, is_organization, logo_path, sort) VALUES (3, 'ГБУ МСИ', null, 2, false, null, true, '/uploads/logo-1746807877873-135578036.png', 1);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at, is_organization, logo_path, sort) VALUES (4, 'ООО "Цифролаб"', null, 2, false, null, true, null, 2);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at, is_organization, logo_path, sort) VALUES (6, 'Управление цифрового развития', 3, null, false, null, false, null, 3);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at, is_organization, logo_path, sort) VALUES (5, 'Управление цифровизации и градостроительных данных', 3, null, false, null, false, null, 4);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at, is_organization, logo_path, sort) VALUES (7, 'Отдел координации реализации планов ОИВ', null, 4, false, null, false, null, 5);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at, is_organization, logo_path, sort) VALUES (8, 'Отдел координации аналитики ПО Строительство', null, 5, false, null, false, null, 6);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at, is_organization, logo_path, sort) VALUES (9, 'Отдел координации аналитики ПО Земля', null, 5, false, null, false, null, 7);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at, is_organization, logo_path, sort) VALUES (10, 'Отдел координации аналитики ПО Градрешения', null, 5, false, null, false, null, 8);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at, is_organization, logo_path, sort) VALUES (11, 'Отдел координации аналитики ПО Аналитики и Мониторинга', null, 5, false, null, false, null, 9);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at, is_organization, logo_path, sort) VALUES (12, 'Отдел координации разработки', null, 7, false, null, false, null, 10);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at, is_organization, logo_path, sort) VALUES (13, 'Отдел инженерного обеспечения', null, 7, false, null, false, null, 11);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at, is_organization, logo_path, sort) VALUES (14, 'Отдел тестирования', null, 7, false, null, false, null, 12);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at, is_organization, logo_path, sort) VALUES (15, 'Отдел координации деятельности', null, 8, false, null, false, null, 13);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (18, 'Степанова Дарья Владимировна', null, '+71111111111', 'admin@test.ru', null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (20, 'Самарин Иван Юрьевия', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (21, 'Тюрькин Евгений Андреевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (22, 'Дремин Андрей', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (23, 'Микляева Галина Сергеевна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (24, 'Попов Андрей Михайлович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (25, 'Коробчану Евгений Юрьевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (27, 'Бубненкова Елена Вячеславовна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (28, 'Захарова Полина Андреевна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (29, 'Воробей Сергей Викторович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (30, 'Шедевр Олеся', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (26, 'Чурилова Светлана Михайловна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (19, 'Герц Владимир Андреевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (31, 'Миронова Екатерина Павловна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (32, 'Зелинский Андрей Николаевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (33, 'Молева Анастасия Алексеевна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (34, 'Акимов Александр Викторович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (35, 'Короткова Олеся Эдуардовна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (36, 'Веревкина Ольга Дмитриевна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (37, 'Горошкевич Оксана Александровна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (38, 'Замарина Юлия Валентиновна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (39, 'Молева Дарья Алексеевна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (40, 'Похлоненко Александр Михайлович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (41, 'Печенкин Алексей Викторович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (42, 'Молева Дарья Алексеевна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (43, 'Вегерин Евгений Алексеевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (44, 'Мусаева Джамиля Лом-Алиевна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (45, 'Акимов Михаил Александрович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (46, 'Дупенко Владимир Сергеевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (47, 'Крохалевский Игорь Владимирович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (48, 'Гутеев Роберт Андреевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (49, 'Шатский Никита Александрович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (50, 'Шивцов Максим Владимирович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (51, 'Кунец Анастасия Леонидовна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (52, 'Щербаков Николай Владимирович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (53, 'Аскерова Елизавета Васильевна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (54, 'Гетманская Валерия Владимировна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (55, 'Зайцева Кристина Константиновна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (56, 'Устинович Юлиана Феликсовна ', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (57, 'Подгорный Александр Владимирович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (59, 'Буланцева Дарья Андреевна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (62, 'Шатунова Юлия Викторовна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (63, 'Иевская Анастасия Сергеевна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (61, 'Призенцев Иван Александрович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (60, 'Зиндеева Елена Леонидовна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (64, 'Косягин Дмитрий Сергеевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (65, 'Вишневский Павел Александрович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (66, 'Колпашников Константин Михайлович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (67, 'Луканин Александр Валерьевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (68, 'Якушев Григорий Витальевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (69, 'Пьяных Евгений Николаевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (70, 'Тедеева Линда Ростиславовна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (71, 'Беликова Вероника Георгиевна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (72, 'Дорохина Елена Сергеевна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (73, 'Панов Егор Викторович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (74, 'Полякова Екатерина Валентиновна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (75, 'Ануфриев Иван Дмитриевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (76, 'Данилкин Сергей Александрович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (77, 'Гилязова Ляйсан Анваровна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (78, 'Чащин Павел Леонидович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (79, 'Сизёнова Анастасия Сергеевна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (80, 'Крюков Роман Николаевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (81, 'Вишневская Светлана Александровна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (82, 'Коляндра Наталина Павловна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (83, 'Савченко Максим Павлович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (84, 'Назаров Алексей Викторович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (85, 'Карклис Алина Дмитриевна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (86, 'Ямаева Ильвира Ирековна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (87, 'Белякова Анна Сергеевна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (88, 'Тураев Глеб Вадимович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (89, 'Гильгамешин Георгий Данилович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (90, 'Давыдова Полина Сергеевна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (91, 'Месяцева Наталья Вячеславовна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (92, 'Куров Иван Александрович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (94, 'Джиндоев Юрий Мосесович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (95, 'Асрян Артем Камоевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (93, 'Гарнага Алексей Анатольевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (105, 'Ермаков Алексей Владимирович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (96, 'Пономарев Ярослав Валериевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (103, 'Кораблев Денис Алексеевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (104, 'Шабельников Андрей Владиленович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (99, 'Чалоян Бемал Андраникович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (100, 'Гайсуев Ислам Русланович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (101, 'Измайлов Станислав Юрьевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (106, 'Шилик Павел Олегович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (107, 'Магафуров Айрат Раилевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (108, 'Боровков Егор Николаевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (109, 'Бауров Алексей Владимирович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (110, 'Зятковский Владислав Олегович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (111, 'Полянский Борис Петрович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (112, 'Коваленко Юрий Александрович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (113, 'Ражев Иван Юрьевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (114, 'Раченко Вячеслав Александрович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (115, 'Прокопьев Вячеслав Алексеевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (116, 'Абрамов Руслан Владимирович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (117, 'Дашкин Богдан Владимирович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (118, 'Попов Сергей Павлович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (119, 'Орлов Павел Александрович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (120, 'Щербаков Ярослав Юрьевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (121, 'Салахутдинов Марат Рамилевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (122, 'Зайцева Наталья Владимировна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (123, 'Сухов Николай Николаевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (124, 'Байков Михаил Сергеевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (125, 'Леденев Сергей Александрович', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (126, 'Пак Валерия Викторовна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (127, 'Пинчук Екатерина Сергеевна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (128, 'Халикова Элеонора Шахруховна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (129, 'Аркадьева Олеся Александровна', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (130, 'Филимонов Алексей Алексеевич', null, null, null, null, null, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (58, 'Терновский Андрей Викторович', null, null, null, null, null, false, null, null);
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES (2, 2, 2, 0, false, null, 0, 0, 1);
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES (3, 3, 4, 0, false, null, 0, 0, 1);
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES (8, 8, 4, 0, false, null, 0, 0, 1);
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES (9, 4, 4, 0, false, null, 0, 0, 1);
INSERT INTO public.position_position (position_relation_id, position_id, parent_position_id, department_id, sort, created_at, updated_at, deleted, deleted_at) VALUES (2, 4, 3, 4, null, '2025-05-09 15:19:11.352536 +00:00', '2025-05-09 15:19:11.352536 +00:00', false, null);
INSERT INTO public.position_position (position_relation_id, position_id, parent_position_id, department_id, sort, created_at, updated_at, deleted, deleted_at) VALUES (3, 5, 3, 4, null, '2025-05-09 15:19:26.479267 +00:00', '2025-05-09 15:19:26.479267 +00:00', false, null);
INSERT INTO public.position_position (position_relation_id, position_id, parent_position_id, department_id, sort, created_at, updated_at, deleted, deleted_at) VALUES (5, 7, 3, 4, null, '2025-05-09 15:20:13.604783 +00:00', '2025-05-09 15:20:13.604783 +00:00', false, null);
INSERT INTO public.position_position (position_relation_id, position_id, parent_position_id, department_id, sort, created_at, updated_at, deleted, deleted_at) VALUES (6, 8, 3, 4, null, '2025-05-09 15:20:28.943584 +00:00', '2025-05-09 15:20:28.943584 +00:00', false, null);
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at, sort, id_organization) VALUES (8, 'ЕИС МГЗ', '', null, false, null, 0, null);
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at, sort, id_organization) VALUES (14, 'SuperSet', '', null, false, null, 0, null);
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at, sort, id_organization) VALUES (15, 'АИС РЕОН', '', null, false, null, 0, null);
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at, sort, id_organization) VALUES (16, 'АИС РСМ', '', null, false, null, 0, null);
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at, sort, id_organization) VALUES (17, 'СУИД', '', null, false, null, 0, null);
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at, sort, id_organization) VALUES (18, 'BS', '', null, false, null, 0, null);
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at, sort, id_organization) VALUES (19, 'KPI', '', null, false, null, 0, null);
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at, sort, id_organization) VALUES (20, 'Рейтинг ОИВ', '', null, false, null, 0, null);
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at, sort, id_organization) VALUES (21, 'Производственные программы', '', null, false, null, 0, null);
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at, sort, id_organization) VALUES (22, 'ДБ Аналитика ', 'ДБ Аналитика (Сенина)', null, false, null, 0, null);
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at, sort, id_organization) VALUES (23, 'EXON', '', null, false, null, 0, null);
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at, sort, id_organization) VALUES (9, 'СУПД АКЦЕНТ', '', null, false, null, 0, null);
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at, sort, id_organization) VALUES (10, 'ИАС ОГД', '', null, false, null, 0, null);
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at, sort, id_organization) VALUES (24, 'тестовый', 'кпывфпвы', null, false, null, 0, null);
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at, sort, id_organization) VALUES (7, 'ИАС УГД', '', null, false, null, 0, 3);
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at, sort, id_organization) VALUES (11, 'СтройМос', '', null, false, null, 0, 4);
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at, sort, id_organization) VALUES (12, 'СтроимПросто', '', null, false, null, 0, 4);
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at, sort, id_organization) VALUES (13, 'Строймониторинг', '', null, false, null, 0, 4);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (82, 7, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (83, 7, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (91, 7, 'Участник', true, '2025-05-05 06:51:06.012317');
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (84, 7, 'Участник', true, '2025-05-05 06:51:12.268273');
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (85, 7, 'Участник', true, '2025-05-05 06:51:14.770815');
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (88, 7, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (90, 7, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (128, 7, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (127, 7, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (86, 7, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (87, 7, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (101, 7, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (116, 7, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (118, 7, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (100, 7, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (117, 7, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (119, 7, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (108, 7, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (96, 7, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (110, 7, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (113, 7, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (114, 7, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (73, 8, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (74, 8, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (82, 8, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (83, 8, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (85, 8, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (89, 8, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (114, 8, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (93, 8, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (120, 8, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (112, 8, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (109, 8, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (107, 8, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (65, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (69, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (70, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (81, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (73, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (74, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (76, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (77, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (130, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (82, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (83, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (85, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (89, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (101, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (24, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (108, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (96, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (110, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (113, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (114, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (95, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (105, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (94, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (121, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (99, 9, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (82, 10, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (87, 10, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (101, 10, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (116, 10, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (118, 10, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (100, 10, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (117, 10, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (119, 10, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (108, 10, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (96, 10, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (110, 10, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (113, 10, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (114, 10, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (95, 11, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (111, 11, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (115, 11, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (82, 12, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (83, 12, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (128, 12, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (127, 12, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (86, 12, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (87, 12, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (95, 12, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (111, 12, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (115, 12, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (34, 12, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (46, 12, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (82, 13, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (83, 13, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (85, 13, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (91, 13, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (89, 13, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (90, 13, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (128, 13, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (127, 13, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (92, 13, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (114, 13, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (95, 13, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (105, 13, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (94, 13, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (121, 13, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (99, 13, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (106, 14, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (78, 15, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (79, 15, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (80, 15, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (93, 15, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (120, 15, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (112, 15, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (109, 15, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (107, 15, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (78, 16, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (79, 16, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (80, 16, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (93, 16, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (120, 16, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (112, 16, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (109, 16, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (107, 16, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (73, 17, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (74, 17, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (76, 17, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (82, 17, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (83, 17, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (85, 17, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (89, 17, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (74, 18, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (77, 18, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (80, 18, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (65, 19, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (69, 19, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (70, 19, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (81, 19, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (82, 19, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (83, 19, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (84, 19, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (82, 20, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (83, 20, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (85, 20, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (91, 20, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (89, 20, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (128, 20, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (127, 20, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (82, 21, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (83, 21, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (85, 21, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (89, 21, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (90, 21, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (128, 21, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (127, 21, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (86, 21, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (82, 22, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (83, 22, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (85, 22, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (89, 22, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (128, 22, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (127, 22, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (86, 22, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (82, 23, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (83, 23, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (85, 23, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (89, 23, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (92, 23, 'Участник', false, null);
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES (44, 24, 'Руководитель', false, null);
INSERT INTO public.users (id, username, email, password, created_at, deleted, deleted_at) VALUES (1, 'admin', 'admin@example.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', '2025-04-24 07:52:25.855195', false, null);


SELECT setval(pg_get_serial_sequence('public.departments', 'department_id'), COALESCE(MAX(department_id), 1)) FROM public.departments;
SELECT setval(pg_get_serial_sequence('public.employees', 'employee_id'), COALESCE(MAX(employee_id), 1)) FROM public.employees;
SELECT setval(pg_get_serial_sequence('public.leaves', 'leave_id'), COALESCE(MAX(leave_id), 1)) FROM public.leaves;
SELECT setval(pg_get_serial_sequence('public.position_department', 'position_link_id'), COALESCE(MAX(position_link_id), 1)) FROM public.position_department;
SELECT setval(pg_get_serial_sequence('public.position_position', 'position_relation_id'), COALESCE(MAX(position_relation_id), 1)) FROM public.position_position;
SELECT setval(pg_get_serial_sequence('public.positions', 'position_id'), COALESCE(MAX(position_id), 1)) FROM public.positions;
SELECT setval(pg_get_serial_sequence('public.projects', 'project_id'), COALESCE(MAX(project_id), 1)) FROM public.projects;
SELECT setval(pg_get_serial_sequence('public.settings', 'id'), COALESCE(MAX(id), 1)) FROM public.settings;
SELECT setval(pg_get_serial_sequence('public.sort_tree', 'id'), COALESCE(MAX(id), 1)) FROM public.sort_tree;
SELECT setval(pg_get_serial_sequence('public.users', 'id'), COALESCE(MAX(id), 1)) FROM public.users;

