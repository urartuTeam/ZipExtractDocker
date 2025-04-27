-- Файл для добавления и настройки полей для учета вакансий в таблице position_department

-- Проверяем наличие колонок для учета вакансий и добавляем их, если отсутствуют
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'position_department' AND column_name = 'staff_units') THEN
    ALTER TABLE position_department ADD COLUMN staff_units integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'position_department' AND column_name = 'current_count') THEN
    ALTER TABLE position_department ADD COLUMN current_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'position_department' AND column_name = 'vacancies') THEN
    ALTER TABLE position_department ADD COLUMN vacancies integer DEFAULT 0;
  END IF;
END $$;

-- Создаем триггер для автоматического расчета количества вакансий
CREATE OR REPLACE FUNCTION update_vacancy_count() RETURNS TRIGGER AS $$
BEGIN
  -- Рассчитываем количество вакансий как разницу между штатными единицами и текущим количеством
  NEW.vacancies := NEW.staff_units - NEW.current_count;
  
  -- Убеждаемся, что количество вакансий не отрицательное
  IF NEW.vacancies < 0 THEN
    NEW.vacancies := 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер, который будет вызываться при обновлении полей staff_units или current_count
DROP TRIGGER IF EXISTS position_vacancies_trigger ON position_department;
CREATE TRIGGER position_vacancies_trigger
BEFORE INSERT OR UPDATE OF staff_units, current_count ON position_department
FOR EACH ROW
EXECUTE FUNCTION update_vacancy_count();

-- Обновляем существующие записи, чтобы установить правильные значения вакансий
UPDATE position_department SET vacancies = staff_units - current_count WHERE staff_units >= current_count;
UPDATE position_department SET vacancies = 0 WHERE staff_units < current_count;