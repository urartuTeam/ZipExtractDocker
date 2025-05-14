<?php
// dump_manual_ordered.php

$db = new PDO('pgsql:host=localhost;dbname=hr_system', 'postgres', 'postgres');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$outputFile = 'migrations/full_data_dump.sql';
file_put_contents($outputFile, ''); // очистить файл

$tables = [
    'positions',
    'departments',
    'employees',
    'projects',
    'position_department',
    'position_position',
    'employeeprojects',
    'sort_tree',
    'settings',
    'users',
    'leaves',
];

foreach ($tables as $table) {
    $rows = $db->query("SELECT * FROM public.\"$table\"")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as $row) {
        $columns = array_map(fn($col) => "\"$col\"", array_keys($row));
        $values = array_map(function ($val) use ($db) {
            return $val === null ? 'NULL' : $db->quote($val);
        }, array_values($row));

        $line = sprintf(
            "INSERT INTO public.\"%s\" (%s) VALUES (%s);\n",
            $table,
            implode(', ', $columns),
            implode(', ', $values)
        );

        file_put_contents($outputFile, $line, FILE_APPEND);
    }
}

echo "Done: $outputFile\n";
