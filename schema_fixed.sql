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
-- Name: set_deleted_timestamp(); Type: FUNCTION; Schema: public; Owner: neondb_owner
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


ALTER FUNCTION public.set_deleted_timestamp() OWNER TO neondb_owner;

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
-- Name: active_departments; Type: VIEW; Schema: public; Owner: neondb_owner
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


ALTER VIEW public.active_departments OWNER TO neondb_owner;

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
-- Name: active_employeeprojects; Type: VIEW; Schema: public; Owner: neondb_owner
--

CREATE VIEW public.active_employeeprojects AS
 SELECT employee_id,
    project_id,
    role,
    deleted,
    deleted_at
   FROM public.employeeprojects
  WHERE (deleted = false);


ALTER VIEW public.active_employeeprojects OWNER TO neondb_owner;

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
    deleted_at timestamp without time zone,
    category_parent_id integer
);


ALTER TABLE public.employees OWNER TO neondb_owner;

--
-- Name: active_employees; Type: VIEW; Schema: public; Owner: neondb_owner
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


ALTER VIEW public.active_employees OWNER TO neondb_owner;

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
-- Name: active_leaves; Type: VIEW; Schema: public; Owner: neondb_owner
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


ALTER VIEW public.active_leaves OWNER TO neondb_owner;

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
-- Name: active_position_department; Type: VIEW; Schema: public; Owner: neondb_owner
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


ALTER VIEW public.active_position_department OWNER TO neondb_owner;

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
-- Name: active_projects; Type: VIEW; Schema: public; Owner: neondb_owner
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


ALTER VIEW public.active_projects OWNER TO neondb_owner;

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
-- Name: active_users; Type: VIEW; Schema: public; Owner: neondb_owner
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


ALTER VIEW public.active_users OWNER TO neondb_owner;

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
-- Name: position_position; Type: TABLE; Schema: public; Owner: neondb_owner
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


ALTER TABLE public.position_position OWNER TO neondb_owner;

--
-- Name: TABLE position_position; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON TABLE public.position_position IS 'Таблица для хранения иерархических связей между должностями в контексте отделов';


--
-- Name: COLUMN position_position.position_relation_id; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.position_position.position_relation_id IS 'Уникальный идентификатор связи';


--
-- Name: COLUMN position_position.position_id; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.position_position.position_id IS 'ID подчиненной должности';


--
-- Name: COLUMN position_position.parent_position_id; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.position_position.parent_position_id IS 'ID родительской должности';


--
-- Name: COLUMN position_position.department_id; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.position_position.department_id IS 'ID отдела, в котором действует связь (опционально)';


--
-- Name: COLUMN position_position.sort; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.position_position.sort IS 'Порядок сортировки';


--
-- Name: COLUMN position_position.deleted; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.position_position.deleted IS 'Флаг удаления (мягкое удаление)';


--
-- Name: position_position_position_relation_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.position_position_position_relation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.position_position_position_relation_id_seq OWNER TO neondb_owner;

--
-- Name: position_position_position_relation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.position_position_position_relation_id_seq OWNED BY public.position_position.position_relation_id;


--
-- Name: positions; Type: TABLE; Schema: public; Owner: neondb_owner
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
-- Name: sort_tree; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sort_tree (
    id integer NOT NULL,
    sort integer NOT NULL,
    type character varying(20) NOT NULL,
    type_id integer NOT NULL,
    parent_id integer,
    CONSTRAINT sort_tree_type_check CHECK (((type)::text = ANY ((ARRAY['department'::character varying, 'position'::character varying])::text[])))
);


ALTER TABLE public.sort_tree OWNER TO neondb_owner;

--
-- Name: sort_tree_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.sort_tree_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sort_tree_id_seq OWNER TO neondb_owner;

--
-- Name: sort_tree_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.sort_tree_id_seq OWNED BY public.sort_tree.id;


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
-- Name: position_position position_relation_id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.position_position ALTER COLUMN position_relation_id SET DEFAULT nextval('public.position_position_position_relation_id_seq'::regclass);


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
-- Name: sort_tree id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sort_tree ALTER COLUMN id SET DEFAULT nextval('public.sort_tree_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


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
-- Name: position_position position_position_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.position_position
    ADD CONSTRAINT position_position_pkey PRIMARY KEY (position_relation_id);


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
-- Name: sort_tree sort_tree_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sort_tree
    ADD CONSTRAINT sort_tree_pkey PRIMARY KEY (id);


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
-- Name: idx_position_position_department_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_position_position_department_id ON public.position_position USING btree (department_id);


--
-- Name: idx_position_position_parent_position_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_position_position_parent_position_id ON public.position_position USING btree (parent_position_id);


--
-- Name: idx_position_position_position_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_position_position_position_id ON public.position_position USING btree (position_id);


--
-- Name: idx_position_position_unique_relation; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX idx_position_position_unique_relation ON public.position_position USING btree (position_id, parent_position_id, department_id) WHERE (deleted = false);


--
-- Name: sort_tree_type_type_id_parent_id_unique; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX sort_tree_type_type_id_parent_id_unique ON public.sort_tree USING btree (type, type_id, parent_id);


--
-- Name: departments set_departments_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER set_departments_deleted_timestamp BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: employeeprojects set_employeeprojects_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER set_employeeprojects_deleted_timestamp BEFORE UPDATE ON public.employeeprojects FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: employees set_employees_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER set_employees_deleted_timestamp BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: leaves set_leaves_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER set_leaves_deleted_timestamp BEFORE UPDATE ON public.leaves FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: position_department set_position_department_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER set_position_department_deleted_timestamp BEFORE UPDATE ON public.position_department FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: positions set_positions_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER set_positions_deleted_timestamp BEFORE UPDATE ON public.positions FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: projects set_projects_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER set_projects_deleted_timestamp BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


--
-- Name: users set_users_deleted_timestamp; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER set_users_deleted_timestamp BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();


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
-- Name: position_position fk_department; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.position_position
    ADD CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: position_position fk_parent_position; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.position_position
    ADD CONSTRAINT fk_parent_position FOREIGN KEY (parent_position_id) REFERENCES public.positions(position_id);


--
-- Name: position_position fk_position; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.position_position
    ADD CONSTRAINT fk_position FOREIGN KEY (position_id) REFERENCES public.positions(position_id);


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

