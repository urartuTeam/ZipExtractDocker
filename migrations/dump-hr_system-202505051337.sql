PGDMP  %    %                }         	   hr_system    15.12    17.0 j    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    16384 	   hr_system    DATABASE     t   CREATE DATABASE hr_system WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';
    DROP DATABASE hr_system;
                     postgres    false            �            1259    16537    departments    TABLE     �   CREATE TABLE public.departments (
    department_id integer NOT NULL,
    name text NOT NULL,
    parent_department_id integer,
    parent_position_id integer,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);
    DROP TABLE public.departments;
       public         heap r       postgres    false            �            1259    16547    employeeprojects    TABLE     �   CREATE TABLE public.employeeprojects (
    employee_id integer NOT NULL,
    project_id integer NOT NULL,
    role text NOT NULL,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);
 $   DROP TABLE public.employeeprojects;
       public         heap r       postgres    false            �            1259    16557 	   employees    TABLE     <  CREATE TABLE public.employees (
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
    DROP TABLE public.employees;
       public         heap r       postgres    false            �            1259    16567    leaves    TABLE     �   CREATE TABLE public.leaves (
    leave_id integer NOT NULL,
    employee_id integer,
    start_date date NOT NULL,
    end_date date,
    type text NOT NULL,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);
    DROP TABLE public.leaves;
       public         heap r       postgres    false            �            1259    16577    position_department    TABLE     [  CREATE TABLE public.position_department (
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
 '   DROP TABLE public.position_department;
       public         heap r       postgres    false            �            1259    16589    projects    TABLE     �   CREATE TABLE public.projects (
    project_id integer NOT NULL,
    name text NOT NULL,
    description text,
    department_id integer,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);
    DROP TABLE public.projects;
       public         heap r       postgres    false            �            1259    16599    users    TABLE       CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);
    DROP TABLE public.users;
       public         heap r       postgres    false            �            1259    16610    departments_department_id_seq    SEQUENCE     �   CREATE SEQUENCE public.departments_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 4   DROP SEQUENCE public.departments_department_id_seq;
       public               postgres    false    216            �           0    0    departments_department_id_seq    SEQUENCE OWNED BY     _   ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;
          public               postgres    false    230            �            1259    16611    employees_employee_id_seq    SEQUENCE     �   CREATE SEQUENCE public.employees_employee_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.employees_employee_id_seq;
       public               postgres    false    220            �           0    0    employees_employee_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public.employees_employee_id_seq OWNED BY public.employees.employee_id;
          public               postgres    false    231            �            1259    16612    leaves_leave_id_seq    SEQUENCE     �   CREATE SEQUENCE public.leaves_leave_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.leaves_leave_id_seq;
       public               postgres    false    222            �           0    0    leaves_leave_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.leaves_leave_id_seq OWNED BY public.leaves.leave_id;
          public               postgres    false    232            �            1259    16613 (   position_department_position_link_id_seq    SEQUENCE     �   CREATE SEQUENCE public.position_department_position_link_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ?   DROP SEQUENCE public.position_department_position_link_id_seq;
       public               postgres    false    224            �           0    0 (   position_department_position_link_id_seq    SEQUENCE OWNED BY     u   ALTER SEQUENCE public.position_department_position_link_id_seq OWNED BY public.position_department.position_link_id;
          public               postgres    false    233            �            1259    16614    position_position    TABLE     �  CREATE TABLE public.position_position (
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
 %   DROP TABLE public.position_position;
       public         heap r       postgres    false            �           0    0    TABLE position_position    COMMENT     �   COMMENT ON TABLE public.position_position IS 'Таблица для хранения иерархических связей между должностями в контексте отделов';
          public               postgres    false    234            �           0    0 -   COLUMN position_position.position_relation_id    COMMENT     �   COMMENT ON COLUMN public.position_position.position_relation_id IS 'Уникальный идентификатор связи';
          public               postgres    false    234            �           0    0 $   COLUMN position_position.position_id    COMMENT     j   COMMENT ON COLUMN public.position_position.position_id IS 'ID подчиненной должности';
          public               postgres    false    234            �           0    0 +   COLUMN position_position.parent_position_id    COMMENT     s   COMMENT ON COLUMN public.position_position.parent_position_id IS 'ID родительской должности';
          public               postgres    false    234            �           0    0 &   COLUMN position_position.department_id    COMMENT     �   COMMENT ON COLUMN public.position_position.department_id IS 'ID отдела, в котором действует связь (опционально)';
          public               postgres    false    234            �           0    0    COLUMN position_position.sort    COMMENT     Z   COMMENT ON COLUMN public.position_position.sort IS 'Порядок сортировки';
          public               postgres    false    234            �           0    0     COLUMN position_position.deleted    COMMENT     s   COMMENT ON COLUMN public.position_position.deleted IS 'Флаг удаления (мягкое удаление)';
          public               postgres    false    234            �            1259    16620 *   position_position_position_relation_id_seq    SEQUENCE     �   CREATE SEQUENCE public.position_position_position_relation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 A   DROP SEQUENCE public.position_position_position_relation_id_seq;
       public               postgres    false    234            �           0    0 *   position_position_position_relation_id_seq    SEQUENCE OWNED BY     y   ALTER SEQUENCE public.position_position_position_relation_id_seq OWNED BY public.position_position.position_relation_id;
          public               postgres    false    235            �            1259    16621 	   positions    TABLE     W  CREATE TABLE public.positions (
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
    DROP TABLE public.positions;
       public         heap r       postgres    false            �            1259    16632    positions_position_id_seq    SEQUENCE     �   CREATE SEQUENCE public.positions_position_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.positions_position_id_seq;
       public               postgres    false    236            �           0    0    positions_position_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public.positions_position_id_seq OWNED BY public.positions.position_id;
          public               postgres    false    237            �            1259    16633    projects_project_id_seq    SEQUENCE     �   CREATE SEQUENCE public.projects_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.projects_project_id_seq;
       public               postgres    false    226            �           0    0    projects_project_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.projects_project_id_seq OWNED BY public.projects.project_id;
          public               postgres    false    238            �            1259    16634    settings    TABLE     �   CREATE TABLE public.settings (
    id integer NOT NULL,
    data_key text NOT NULL,
    data_value text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
    DROP TABLE public.settings;
       public         heap r       postgres    false            �            1259    16641    settings_id_seq    SEQUENCE     �   CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.settings_id_seq;
       public               postgres    false    239            �           0    0    settings_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;
          public               postgres    false    240            �            1259    16642 	   sort_tree    TABLE     N  CREATE TABLE public.sort_tree (
    id integer NOT NULL,
    sort integer NOT NULL,
    type character varying(20) NOT NULL,
    type_id integer NOT NULL,
    parent_id integer,
    CONSTRAINT sort_tree_type_check CHECK (((type)::text = ANY (ARRAY[('department'::character varying)::text, ('position'::character varying)::text])))
);
    DROP TABLE public.sort_tree;
       public         heap r       postgres    false            �            1259    16646    sort_tree_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sort_tree_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.sort_tree_id_seq;
       public               postgres    false    241            �           0    0    sort_tree_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.sort_tree_id_seq OWNED BY public.sort_tree.id;
          public               postgres    false    242            �            1259    16647    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public               postgres    false    228            �           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public               postgres    false    243            �           2604    16649    departments department_id    DEFAULT     �   ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);
 H   ALTER TABLE public.departments ALTER COLUMN department_id DROP DEFAULT;
       public               postgres    false    230    216            �           2604    16650    employees employee_id    DEFAULT     ~   ALTER TABLE ONLY public.employees ALTER COLUMN employee_id SET DEFAULT nextval('public.employees_employee_id_seq'::regclass);
 D   ALTER TABLE public.employees ALTER COLUMN employee_id DROP DEFAULT;
       public               postgres    false    231    220            �           2604    16651    leaves leave_id    DEFAULT     r   ALTER TABLE ONLY public.leaves ALTER COLUMN leave_id SET DEFAULT nextval('public.leaves_leave_id_seq'::regclass);
 >   ALTER TABLE public.leaves ALTER COLUMN leave_id DROP DEFAULT;
       public               postgres    false    232    222            �           2604    16652 $   position_department position_link_id    DEFAULT     �   ALTER TABLE ONLY public.position_department ALTER COLUMN position_link_id SET DEFAULT nextval('public.position_department_position_link_id_seq'::regclass);
 S   ALTER TABLE public.position_department ALTER COLUMN position_link_id DROP DEFAULT;
       public               postgres    false    233    224            �           2604    16653 &   position_position position_relation_id    DEFAULT     �   ALTER TABLE ONLY public.position_position ALTER COLUMN position_relation_id SET DEFAULT nextval('public.position_position_position_relation_id_seq'::regclass);
 U   ALTER TABLE public.position_position ALTER COLUMN position_relation_id DROP DEFAULT;
       public               postgres    false    235    234                        2604    16654    positions position_id    DEFAULT     ~   ALTER TABLE ONLY public.positions ALTER COLUMN position_id SET DEFAULT nextval('public.positions_position_id_seq'::regclass);
 D   ALTER TABLE public.positions ALTER COLUMN position_id DROP DEFAULT;
       public               postgres    false    237    236            �           2604    16655    projects project_id    DEFAULT     z   ALTER TABLE ONLY public.projects ALTER COLUMN project_id SET DEFAULT nextval('public.projects_project_id_seq'::regclass);
 B   ALTER TABLE public.projects ALTER COLUMN project_id DROP DEFAULT;
       public               postgres    false    238    226                       2604    16656    settings id    DEFAULT     j   ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);
 :   ALTER TABLE public.settings ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    240    239            
           2604    16657    sort_tree id    DEFAULT     l   ALTER TABLE ONLY public.sort_tree ALTER COLUMN id SET DEFAULT nextval('public.sort_tree_id_seq'::regclass);
 ;   ALTER TABLE public.sort_tree ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    242    241            �           2604    16658    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    243    228            �          0    16537    departments 
   TABLE DATA                 public               postgres    false    216   �       �          0    16547    employeeprojects 
   TABLE DATA                 public               postgres    false    218   χ       �          0    16557 	   employees 
   TABLE DATA                 public               postgres    false    220   ��       �          0    16567    leaves 
   TABLE DATA                 public               postgres    false    222   |�       �          0    16577    position_department 
   TABLE DATA                 public               postgres    false    224   ��       �          0    16614    position_position 
   TABLE DATA                 public               postgres    false    234   Ɨ       �          0    16621 	   positions 
   TABLE DATA                 public               postgres    false    236   �       �          0    16589    projects 
   TABLE DATA                 public               postgres    false    226   �       �          0    16634    settings 
   TABLE DATA                 public               postgres    false    239   ]�       �          0    16642 	   sort_tree 
   TABLE DATA                 public               postgres    false    241   �       �          0    16599    users 
   TABLE DATA                 public               postgres    false    228   3�       �           0    0    departments_department_id_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('public.departments_department_id_seq', 33, true);
          public               postgres    false    230            �           0    0    employees_employee_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.employees_employee_id_seq', 130, true);
          public               postgres    false    231            �           0    0    leaves_leave_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.leaves_leave_id_seq', 1, false);
          public               postgres    false    232            �           0    0 (   position_department_position_link_id_seq    SEQUENCE SET     X   SELECT pg_catalog.setval('public.position_department_position_link_id_seq', 190, true);
          public               postgres    false    233            �           0    0 *   position_position_position_relation_id_seq    SEQUENCE SET     Z   SELECT pg_catalog.setval('public.position_position_position_relation_id_seq', 116, true);
          public               postgres    false    235                        0    0    positions_position_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.positions_position_id_seq', 124, true);
          public               postgres    false    237                       0    0    projects_project_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.projects_project_id_seq', 23, true);
          public               postgres    false    238                       0    0    settings_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.settings_id_seq', 2, false);
          public               postgres    false    240                       0    0    sort_tree_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.sort_tree_id_seq', 36, true);
          public               postgres    false    242                       0    0    users_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.users_id_seq', 2, false);
          public               postgres    false    243                       2606    16662 ;   employeeprojects employeeprojects_employee_id_project_id_pk 
   CONSTRAINT     �   ALTER TABLE ONLY public.employeeprojects
    ADD CONSTRAINT employeeprojects_employee_id_project_id_pk PRIMARY KEY (employee_id, project_id);
 e   ALTER TABLE ONLY public.employeeprojects DROP CONSTRAINT employeeprojects_employee_id_project_id_pk;
       public                 postgres    false    218    218                       2606    16664    employees employees_pkey 
   CONSTRAINT     _   ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (employee_id);
 B   ALTER TABLE ONLY public.employees DROP CONSTRAINT employees_pkey;
       public                 postgres    false    220                       2606    16666    departments idx_department_id 
   CONSTRAINT     a   ALTER TABLE ONLY public.departments
    ADD CONSTRAINT idx_department_id UNIQUE (department_id);
 G   ALTER TABLE ONLY public.departments DROP CONSTRAINT idx_department_id;
       public                 postgres    false    216            #           2606    16668    positions idx_position_id 
   CONSTRAINT     [   ALTER TABLE ONLY public.positions
    ADD CONSTRAINT idx_position_id UNIQUE (position_id);
 C   ALTER TABLE ONLY public.positions DROP CONSTRAINT idx_position_id;
       public                 postgres    false    236                       2606    16670    leaves leaves_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_pkey PRIMARY KEY (leave_id);
 <   ALTER TABLE ONLY public.leaves DROP CONSTRAINT leaves_pkey;
       public                 postgres    false    222            !           2606    16672 (   position_position position_position_pkey 
   CONSTRAINT     x   ALTER TABLE ONLY public.position_position
    ADD CONSTRAINT position_position_pkey PRIMARY KEY (position_relation_id);
 R   ALTER TABLE ONLY public.position_position DROP CONSTRAINT position_position_pkey;
       public                 postgres    false    234                       2606    16674    projects projects_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (project_id);
 @   ALTER TABLE ONLY public.projects DROP CONSTRAINT projects_pkey;
       public                 postgres    false    226            %           2606    16676    settings settings_data_key_key 
   CONSTRAINT     ]   ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_data_key_key UNIQUE (data_key);
 H   ALTER TABLE ONLY public.settings DROP CONSTRAINT settings_data_key_key;
       public                 postgres    false    239            '           2606    16678    settings settings_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.settings DROP CONSTRAINT settings_pkey;
       public                 postgres    false    239            )           2606    16680    sort_tree sort_tree_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.sort_tree
    ADD CONSTRAINT sort_tree_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.sort_tree DROP CONSTRAINT sort_tree_pkey;
       public                 postgres    false    241                       2606    16682    users users_email_unique 
   CONSTRAINT     T   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_unique;
       public                 postgres    false    228                       2606    16684    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    228                       2606    16686    users users_username_unique 
   CONSTRAINT     Z   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);
 E   ALTER TABLE ONLY public.users DROP CONSTRAINT users_username_unique;
       public                 postgres    false    228                       1259    16687 #   idx_position_position_department_id    INDEX     j   CREATE INDEX idx_position_position_department_id ON public.position_position USING btree (department_id);
 7   DROP INDEX public.idx_position_position_department_id;
       public                 postgres    false    234                       1259    16688 (   idx_position_position_parent_position_id    INDEX     t   CREATE INDEX idx_position_position_parent_position_id ON public.position_position USING btree (parent_position_id);
 <   DROP INDEX public.idx_position_position_parent_position_id;
       public                 postgres    false    234                       1259    16689 !   idx_position_position_position_id    INDEX     f   CREATE INDEX idx_position_position_position_id ON public.position_position USING btree (position_id);
 5   DROP INDEX public.idx_position_position_position_id;
       public                 postgres    false    234                       1259    16690 %   idx_position_position_unique_relation    INDEX     �   CREATE UNIQUE INDEX idx_position_position_unique_relation ON public.position_position USING btree (position_id, parent_position_id, department_id) WHERE (deleted = false);
 9   DROP INDEX public.idx_position_position_unique_relation;
       public                 postgres    false    234    234    234    234            *           1259    16691 '   sort_tree_type_type_id_parent_id_unique    INDEX     x   CREATE UNIQUE INDEX sort_tree_type_type_id_parent_id_unique ON public.sort_tree USING btree (type, type_id, parent_id);
 ;   DROP INDEX public.sort_tree_type_type_id_parent_id_unique;
       public                 postgres    false    241    241    241            2           2620    16692 -   departments set_departments_deleted_timestamp    TRIGGER     �   CREATE TRIGGER set_departments_deleted_timestamp BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();
 F   DROP TRIGGER set_departments_deleted_timestamp ON public.departments;
       public               postgres    false    216            3           2620    16693 7   employeeprojects set_employeeprojects_deleted_timestamp    TRIGGER     �   CREATE TRIGGER set_employeeprojects_deleted_timestamp BEFORE UPDATE ON public.employeeprojects FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();
 P   DROP TRIGGER set_employeeprojects_deleted_timestamp ON public.employeeprojects;
       public               postgres    false    218            4           2620    16694 )   employees set_employees_deleted_timestamp    TRIGGER     �   CREATE TRIGGER set_employees_deleted_timestamp BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();
 B   DROP TRIGGER set_employees_deleted_timestamp ON public.employees;
       public               postgres    false    220            5           2620    16695 #   leaves set_leaves_deleted_timestamp    TRIGGER     �   CREATE TRIGGER set_leaves_deleted_timestamp BEFORE UPDATE ON public.leaves FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();
 <   DROP TRIGGER set_leaves_deleted_timestamp ON public.leaves;
       public               postgres    false    222            6           2620    16696 =   position_department set_position_department_deleted_timestamp    TRIGGER     �   CREATE TRIGGER set_position_department_deleted_timestamp BEFORE UPDATE ON public.position_department FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();
 V   DROP TRIGGER set_position_department_deleted_timestamp ON public.position_department;
       public               postgres    false    224            9           2620    16697 )   positions set_positions_deleted_timestamp    TRIGGER     �   CREATE TRIGGER set_positions_deleted_timestamp BEFORE UPDATE ON public.positions FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();
 B   DROP TRIGGER set_positions_deleted_timestamp ON public.positions;
       public               postgres    false    236            7           2620    16698 '   projects set_projects_deleted_timestamp    TRIGGER     �   CREATE TRIGGER set_projects_deleted_timestamp BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();
 @   DROP TRIGGER set_projects_deleted_timestamp ON public.projects;
       public               postgres    false    226            8           2620    16699 !   users set_users_deleted_timestamp    TRIGGER     �   CREATE TRIGGER set_users_deleted_timestamp BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_deleted_timestamp();
 :   DROP TRIGGER set_users_deleted_timestamp ON public.users;
       public               postgres    false    228            +           2606    16705 F   employeeprojects employeeprojects_employee_id_employees_employee_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.employeeprojects
    ADD CONSTRAINT employeeprojects_employee_id_employees_employee_id_fk FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id);
 p   ALTER TABLE ONLY public.employeeprojects DROP CONSTRAINT employeeprojects_employee_id_employees_employee_id_fk;
       public               postgres    false    220    218    3345            ,           2606    16710 C   employeeprojects employeeprojects_project_id_projects_project_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.employeeprojects
    ADD CONSTRAINT employeeprojects_project_id_projects_project_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(project_id);
 m   ALTER TABLE ONLY public.employeeprojects DROP CONSTRAINT employeeprojects_project_id_projects_project_id_fk;
       public               postgres    false    218    3349    226            -           2606    16715 >   employees employees_department_id_departments_department_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_department_id_departments_department_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(department_id);
 h   ALTER TABLE ONLY public.employees DROP CONSTRAINT employees_department_id_departments_department_id_fk;
       public               postgres    false    220    216    3341            1           2606    16720    position_position fk_department    FK CONSTRAINT     �   ALTER TABLE ONLY public.position_position
    ADD CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES public.departments(department_id);
 I   ALTER TABLE ONLY public.position_position DROP CONSTRAINT fk_department;
       public               postgres    false    234    216    3341            .           2606    16725 2   leaves leaves_employee_id_employees_employee_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_employee_id_employees_employee_id_fk FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id);
 \   ALTER TABLE ONLY public.leaves DROP CONSTRAINT leaves_employee_id_employees_employee_id_fk;
       public               postgres    false    220    3345    222            /           2606    16730 R   position_department position_department_department_id_departments_department_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.position_department
    ADD CONSTRAINT position_department_department_id_departments_department_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(department_id);
 |   ALTER TABLE ONLY public.position_department DROP CONSTRAINT position_department_department_id_departments_department_id_fk;
       public               postgres    false    216    224    3341            0           2606    16735 <   projects projects_department_id_departments_department_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_department_id_departments_department_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(department_id);
 f   ALTER TABLE ONLY public.projects DROP CONSTRAINT projects_department_id_departments_department_id_fk;
       public               postgres    false    226    216    3341            �   �  x���MKQ������@Bg��V-\b���� ���}J_P�ԢaD`̙Rǿp�?�=w�H%f�a>ν��9�ޛ�d�{9���vE��tr�vT,Ϋ�ųjE���ɬX�b�&��'�d˚��K2����������P�ݏ��Pʣ��4dY��YlD�D\O�����
�
aa��nBd�:j�I�(Ys���'h ����%�LN!H�=a:�!G�9]��ۂ��q�oA��$}�ʁ��Z>��{��"�� �����m�_�O@�Wq%0	�7j	z����8E��E������@j,e+ʓ�ʹ���]qK�J�j.�q�Bd�b,�B2���Q�K{N���3��\�k�3g�/�	^�цǣ�@[͒����m�{kFecz������u� �, {�ڣ��7�P���J      �   �  x���;�A�s�b2�d�����l`�2�K��iWFk�# ���pB�����-1P�����_U�T�jsq��[m.�v���ۛ��i���<�������{�f}u~ѽ(~��E7�?|��8|9|�������/�����a�m��뗯g�)� @���>=<�s�||��׹t�̥�$ϧ��~��/}*>��ϊӟ�/svE��g"1��'B�	�'JD*�t�UD8ĭ�dK*� �0�"�'��gƿS�1�b��^$�����Zh�9���w� ���!�r���Y�9��� h"�@@{�h���{J��uZ�:m� �TOؿ]Uͩ�(�vU��W۵�^V��Ԋ��uU��mU�j?����v`ufA`#�c�eR�sBD�
�X`�="��y��+���ZO�a��m�N`3�AB�H���m� `�hCOP{�Z��Z{j$��nb�H������fDı���>XĲ�e���.�"&N�lo>�����JP�#������e��s�:$am�K=�ϚS�gͩͳ��ѳ���Y{�C6z��]�1�oz��j��#�9ԈP+��T2Am�Y������ޞ�;z��j@�=������	�� �X+Am���[���P#B�U'Q���[ 6#�&���E�( 5"�JPGo1;@��P�[ȴ�F�Z	j�k]g�?.`��      �   �	  x��[K�U��+j�F�tuuUu�F,H&���cB���X���v@�qxF� /1��i�������y�z�j{�U�� �8�_�{�w���[��|t�Ï�Sg>�����g��}���շ��ns�����?9�����=f�Žh���h-�AZѭ(����]+���_��8�G�x���E=f9��;������s_�wi�⥍��3��>}�j�Ǭ/Ϟ�����?�~�ȩuP�[�P� YX��y�@� ��/�F�1`#���/�Ԕ܆_���8��k�!�	��Ai#�[�М��+O��올����`�i4�w�!GnB�g?<�F �<>�GP:�$�kL���[1�T��Lw��\�q7ZR=��W1�~))����\���>��+OU߆0�x{nĻ roS12E\�d�[D��+T�U���=K�%_,MAz��M�I�t��)���M2�=�5�����ǭ����jp��3�W��<����igD�a�\��PC�ڴ71��RG���N�����c�݋�L���=J��T$��tk����Bq]@mN��>�F����e�� a�%��@�iY��?���W��S������_���׫�C�Pewk�('���\B�I[�3@�'���s(�ڈd�jD�@�y���G���$��M�9.? IQ��6*��\6B�R-(���9Kڐ[#l�X��90A��2꺢���i�rʟ��V��U��j �ͰF(O�h�4,Ս�8���f9R�T��S8�`�11���=�ҁ(&/���8X��k~��"s,n�'�D$U4�T`<���0�$�T�6���)(D�w��w������/1���|S���oB�����!�p�ҫ}��Xz��K���j���sƕI`�sE%pH�Î���6�L;�r��ۃ�,�o�+z�9"ݿ�R�1���nl�~�Qƌ��6��+�F�=78X$�$>���J��&�ڭ�R��M���YHg�w	ʶH+�s�K���E��{�a�4)	@�I�����'p����ʴ2C~ʷ��@S�嘔`&ƪK�����T1����m݀ef�I�&UN���#��4b��-��i��VAf��G�ax��a�I�y�P j���9u�a�Nr�MOW��'V��^��u�i1�`���󦧾}�����́�x6��zv��e�����zs(.�c��yȖ���d���?��'�e_C��@["M^���O�U?4b�=(�)�b���L�͹�M "F�V�C���nRq�S�fy0�)�L���+�)͠zs��7(~K:U�����C�,��kN8|}�4�CTx])�n�Z���#��ۋ�\��m#@|,(F܎�^2Ե�&�8�u�,!P�V��
��L $g�xX�9+���>`E5��b����f3ͳh�J-��Bx3e��N�V�|��!��L~�ٲ=�0a,{ɉ�l����
1�Џ�L�,
��)움����z*?�T~}�P�%S����h��yk��`�:}r 
����*��k���l��`��	�YW-V�O`�Q7f���,xMY z=��d��B��	o���~�͡�	��m�a��>2+��9���<��д�i���HVs~�^�٥Z*�u�`�.)��t)3��/��_�u�iϡsSXn�B��n+�,3���-՗�O�a�g�[S;�'A۩�P����R�w���Zq�Z�C�0:�A/e�Xr�>W��=B(")���㍠7��;�x���*�e��tHU3j�Õ�m���T�Q;̎�]�x,����(��<=;(5�*W��UF�[m5�,X#�U+���3)��u�V�.]����[m�x[-���h�v�n9�i{�]�LP��-��K6a�ϧ�Ƚd7�~]>�>x�g���6
D�� 6����t�K,��{��l,��	6ܠ�����1�D����3��&B�������uM)�%���n�k@�x�!ݿ�%W�Db��+
�8��#r�+b(^n֣����ԁ9m�i��ޡ�� �^P;������T�\����&��p(9�,�.w5+M�~o
�����+���� ���@������#A���!�mg���_�C�x��w�I���r=�H��*-�Ϫ�Q;��yY�BK����Y=k�f�� &�:c]R��8�D6j:R�����]�!�*�F��2'Ӆ�1��%��?A�-������&[#���òҭ�<���z�a��J��
CE�µ/"��	:×��"�P���m��BoQ[s_�h�T^���vH�Cpv���$�>�M����n�uR�S��^�
��ځ	��a�	x��1b��!y�Xu��򧻋D�P;�Ɇ�+]�[�cU�I���?�x%1������S��-��
R[o��A
؜ۢ%C!���B�N��/ >�)j.�OY��5E�y��#�#G�^���      �   
   x���          �      x���OkTQ���o�0�˻��Õ�.
��u+UG(�v���7�ٙ+�Bq1?򒓓��n�?�M7������ק�o�N/���Ǘ�/ߏ��_����������vz��ݴλi�ݤ~<<�w��~������������&�
�*t�;T�Ь�Ď�(T�]Z��E�r�Eʌ47��Q�K ��F�贎"Mh6���B��i5(5��ŗT Ԋ�u��7Յ�@�
�l��j����U?;;.�j�3ۥ��fJ��Pm)�bjUI���P>��
mZ ��r*�UXY�P�tL?.T�9�C��T��)iaF���L�!�t�`�p��M0j�):����N�l}�43�!&��k�0���j�0R|h@��ǍTa�ܜ6�~!Be���K��ߥV4����K�(�KUV��?�է���ԀZe�(�2�2�\j�]E.zu��j�b��R�)�K]MY�j����)��F���\j(�fzu��juS5�e6eq�bʢVkYLY\j2eujVS�KŚMY�X�)˥F��ߔ��@3eq3�MYT*p����S���gIPV�SUY���T��w.�p�g �-�d� K��u[���X�f�0�-�ɽ�C��=6�/�a
!���	G�O�� c����7l�^�#jd��-7��2UJ�Lk+����öeVk��]jVZW���<��`��cB�X��tl�ѱ���b���p�-�����a��qr0q����v�)NƢd��ܢd��'��o�8�dh�C$�}s��3WW ��8�      �   H  x�����]7��y��KK�ƒ,�>]u����B�t[���@hi߿�L8���o�"p�[�%�����W?���_��i������H?|z����߿>�c��Ǉw��l� �m��6�w���������3��Y�p��g�YRoRK�.�7�����?���oxq����"��H4E���%!T���� 9 Jj(��Gt%� 5ũ�і�N}�� Y���A��&���"R��:�HW� fő�.1�V �)�D����풮�%I���!]	"H�8�t���y'H�hFp$: �w�"�$��f�4D���b� v*)gV#�"YA�H�.��'�֝����0���%��&�}f3AI���S��U�ˊ�w�jΙ�<�� ���ͰB�P�$�$#� �1��p�ޱ��q� �DzhLk$݄�d�D��j�W�<��=��%����~� )D�5���ҵ��DW��Wmk$���]�=�+AI݈����ԕƊꃜp���d$�� ����l��j1��;��v$�X#1j��+9����
IM���ZA38�����	Z*�Quv�"H�"�B�.VR�:�>������R��1mb�98#� �!��C�{j U�0�"Hx0���{���D��q.Re>7�� �Tw��9��
��"H|ȸ$mk&)��8��poY#�D��Z5��#� �!�����{�B_���p�v0�������<�� ���"i	��CZ��UZA i�K_2�	Q�!�yn�VA�CƝ ��KګGA�CƝ J�6nN,A��=�2:43��� �C��@��Ѯq"s�����I�|o%��IFA��|;A�@i9gp��"Hrȷ$�D��ۑ�D��!�\��H��$���
"Hû�I��N~�3� R��o�q#����d�E�X�uKVAR���H�Z�d{��"Hû�I�
T�a�
"Hj �H<�6�5����4Z!��y��&`�ڭ<�����w槖�S3�#� �5^!�Q�D;k2��"H��K#�$�Y:~t52=�#� ����H�����MA�?#�R�~"$���D�����g�eE ���d6&�"HZ�:�������d$�^o@��Z�X�� RW�.k�R�8k�� ��~��I���J�!]	"H�����>�x��#Dj��AI���Ը�A[k ̦�s$E�'-��8n�����D�� �Is�eE%�m��"Hj ���|^�J*����ҕ �� yi�e���g�~��"Lm0��j<�ڻJGa�醳�jG�o� �������q��E��F����\B����� �j�`/��t�W�� Eꒀ�w�.Zw�ѭ��L�*�}F;�]��>˾��!&8�&�IJ���G��S�7P����癡�!�P 7P1$��3W�	BT#� �Tu\�T��J���FH�@���`7��%���@E9U�s�F�!|��M^�=�+A�j����zI�-Q��땙 D5B
dI%��<����FH���eG����t��	BT#�`��rytj�ܭ����(\;�����/��T/^��f�      �   �  x��Y[OA~�W�� ��[w���L���фĨ}����&���˻iK+���_��G�sv
ؽ��0�@����s��̜�ҵ�W�����+�������,<z���d��q������9/���j����5�Px�՞~)��n��JT^����髱j����j���Α�{��ܝK7͛�g�UX��z����]x������5��#,�́Ja��\���8�|�� �~i��˫��ܙ�U>PA?C�6&�`�P@��ġv"�����s�����e6!��������y�D�!�����i*��i|��F�V?�S���,[�U��s�=��|�#o���n�JT;�h>�+��Q��3J�7����Ҡ���wO%&m�C�;�q�� �ȏ��	�h�� �J(%و�$�8W�#xqD�����|��lE��n�y60�|p�[߲ˠɉ2��,�MPqp]d�)0��o�{̴4Ϩ�g�[�������c�� .�o�
� #��y�`%��v�-]*�}�E����go���5��)g>����^E2c��h�CY�,#\�'�@�7�&8}F���[�:1�6>��q�1h��N�6�sC���	��P�\:B9/i���$Gp��aPj�QI'K�JK��Q�iP��>HR�`aD�m���]��:�ZI�[�Q�C�٥N7�|`n6m쁑B}�X��[�K�c|8A�c�
?�)k�G���	!������|��^�(�{�3#ʉ�|f�Û&��ȩ}���vF^i߇���Q�M5��7��,�j�F$��u�o�����F��nS<�m]Tgr�*���V�ke�v��h��.߼���U�H�|�V��e~���,tOJ�j�I�R,,���k��N�v�@���p��Vy�ͱ��S�Dr�3!"��di��\}�D�*��|f��&��A��z�H��E<�����T��4��L:�
�����ܑ��9E�v=��J	;�����k	�S�V�-1I����eB�=;���)yxTa{�-�;9yj��W�m�qM�C�2�z���&�6�r#�j$,�*��L#�F�n�$s�^�'��	B:>[�;wi��e$Q8#�?�$I���G��_�#])Iߟ�\'����ӫS0Hׯz����S��u7�w�G8�߻ �Zx��?C��n1q���bO�;�C�B*ႌ\?:�df�7O�]      �   e  x����N�@��<�쀄�+q�I��ƭ��hHl��-T�� ���& �(�W��<3h59�N���7gz�3�eGyaZ��pkg���[��t�Պ8��[Ķ"�Z��q�v��
�lB���*��!�1���Q�{"�K�&/�R@_6�5�s.�\fz�`O�d]60��W�Q"Pd	�?殰A���m��em�h[�t(o}��ȭ��.�����Δ�s��R24���db�I��&��ZA	����5�}����_��#Z,D(��|���Iәlr��e�ƍ�����x�PDy�쪸�/�9��3Nrs'��<�U��x����+Nr���q�F"_�Rs      �   }   x���v
Q���W((M��L�+N-)��K/Vs�	uV�0�QP��L-J,JΨ����,�L̉�I-K�)V��##S]]#sC+c3+CS=3KKC�,+XZX��eM�5���� B�"�      �   9  x����J�0�}�"�Q(���6ŕ�YJgƭ��EA���߄A��,r _Ͻ=M��:�~<>����s~��,���4���?�UY�ݺ\f?/�]-���x����/��U�����Mgj1���\
�-K��]8.HL��&�)H�h)x�4����J��]4 �)V�i�ߪε��?Uj���@��Y��*�J���)�M�3(n��T�\:}��`,{FB@�O��~���r2�y�߅d#8Ė�a	�i� �H6���&�ǙP�0�?@�B� m���=�      �   �   x�5��
�0 w�"�-�$i��]��AU��m�"��[�n�\�vս'u��Ȳ�itŶ��J�f�:r`I���g��K��y�B�^�.�I�d �Q����)Z/||�L*��St�Z4Ȣ��X!�h���S99��xɡ@ ��W��֐�vh��9I�/�.1'     