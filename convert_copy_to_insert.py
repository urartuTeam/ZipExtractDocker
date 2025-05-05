#!/usr/bin/env python3
"""
Скрипт для преобразования COPY в INSERT INTO в файле dump.sql
"""

import re
import sys
import os

# Функция для преобразования одного \N в NULL
def convert_null(value):
    if value == '\\N':
        return 'NULL'
    return value

# Функция для форматирования строковых значений
def format_value(val, col_type='text'):
    if val == 'NULL':
        return 'NULL'
    elif val == 't':  # boolean true
        return 'TRUE'
    elif val == 'f':  # boolean false
        return 'FALSE'
    elif col_type == 'numeric' and val.isdigit():
        return val
    else:  # Обрабатываем как строку
        # Экранирование одинарных кавычек
        val = val.replace("'", "''")
        return f"'{val}'"

# Функция для обработки одной секции COPY
def process_copy_section(lines, table_name, columns):
    values_lines = []
    batch_size = 100  # Количество строк в одном INSERT
    current_batch = []
    
    for line in lines:
        line = line.strip()
        if line == '\\.' or not line:
            continue
            
        # Разделяем строку на значения с учётом возможного разделителя tab
        values = []
        
        # Обработка значений без разделителя
        current_val = ""
        for i, char in enumerate(line):
            if char.isdigit() and i == 0:  # Если строка начинается с цифр (ID)
                current_val += char
            elif char == '\\' and i+1 < len(line) and line[i+1] == 'N':
                values.append('NULL')
                current_val = ""
                i += 1  # Пропускаем N
            elif not current_val and char.isdigit():
                current_val += char
            elif current_val and (char.isalpha() or char in ' -().,'):
                current_val += char
            elif char in 'tf' and not current_val:  # boolean значения
                values.append('TRUE' if char == 't' else 'FALSE')
                current_val = ""
            elif current_val:
                values.append(format_value(current_val))
                current_val = ""
                if char.isdigit():
                    current_val += char

        # Добавляем последнее значение, если оно осталось
        if current_val:
            values.append(format_value(current_val))
            
        # Проверка, что количество значений соответствует количеству колонок
        if len(values) == len(columns):
            current_batch.append(f"({', '.join(values)})")
        else:
            # Попробуем более простой подход
            raw_values = line.split()
            processed_values = []
            for i, val in enumerate(raw_values):
                # Обрабатываем NULL значения и другие типы данных
                if val == '\\N':
                    processed_values.append('NULL')
                elif i == 0 and val.isdigit():  # Первое значение - обычно ID
                    processed_values.append(val)
                elif val == 't':
                    processed_values.append('TRUE')
                elif val == 'f':
                    processed_values.append('FALSE')
                else:
                    # Экранирование одинарных кавычек
                    val = val.replace("'", "''")
                    processed_values.append(f"'{val}'")
            
            if len(processed_values) == len(columns):
                current_batch.append(f"({', '.join(processed_values)})")
            else:
                print(f"Предупреждение: Строка в {table_name} имеет {len(values)} значений, ожидалось {len(columns)}. Строка: {line}")
        
        # Если достигли размера пакета, добавляем в результат
        if len(current_batch) >= batch_size:
            values_lines.append(f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES\n" + ",\n".join(current_batch) + ";")
            current_batch = []
    
    # Добавляем последний пакет
    if current_batch:
        values_lines.append(f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES\n" + ",\n".join(current_batch) + ";")
    
    return values_lines

def main():
    if len(sys.argv) != 3:
        print("Использование: python convert_copy_to_insert.py <input_file> <output_file>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if not os.path.exists(input_file):
        print(f"Ошибка: Файл {input_file} не найден")
        sys.exit(1)
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Находим все секции COPY
    copy_pattern = r'COPY\s+([\w\.\"]+)\s+\(([^)]+)\)\s+FROM\s+stdin;(.*?)\\.'
    copy_sections = re.findall(copy_pattern, content, re.DOTALL)
    
    new_content = content
    
    for table_name, columns_str, data in copy_sections:
        columns = [col.strip() for col in columns_str.split(',')]
        data_lines = data.strip().split('\n')
        
        # Обрабатываем данные и получаем INSERT инструкции
        insert_statements = process_copy_section(data_lines, table_name, columns)
        
        # Заменяем секцию COPY на INSERT
        copy_section = f"COPY {table_name} ({columns_str}) FROM stdin;{data}" + "\\."
        insert_section = '\n\n'.join(insert_statements)
        
        new_content = new_content.replace(copy_section, insert_section)
    
    # Записываем результат
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Преобразование завершено. Результат записан в {output_file}")

if __name__ == "__main__":
    main()