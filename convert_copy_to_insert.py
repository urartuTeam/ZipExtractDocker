#!/usr/bin/env python3
"""
Скрипт для преобразования COPY в INSERT INTO в файле dump.sql
PostgreSQL COPY формат использует табуляцию как разделитель
"""

import re
import sys
import os

def main():
    if len(sys.argv) != 3:
        print("Использование: python convert_copy_to_insert.py <input_file> <output_file>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if not os.path.exists(input_file):
        print(f"Ошибка: Файл {input_file} не найден")
        sys.exit(1)
    
    # Чтение файла
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    output_lines = []
    in_copy_block = False
    current_table = ""
    columns = []
    current_values = []
    
    for i, line in enumerate(lines):
        line = line.rstrip('\n')
        
        # Начало COPY блока
        if line.startswith("COPY ") and " FROM stdin;" in line:
            in_copy_block = True
            # Извлекаем имя таблицы и колонки
            table_match = re.match(r'COPY\s+([\w\.\"]+)\s+\(([^)]+)\)\s+FROM\s+stdin;', line)
            if table_match:
                current_table = table_match.group(1)
                columns = [col.strip() for col in table_match.group(2).split(',')]
                print(f"Обработка таблицы: {current_table}")
                current_values = []
                # Пропускаем строку COPY, но формируем начало INSERT
                continue
        
        # Конец COPY блока
        elif line == "\\." and in_copy_block:
            in_copy_block = False
            # Формируем INSERT запрос, если есть значения
            if current_values:
                batch_size = 100
                batches = [current_values[i:i+batch_size] for i in range(0, len(current_values), batch_size)]
                for batch in batches:
                    insert_stmt = f"INSERT INTO {current_table} ({', '.join(columns)}) VALUES\n"
                    insert_stmt += ",\n".join(batch)
                    insert_stmt += ";"
                    output_lines.append(insert_stmt)
                    output_lines.append("")  # Пустая строка для разделения
            continue
            
        # Внутри COPY блока - обрабатываем значения
        elif in_copy_block and line.strip():
            # Разделяем по табуляции и форматируем значения для SQL
            values = []
            # Используем tab как разделитель для PostgreSQL COPY
            fields = line.split('\t')
            
            for field in fields:
                if field == '\\N':
                    values.append('NULL')
                elif field == 't':
                    values.append('TRUE')
                elif field == 'f':
                    values.append('FALSE')
                elif field.isdigit():
                    values.append(field)
                else:
                    # Экранирование одинарных кавычек
                    field = field.replace("'", "''")
                    values.append(f"'{field}'")
            
            # Проверяем соответствие количества полей и колонок
            if len(values) != len(columns):
                print(f"Предупреждение: Строка имеет {len(values)} значений, ожидалось {len(columns)}. Строка: {line}")
                # Дополняем NULL-ами если не хватает
                while len(values) < len(columns):
                    values.append('NULL')
                # Обрезаем если слишком много
                values = values[:len(columns)]
            
            # Добавляем в текущий набор значений
            current_values.append(f"({', '.join(values)})")
            continue
        
        # Все остальные строки копируем как есть
        if not in_copy_block:
            output_lines.append(line)
    
    # Записываем результат
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(output_lines))
    
    print(f"Преобразование завершено. Результат записан в {output_file}")

if __name__ == "__main__":
    main()