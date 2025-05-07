

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

DROP FUNCTION IF EXISTS public.set_deleted_timestamp();
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


CREATE TABLE public._dummy_position_references (
                                                   id integer NOT NULL,
                                                   position_id integer
);


ALTER TABLE public._dummy_position_references OWNER TO postgres;


CREATE SEQUENCE public._dummy_position_references_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._dummy_position_references_id_seq OWNER TO postgres;


ALTER SEQUENCE public._dummy_position_references_id_seq OWNED BY public._dummy_position_references.id;



CREATE TABLE public.departments (
                                    department_id integer NOT NULL,
                                    name text NOT NULL,
                                    parent_department_id integer,
                                    parent_position_id integer,
                                    deleted boolean DEFAULT false,
                                    deleted_at timestamp without time zone
);


ALTER TABLE public.departments OWNER TO postgres;


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


CREATE TABLE public.employeeprojects (
                                         employee_id integer NOT NULL,
                                         project_id integer NOT NULL,
                                         role text NOT NULL,
                                         deleted boolean DEFAULT false,
                                         deleted_at timestamp without time zone
);


ALTER TABLE public.employeeprojects OWNER TO postgres;


CREATE VIEW public.active_employeeprojects AS
SELECT employeeprojects.employee_id,
       employeeprojects.project_id,
       employeeprojects.role,
       employeeprojects.deleted,
       employeeprojects.deleted_at
FROM public.employeeprojects
WHERE (employeeprojects.deleted = false);


ALTER TABLE public.active_employeeprojects OWNER TO postgres;


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


CREATE TABLE public.projects (
                                 project_id integer NOT NULL,
                                 name text NOT NULL,
                                 description text,
                                 department_id integer,
                                 deleted boolean DEFAULT false,
                                 deleted_at timestamp without time zone
);


ALTER TABLE public.projects OWNER TO postgres;


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


CREATE SEQUENCE public.departments_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.departments_department_id_seq OWNER TO postgres;


ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;



CREATE SEQUENCE public.employees_employee_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.employees_employee_id_seq OWNER TO postgres;


ALTER SEQUENCE public.employees_employee_id_seq OWNED BY public.employees.employee_id;



CREATE SEQUENCE public.leaves_leave_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.leaves_leave_id_seq OWNER TO postgres;


ALTER SEQUENCE public.leaves_leave_id_seq OWNED BY public.leaves.leave_id;



CREATE SEQUENCE public.position_department_position_link_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.position_department_position_link_id_seq OWNER TO postgres;


ALTER SEQUENCE public.position_department_position_link_id_seq OWNED BY public.position_department.position_link_id;



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


COMMENT ON TABLE public.position_position IS 'Таблица для хранения иерархических связей между должностями в контексте отделов';



COMMENT ON COLUMN public.position_position.position_relation_id IS 'Уникальный идентификатор связи';



COMMENT ON COLUMN public.position_position.position_id IS 'ID подчиненной должности';



COMMENT ON COLUMN public.position_position.parent_position_id IS 'ID родительской должности';



COMMENT ON COLUMN public.position_position.department_id IS 'ID отдела, в котором действует связь (опционально)';



COMMENT ON COLUMN public.position_position.sort IS 'Порядок сортировки';



COMMENT ON COLUMN public.position_position.deleted IS 'Флаг удаления (мягкое удаление)';



CREATE SEQUENCE public.position_position_position_relation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.position_position_position_relation_id_seq OWNER TO postgres;


ALTER SEQUENCE public.position_position_position_relation_id_seq OWNED BY public.position_position.position_relation_id;



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


CREATE SEQUENCE public.positions_position_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.positions_position_id_seq OWNER TO postgres;


ALTER SEQUENCE public.positions_position_id_seq OWNED BY public.positions.position_id;



CREATE SEQUENCE public.projects_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projects_project_id_seq OWNER TO postgres;


ALTER SEQUENCE public.projects_project_id_seq OWNED BY public.projects.project_id;



CREATE TABLE public.settings (
                                 id integer NOT NULL,
                                 data_key text NOT NULL,
                                 data_value text NOT NULL,
                                 created_at timestamp without time zone DEFAULT now(),
                                 updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.settings OWNER TO postgres;


CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.settings_id_seq OWNER TO postgres;


ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;



CREATE TABLE public.sort_tree (
                                  id integer NOT NULL,
                                  sort integer NOT NULL,
                                  type character varying(20) NOT NULL,
                                  type_id integer NOT NULL,
                                  parent_id integer,
                                  CONSTRAINT sort_tree_type_check CHECK (((type)::text = ANY (ARRAY[('department'::character varying)::text, ('position'::character varying)::text])))
);


ALTER TABLE public.sort_tree OWNER TO postgres;


CREATE SEQUENCE public.sort_tree_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sort_tree_id_seq OWNER TO postgres;


ALTER SEQUENCE public.sort_tree_id_seq OWNED BY public.sort_tree.id;

