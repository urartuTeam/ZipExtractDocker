#!/bin/bash

# Скрипт для тестирования API
# Выполняет основные запросы к API для проверки его работоспособности

API_URL="http://localhost:5000"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Начинаем тестирование API..."

# Функция для выполнения GET запроса
function test_get() {
  local endpoint=$1
  local description=$2
  
  echo -n "GET $endpoint ($description): "
  response=$(curl -s "$API_URL$endpoint")
  
  if [[ $response == *"\"status\":\"success\""* ]]; then
    echo -e "${GREEN}OK${NC}"
  else
    echo -e "${RED}FAIL${NC}"
    echo "Response: $response"
  fi
}

# Функция для создания тестовой записи
function test_create() {
  local endpoint=$1
  local data=$2
  local description=$3
  
  echo -n "POST $endpoint ($description): "
  response=$(curl -s -X POST "$API_URL$endpoint" -H "Content-Type: application/json" -d "$data")
  
  if [[ $response == *"\"status\":\"success\""* ]]; then
    echo -e "${GREEN}OK${NC}"
    # Извлекаем ID созданной записи для дальнейшего использования
    if [[ $endpoint == "/api/departments" ]]; then
      CREATED_DEPT_ID=$(echo $response | sed -E 's/.*"department_id":([0-9]+).*/\1/')
      echo "Created department ID: $CREATED_DEPT_ID"
    elif [[ $endpoint == "/api/positions" ]]; then
      CREATED_POS_ID=$(echo $response | sed -E 's/.*"position_id":([0-9]+).*/\1/')
      echo "Created position ID: $CREATED_POS_ID"
    elif [[ $endpoint == "/api/employees" ]]; then
      CREATED_EMP_ID=$(echo $response | sed -E 's/.*"employee_id":([0-9]+).*/\1/')
      echo "Created employee ID: $CREATED_EMP_ID"
    fi
  else
    echo -e "${RED}FAIL${NC}"
    echo "Response: $response"
  fi
  
  return 0
}

# Функция для обновления записи
function test_update() {
  local endpoint=$1
  local data=$2
  local description=$3
  
  echo -n "PUT $endpoint ($description): "
  response=$(curl -s -X PUT "$API_URL$endpoint" -H "Content-Type: application/json" -d "$data")
  
  if [[ $response == *"\"status\":\"success\""* ]]; then
    echo -e "${GREEN}OK${NC}"
  else
    echo -e "${RED}FAIL${NC}"
    echo "Response: $response"
  fi
}

# Функция для удаления записи
function test_delete() {
  local endpoint=$1
  local description=$2
  
  echo -n "DELETE $endpoint ($description): "
  response=$(curl -s -X DELETE "$API_URL$endpoint")
  
  if [[ $response == *"\"status\":\"success\""* ]]; then
    echo -e "${GREEN}OK${NC}"
  else
    echo -e "${RED}FAIL${NC}"
    echo "Response: $response"
  fi
}

# Тестируем базовые эндпоинты
echo "1. Тестирование базовых GET запросов:"
test_get "/api/departments" "Получение списка отделов"
test_get "/api/positions" "Получение списка должностей"
test_get "/api/employees" "Получение списка сотрудников"
test_get "/api/projects" "Получение списка проектов"
test_get "/api/positions/with-departments" "Получение должностей с отделами"

# Тестируем создание записей
echo -e "\n2. Тестирование создания записей:"

# Создаем тестовый отдел
test_create "/api/departments" '{"name": "Тестовый отдел для API", "parent_department_id": 1, "parent_position_id": null}' "Создание тестового отдела"

# Создаем тестовую должность
test_create "/api/positions" '{"name": "Тестовая должность", "staff_units": 2, "current_count": 1, "vacancies": 1, "parent_position_id": 1, "sort": 100}' "Создание тестовой должности"

# Связываем должность с отделом
if [[ -n "$CREATED_DEPT_ID" && -n "$CREATED_POS_ID" ]]; then
  test_create "/api/position_department" "{\"position_id\": $CREATED_POS_ID, \"department_id\": $CREATED_DEPT_ID, \"staff_units\": 2, \"current_count\": 1, \"vacancies\": 1}" "Связывание должности с отделом"
fi

# Создаем тестового сотрудника
if [[ -n "$CREATED_POS_ID" && -n "$CREATED_DEPT_ID" ]]; then
  test_create "/api/employees" "{\"full_name\": \"Тестовый Сотрудник\", \"position_id\": $CREATED_POS_ID, \"department_id\": $CREATED_DEPT_ID, \"phone\": \"+7 (999) 123-45-67\", \"email\": \"test@example.com\"}" "Создание тестового сотрудника"
fi

# Тестируем обновление записей
echo -e "\n3. Тестирование обновления записей:"

# Обновляем тестовый отдел
if [[ -n "$CREATED_DEPT_ID" ]]; then
  test_update "/api/departments/$CREATED_DEPT_ID" '{"name": "Обновленный тестовый отдел"}' "Обновление тестового отдела"
fi

# Обновляем тестовую должность
if [[ -n "$CREATED_POS_ID" ]]; then
  test_update "/api/positions/$CREATED_POS_ID" '{"name": "Обновленная тестовая должность", "staff_units": 3}' "Обновление тестовой должности"
fi

# Обновляем тестового сотрудника
if [[ -n "$CREATED_EMP_ID" ]]; then
  test_update "/api/employees/$CREATED_EMP_ID" '{"full_name": "Обновленный Тестовый Сотрудник", "phone": "+7 (999) 987-65-43"}' "Обновление тестового сотрудника"
fi

# Тестируем удаление (soft delete)
echo -e "\n4. Тестирование удаления записей (soft delete):"

# Удаляем тестового сотрудника
if [[ -n "$CREATED_EMP_ID" ]]; then
  test_delete "/api/employees/$CREATED_EMP_ID" "Удаление тестового сотрудника"
fi

# Удаляем тестовую должность
if [[ -n "$CREATED_POS_ID" ]]; then
  test_delete "/api/positions/$CREATED_POS_ID" "Удаление тестовой должности"
fi

# Удаляем тестовый отдел
if [[ -n "$CREATED_DEPT_ID" ]]; then
  test_delete "/api/departments/$CREATED_DEPT_ID" "Удаление тестового отдела"
fi

echo -e "\nТестирование API завершено!"