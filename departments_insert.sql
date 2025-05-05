-- Вставка данных departments
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES
(21, 'Администрация', NULL, NULL, false, NULL),
(22, 'Управление', NULL, 39, false, NULL),
(23, 'Управление цифровизации и градостроительных данных', 22, NULL, false, NULL),
(24, 'Управление цифрового развития', 22, NULL, false, NULL),
(25, 'Отдел координации реализации планов ОИВ', NULL, 50, false, NULL),
(26, 'Отдел координации аналитики ПО Строительство', NULL, 51, false, NULL),
(27, 'Отдел координации аналитики ПО Земля', NULL, 51, false, NULL),
(28, 'Отдел координации аналитики ПО Градрешения', NULL, 51, false, NULL),
(29, 'Отдел координации аналитики ПО Аналитики и Мониторинга', NULL, 51, false, NULL),
(30, 'Отдел координации разработки', NULL, 52, false, NULL),
(31, 'Отдел инженерного обеспечения', NULL, 52, false, NULL),
(32, 'Отдел инженерного тестирования', NULL, 52, false, NULL),
(33, 'Отдел координации деятельности', NULL, 53, false, NULL);