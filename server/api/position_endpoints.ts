import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { insertPositionPositionSchema } from "../../shared/schema";

// Функция для регистрации эндпоинтов для работы с должностями
export function registerPositionEndpoints(app: Express) {

  // Получить должности с информацией об отделах и родительских должностях
  app.get('/api/positions/with-departments', async (req: Request, res: Response) => {
    try {
      // Получаем все данные
      const positions = await storage.getAllPositions();
      const departments = await storage.getAllDepartments();
      const positionDepartments = await storage.getAllPositionDepartments();
      const positionPositions = await storage.getAllPositionPositions();

      // Создаем обогащенный список должностей
      const positionsWithDepts = positions.map((position) => {
        // Сначала группируем все связи position_department по их ID
        const linkMap = new Map();

        // Найдем все связи между данной должностью и отделами
        const departmentLinks = positionDepartments.filter(
            pd => pd.position_id === position.position_id
        );

        // Для каждой связи position_department
        departmentLinks.forEach(link => {
          const dept = departments.find(d => d.department_id === link.department_id);
          if (!dept) return;

          // Создаем базовую информацию о связи
          const linkInfo = {
            position_link_id: link.position_link_id,
            department_id: link.department_id,
            department_name: dept.name || "Неизвестный отдел",
            sort: link.sort,
            vacancies: link.vacancies || 0,
            parent_positions: [], // Будет заполнен родительскими должностями
            parent_position: null,
            position_position_id: null,
            group_key: `null_${link.department_id}`
          };

          // Сохраняем эту информацию по ID связи
          linkMap.set(link.position_link_id, linkInfo);
        });

        // Теперь найдем все родительские должности для этой должности
        const positionRelations = positionPositions.filter(
            (pp) => pp.position_id !== null && pp.position_id === position.position_id
        );

        // Для каждой родительской связи, обновим соответствующую запись в linkMap
        positionRelations.forEach(relation => {
          // Найдем связь position_department с тем же отделом
          const relevantLinks = departmentLinks.filter(
              link => link.department_id === relation.department_id
          );

          // Найдем родительскую должность
          const parentPosition = positions.find(
              (p: { position_id: number }) => p.position_id === relation.parent_position_id
          );

          if (!parentPosition) return;

          // Для каждой соответствующей связи position_department
          relevantLinks.forEach(link => {
            const linkInfo = linkMap.get(link.position_link_id);
            if (!linkInfo) return;

            // Проверим, не добавлена ли уже эта родительская должность
            const alreadyHasParent = linkInfo.parent_positions.some(
                (p: { position_id: number }) => p.position_id === parentPosition.position_id
            );

            if (!alreadyHasParent) {
              // Добавим информацию о родительской должности
              const parentInfo = {
                position_id: parentPosition.position_id,
                name: parentPosition.name
              };

              linkInfo.parent_positions.push(parentInfo);

              // Если это первая родительская должность, установим ее как основную
              if (linkInfo.parent_position === null) {
                linkInfo.parent_position = parentInfo;
                linkInfo.position_position_id = relation.position_relation_id;
                linkInfo.group_key = `${parentPosition.position_id}_${link.department_id}`;
              }
            }
          });
        });

        // Преобразуем Map обратно в массив для результата и сортируем по полю sort
        const linkedDepartments = Array.from(linkMap.values())
            .sort((a, b) => {
                // Если sort отсутствует, считаем его равным 0
                const aSort = a.sort ?? 0;
                const bSort = b.sort ?? 0;
                
                // Сортировка только по полю sort
                return aSort - bSort;
            });

        // Соберем информацию о родительских и дочерних должностях
        const parentPositionsInfo = positionRelations
            .map(relation => {
              const parentPosition = positions.find((p: { position_id: number }) => p.position_id === relation.parent_position_id);
              return parentPosition ? {
                position_id: parentPosition.position_id,
                name: parentPosition.name,
                department_id: relation.department_id
              } : null;
            })
            .filter(Boolean);

        const childrenRelations = positionPositions.filter(
            pp => pp.parent_position_id !== null && pp.parent_position_id === position.position_id
        );

        const childrenPositionsInfo = childrenRelations
            .map(relation => {
              const childPosition = positions.find((p: { position_id: number }) => p.position_id === relation.position_id);
              return childPosition ? {
                position_id: childPosition.position_id,
                name: childPosition.name,
                department_id: relation.department_id
              } : null;
            })
            .filter(Boolean);

        // Формируем итоговый объект для должности
        return {
          ...position,
          departments: linkedDepartments,
          parent_positions: parentPositionsInfo,
          children_positions: childrenPositionsInfo,
          is_subordinate: parentPositionsInfo.length > 0
        };
      });

      // Сортируем результаты ТОЛЬКО по полю sort
      const sortedPositions = positionsWithDepts.sort((a, b) => {
        // Если sort отсутствует, считаем его равным 0
        const aSort = a.sort ?? 0;
        const bSort = b.sort ?? 0;
        
        // Сортировка только по полю sort
        return aSort - bSort;
      });

      // Вывод отладочной информации
      if (sortedPositions.length > 0) {
        console.log("Пример обработанной должности:",
            JSON.stringify({
              position_id: sortedPositions[0].position_id,
              name: sortedPositions[0].name,
              departments: sortedPositions[0].departments
            }, null, 2)
        );
      }

      res.json({ status: 'success', data: sortedPositions });
    } catch (error) {
      console.error('Ошибка при получении должностей с отделами:', error);
      res.status(500).json({
        status: 'error',
        message: 'Ошибка сервера при получении должностей с отделами'
      });
    }
  });

  // Получить должности по отделу
  app.get('/api/positions-by-department/:departmentId', async (req: Request, res: Response) => {
    try {
      const departmentId = parseInt(req.params.departmentId);
      if (isNaN(departmentId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Некорректный ID отдела'
        });
      }

      // Получаем должности в этом отделе с помощью position_department
      const positionDepartments = await storage.getAllPositionDepartments();
      const departmentPositionIds = positionDepartments
          .filter(pd => pd.department_id === departmentId)
          .map(pd => pd.position_id);

      // Получаем полные данные о должностях
      const positions = await storage.getAllPositions();
      const departmentPositions = positions
          .filter(pos => departmentPositionIds.includes(pos.position_id));

      res.json({
        status: 'success',
        data: departmentPositions
      });
    } catch (error) {
      console.error("Ошибка при получении должностей отдела:", error);
      res.status(500).json({
        status: 'error',
        message: 'Ошибка сервера при получении должностей отдела'
      });
    }
  });

  // Получить иерархию должностей для отдела
  app.get('/api/position-hierarchy/:departmentId', async (req: Request, res: Response) => {
    try {
      const departmentId = parseInt(req.params.departmentId);
      if (isNaN(departmentId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Некорректный ID отдела'
        });
      }

      // Получаем все связи position_position для этого отдела
      const positionPositions = await storage.getPositionPositionsByDepartment(departmentId);

      res.json({
        status: 'success',
        data: positionPositions
      });
    } catch (error) {
      console.error("Ошибка при получении иерархии должностей:", error);
      res.status(500).json({
        status: 'error',
        message: 'Ошибка сервера при получении иерархии должностей'
      });
    }
  });

  // CRUD для position_position

  // Получить все связи position_position
  app.get('/api/positionpositions', async (_req: Request, res: Response) => {
    try {
      const positionPositions = await storage.getAllPositionPositions();
      res.json({ status: 'success', data: positionPositions });
    } catch (error) {
      console.error('Ошибка при получении связей position_position:', error);
      res.status(500).json({
        status: 'error',
        message: 'Ошибка сервера при получении связей position_position'
      });
    }
  });

  // Получить связь position_position по ID
  app.get('/api/positionpositions/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Некорректный ID связи'
        });
      }

      const positionPosition = await storage.getPositionPosition(id);
      if (!positionPosition) {
        return res.status(404).json({
          status: 'error',
          message: 'Связь position_position не найдена'
        });
      }

      res.json({ status: 'success', data: positionPosition });
    } catch (error) {
      console.error('Ошибка при получении связи position_position:', error);
      res.status(500).json({
        status: 'error',
        message: 'Ошибка сервера при получении связи position_position'
      });
    }
  });

  // Создать новую связь position_position
  app.post('/api/positionpositions', async (req: Request, res: Response) => {
    try {
      console.log('Получен запрос на создание связи position_position:', JSON.stringify(req.body));

      // Проверяем данные через Zod схему
      let positionPositionData;
      try {
        positionPositionData = insertPositionPositionSchema.parse(req.body);
        console.log('Данные после валидации:', JSON.stringify(positionPositionData));
      } catch (validationError) {
        console.error('Ошибка валидации данных:', validationError);
        return res.status(400).json({
          status: 'error',
          message: 'Ошибка валидации данных для связи должностей',
          details: validationError
        });
      }

      // Проверяем, существуют ли должности
      if (positionPositionData.position_id === undefined) {
        return res.status(400).json({
          status: 'error',
          message: 'ID должности не указан'
        });
      }

      if (positionPositionData.position_id === null) {
        return res.status(400).json({
          status: 'error',
          message: 'ID должности не может быть null'
        });
      }

      // Получаем информацию о должности
      const position = await storage.getPosition(positionPositionData.position_id);
      if (!position) {
        return res.status(404).json({
          status: 'error',
          message: 'Должность не найдена'
        });
      }

      console.log('Найдена должность:', JSON.stringify(position));

      if (positionPositionData.parent_position_id === undefined) {
        return res.status(400).json({
          status: 'error',
          message: 'ID родительской должности не указан'
        });
      }

      // Проверка, что parent_position_id не равен null
      const parentPositionId = positionPositionData.parent_position_id;
      if (parentPositionId === null) {
        return res.status(400).json({
          status: 'error',
          message: 'ID родительской должности не может быть null'
        });
      }

      // Получаем информацию о родительской должности
      const parentPosition = await storage.getPosition(parentPositionId);
      if (!parentPosition) {
        return res.status(404).json({
          status: 'error',
          message: 'Родительская должность не найдена'
        });
      }

      console.log('Найдена родительская должность:', JSON.stringify(parentPosition));

      // Проверяем, существует ли отдел
      if (positionPositionData.department_id === undefined) {
        return res.status(400).json({
          status: 'error',
          message: 'ID отдела не указан'
        });
      }

      // Проверка, что department_id не равен null
      const departmentId = positionPositionData.department_id;
      if (departmentId === null) {
        return res.status(400).json({
          status: 'error',
          message: 'ID отдела не может быть null'
        });
      }

      // Получаем информацию об отделе
      const department = await storage.getDepartment(departmentId);
      if (!department) {
        return res.status(404).json({
          status: 'error',
          message: 'Отдел не найден'
        });
      }

      console.log('Найден отдел:', JSON.stringify(department));

      // Проверяем, чтобы не было циклических ссылок
      if (positionPositionData.position_id === positionPositionData.parent_position_id) {
        return res.status(400).json({
          status: 'error',
          message: 'Должность не может быть родительской для самой себя'
        });
      }

      // Специальная обработка для категорийных должностей
      if (position.is_category) {
        console.log('Создаём связь для категорийной должности');
      }

      // Проверяем, не существует ли уже такая связь
      const existingPositionPositions = await storage.getAllPositionPositions();
      const alreadyExists = existingPositionPositions.some(pp =>
          pp.position_id === positionPositionData.position_id &&
          pp.parent_position_id === positionPositionData.parent_position_id &&
          pp.department_id === positionPositionData.department_id &&
          !pp.deleted
      );

      if (alreadyExists) {
        return res.status(409).json({
          status: 'error',
          message: 'Такая связь между должностями уже существует'
        });
      }

      console.log('Создаём связь position_position с данными:', JSON.stringify(positionPositionData));

      // Создаем связь
      const positionPosition = await storage.createPositionPosition(positionPositionData);
      console.log('Связь успешно создана:', JSON.stringify(positionPosition));

      res.status(201).json({ status: 'success', data: positionPosition });
    } catch (error) {
      console.error('Ошибка при создании связи position_position:', error);

      // Более информативное сообщение об ошибке
      let errorMessage = 'Ошибка сервера при создании связи position_position';
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
        console.error('Стек ошибки:', error.stack);
      }

      res.status(500).json({
        status: 'error',
        message: errorMessage
      });
    }
  });

  // Обновить связь position_position
  app.put('/api/positionpositions/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Некорректный ID связи'
        });
      }

      const positionPositionData = insertPositionPositionSchema.parse(req.body);

      // Проверяем, существует ли связь
      const existingPositionPosition = await storage.getPositionPosition(id);
      if (!existingPositionPosition) {
        return res.status(404).json({
          status: 'error',
          message: 'Связь position_position не найдена'
        });
      }

      // Обновляем связь
      const positionPosition = await storage.updatePositionPosition(id, positionPositionData);
      res.json({ status: 'success', data: positionPosition });
    } catch (error) {
      console.error('Ошибка при обновлении связи position_position:', error);
      res.status(500).json({
        status: 'error',
        message: 'Ошибка сервера при обновлении связи position_position'
      });
    }
  });

  // Удалить связь position_position
  app.delete('/api/positionpositions/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Некорректный ID связи'
        });
      }

      // Проверяем, существует ли связь
      const existingPositionPosition = await storage.getPositionPosition(id);
      if (!existingPositionPosition) {
        return res.status(404).json({
          status: 'error',
          message: 'Связь position_position не найдена'
        });
      }

      // Удаляем связь
      await storage.deletePositionPosition(id);
      res.json({ status: 'success', message: 'Связь удалена' });
    } catch (error) {
      console.error('Ошибка при удалении связи position_position:', error);
      res.status(500).json({
        status: 'error',
        message: 'Ошибка сервера при удалении связи position_position'
      });
    }
  });

  // CRUD для position_department

  // Получить все связи position_department
  app.get('/api/pd', async (_req: Request, res: Response) => {
    try {
      const positionDepartments = await storage.getAllPositionDepartments();
      res.json({ status: 'success', data: positionDepartments });
    } catch (error) {
      console.error('Ошибка при получении связей position_department:', error);
      res.status(500).json({
        status: 'error',
        message: 'Ошибка сервера при получении связей position_department'
      });
    }
  });

  // Получить связь position_department по ID
  app.get('/api/pd/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Некорректный ID связи'
        });
      }

      const positionDepartment = await storage.getPositionDepartment(id);
      if (!positionDepartment) {
        return res.status(404).json({
          status: 'error',
          message: 'Связь position_department не найдена'
        });
      }

      res.json({ status: 'success', data: positionDepartment });
    } catch (error) {
      console.error('Ошибка при получении связи position_department:', error);
      res.status(500).json({
        status: 'error',
        message: 'Ошибка сервера при получении связи position_department'
      });
    }
  });

  // Создать новую связь position_department
  app.post('/api/pd', async (req: Request, res: Response) => {
    try {
      // Проверяем наличие необходимых полей
      const { position_id, department_id, vacancies = 1, sort = 0 } = req.body;

      if (position_id === undefined) {
        return res.status(400).json({
          status: 'error',
          message: 'ID должности не указан'
        });
      }

      if (department_id === undefined) {
        return res.status(400).json({
          status: 'error',
          message: 'ID отдела не указан'
        });
      }

      // Проверка существования должности и отдела
      const position = await storage.getPosition(position_id);
      if (!position) {
        return res.status(404).json({
          status: 'error',
          message: 'Должность не найдена'
        });
      }

      const department = await storage.getDepartment(department_id);
      if (!department) {
        return res.status(404).json({
          status: 'error',
          message: 'Отдел не найден'
        });
      }

      // Создаем связь
      const positionDepartmentData = {
        position_id,
        department_id,
        vacancies: vacancies || 1, // По умолчанию 1 вакансия
        sort: sort || 0 // По умолчанию сортировка 0
      };
      const pd = await storage.createPositionDepartment({
        position_id,
        department_id,
        vacancies,
        sort
      });

      //const positionDepartment = await storage.createPositionDepartment(positionDepartmentData);
      res.status(201).json({ status: 'success', data: pd });
    } catch (error) {
      console.error('Ошибка при создании связи position_department:', error);
      res.status(500).json({
        status: 'error',
        message: 'Ошибка сервера при создании связи position_department'
      });
    }
  });

  // Обновить связь position_department
  app.put('/api/pd/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Некорректный ID связи'
        });
      }

      // Проверяем, существует ли связь
      const existingPositionDepartment = await storage.getPositionDepartment(id);
      if (!existingPositionDepartment) {
        return res.status(404).json({
          status: 'error',
          message: 'Связь position_department не найдена'
        });
      }

      // Получаем данные для обновления
      const { position_id, department_id, vacancies, sort } = req.body;

      // Создаем объект с данными для обновления
      const updateData: any = {};
      if (position_id !== undefined) updateData.position_id = position_id;
      if (department_id !== undefined) updateData.department_id = department_id;
      if (vacancies !== undefined) updateData.vacancies = vacancies;
      if (sort !== undefined) updateData.sort = sort;

      // Обновляем связь
      const positionDepartment = await storage.updatePositionDepartment(id, updateData);
      res.json({ status: 'success', data: positionDepartment });
    } catch (error) {
      console.error('Ошибка при обновлении связи position_department:', error);
      res.status(500).json({
        status: 'error',
        message: 'Ошибка сервера при обновлении связи position_department'
      });
    }
  });

  // Удалить связь position_department
  app.delete('/api/pd/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Некорректный ID связи'
        });
      }

      // Проверяем, существует ли связь
      const existingPositionDepartment = await storage.getPositionDepartment(id);
      if (!existingPositionDepartment) {
        return res.status(404).json({
          status: 'error',
          message: 'Связь position_department не найдена'
        });
      }

      // Удаляем связь
      await storage.deletePositionDepartment(id);
      res.json({ status: 'success', message: 'Связь удалена' });
    } catch (error) {
      console.error('Ошибка при удалении связи position_department:', error);
      res.status(500).json({
        status: 'error',
        message: 'Ошибка сервера при удалении связи position_department'
      });
    }
  });
}