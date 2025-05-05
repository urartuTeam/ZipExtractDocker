#!/bin/bash

# Скрипт для добавления команд сброса последовательностей в конец SQL-файла

echo '
-- Reset sequences based on current max values

SELECT setval(pg_get_serial_sequence('"'"'public._dummy_position_references'"'"', '"'"'id'"'"'), COALESCE(MAX(id), 1)) FROM public._dummy_position_references;
SELECT setval(pg_get_serial_sequence('"'"'public.departments'"'"', '"'"'department_id'"'"'), COALESCE(MAX(department_id), 1)) FROM public.departments;
SELECT setval(pg_get_serial_sequence('"'"'public.employees'"'"', '"'"'employee_id'"'"'), COALESCE(MAX(employee_id), 1)) FROM public.employees;
SELECT setval(pg_get_serial_sequence('"'"'public.leaves'"'"', '"'"'leave_id'"'"'), COALESCE(MAX(leave_id), 1)) FROM public.leaves;
SELECT setval(pg_get_serial_sequence('"'"'public.position_department'"'"', '"'"'position_link_id'"'"'), COALESCE(MAX(position_link_id), 1)) FROM public.position_department;
SELECT setval(pg_get_serial_sequence('"'"'public.position_position'"'"', '"'"'position_relation_id'"'"'), COALESCE(MAX(position_relation_id), 1)) FROM public.position_position;
SELECT setval(pg_get_serial_sequence('"'"'public.positions'"'"', '"'"'position_id'"'"'), COALESCE(MAX(position_id), 1)) FROM public.positions;
SELECT setval(pg_get_serial_sequence('"'"'public.projects'"'"', '"'"'project_id'"'"'), COALESCE(MAX(project_id), 1)) FROM public.projects;
SELECT setval(pg_get_serial_sequence('"'"'public.settings'"'"', '"'"'id'"'"'), COALESCE(MAX(id), 1)) FROM public.settings;
SELECT setval(pg_get_serial_sequence('"'"'public.sort_tree'"'"', '"'"'sort_id'"'"'), COALESCE(MAX(sort_id), 1)) FROM public.sort_tree;
SELECT setval(pg_get_serial_sequence('"'"'public.users'"'"', '"'"'id'"'"'), COALESCE(MAX(id), 1)) FROM public.users;
' >> full_database_dump_inserts.sql

echo "Последовательности сброшены и добавлены в файл."