# HR System v1.0



## Начало работы

Система предназначена для учета и управления персоналом компании.
Всего сущностей:
- Отделы
- Должности
- Сотрудники
- Проекты
- Учет отпусков

## Быстрый старт

На сервере необходимо склонировать репозиторий проекта и запустить docker:

```
git clone https://gitlabstage.gitlab.yandexcloud.net/hr-system/hr-system-v1.0.git
cd hr-system-v1.0.git
docker-compose up -d --build

```

## В браузере
nginx отрабатывает проект на 80 порту 
```angular2html
http://{ip cсервера} 
```

### Дамп
```angular2html
После запуска докера выполнить
docker exec -i hr-system-v10-postgres-1 pg_dump -U postgres -d hr_system < dump.sql

Эта команда для сохранения дампа
docker exec -t hr-system-v10-postgres-1 pg_dump -U postgres -d hr_system > dump.sql
```