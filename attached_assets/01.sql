-- PostgreSQL database dump

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
-- Таблицы без внешних ключей
--

CREATE TABLE public.departments (
                                    department_id integer NOT NULL,
                                    name text NOT NULL,
                                    parent_department_id integer,
                                    parent_position_id integer,
                                    deleted boolean DEFAULT false,
                                    deleted_at timestamp without time zone
);

CREATE SEQUENCE public.departments_department_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.employeeprojects (
                                         employee_id integer NOT NULL,
                                         project_id integer NOT NULL,
                                         role text NOT NULL,
                                         deleted boolean DEFAULT false,
                                         deleted_at timestamp without time zone
);

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

CREATE SEQUENCE public.employees_employee_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.leaves (
                               leave_id integer NOT NULL,
                               employee_id integer,
                               start_date date NOT NULL,
                               end_date date,
                               type text NOT NULL,
                               deleted boolean DEFAULT false,
                               deleted_at timestamp without time zone
);

CREATE SEQUENCE public.leaves_leave_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

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

CREATE SEQUENCE public.position_department_position_link_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

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

CREATE SEQUENCE public.positions_position_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.projects (
                                 project_id integer NOT NULL,
                                 name text NOT NULL,
                                 description text,
                                 department_id integer,
                                 deleted boolean DEFAULT false,
                                 deleted_at timestamp without time zone
);

CREATE SEQUENCE public.projects_project_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.settings (
                                 id integer NOT NULL,
                                 data_key text NOT NULL,
                                 data_value text NOT NULL,
                                 created_at timestamp without time zone DEFAULT now(),
                                 updated_at timestamp without time zone DEFAULT now()
);

CREATE SEQUENCE public.settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.users (
                              id integer NOT NULL,
                              username text NOT NULL,
                              email text NOT NULL,
                              password text NOT NULL,
                              created_at timestamp without time zone DEFAULT now(),
                              deleted boolean DEFAULT false,
                              deleted_at timestamp without time zone
);

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Остались только технические настройки и первичные ключи
ALTER TABLE ONLY public.employeeprojects
    ADD CONSTRAINT employeeprojects_employee_id_project_id_pk PRIMARY KEY (employee_id, project_id);

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (employee_id);

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT idx_department_id UNIQUE (department_id);

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT idx_position_id UNIQUE (position_id);

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_pkey PRIMARY KEY (leave_id);

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (project_id);

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_data_key_key UNIQUE (data_key);

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);

-- Удалены все FOREIGN KEY CONSTRAINTS
-- Оставлены только последовательности и значения по умолчанию