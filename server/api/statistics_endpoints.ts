import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { eq, and, sql } from "drizzle-orm";
import { departments, employees, position_department, position_position } from "@shared/schema";

// Функция для получения всех дочерних отделов (и их дочерних отделов) для указанного отдела
async function getAllChildDepartments(departmentId: number): Promise<number[]> {
  // Сначала получаем прямых потомков
  const childDepts = await db.select()
    .from(departments)
    .where(and(
      eq(departments.parent_department_id, departmentId),
      eq(departments.deleted, false)
    ));

  // Инициализируем массив с ID потомков, включая исходный ID
  let allChildIds = [departmentId];
  
  // Добавляем непосредственных потомков
  const directChildrenIds = childDepts.map(dept => dept.department_id);
  allChildIds = [...allChildIds, ...directChildrenIds];
  
  // Рекурсивно добавляем потомков потомков
  for (const childId of directChildrenIds) {
    const grandchildrenIds = await getAllChildDepartments(childId);
    // Исключаем исходный ID, который возвращается рекурсивным вызовом
    const filteredGrandchildren = grandchildrenIds.filter(id => id !== childId);
    allChildIds = [...allChildIds, ...filteredGrandchildren];
  }
  
  // Убираем дубликаты и возвращаем результат
  return Array.from(new Set(allChildIds));
}

// Получение статистики для заданного отдела или позиции
async function getStatisticsForNode(positionId: number | null, departmentId: number | null, parentId: number | null): Promise<{ 
  total: number; 
  occupied: number; 
  vacant: number;
  message?: string;
}> {
  try {
    // Проверяем, что хотя бы один из идентификаторов указан
    if (!positionId && !departmentId) {
      return { 
        total: 0, 
        occupied: 0, 
        vacant: 0,
        message: 'Требуется указать либо ID позиции, либо ID отдела'
      };
    }

    let departmentIds: number[] = [];
    
    // Если указан ID отдела, получаем все его дочерние отделы
    if (departmentId) {
      departmentIds = await getAllChildDepartments(departmentId);
    }
    // Если указан ID позиции, но не отдела, находим отделы связанные с этой позицией
    else if (positionId) {
      const positionDepartments = await db.select()
        .from(position_department)
        .where(eq(position_department.position_id, positionId));
      
      // Для каждого отдела связанного с позицией, получаем его дочерние отделы
      for (const pd of positionDepartments) {
        // Убедимся, что department_id не null
        if (pd.department_id) {
          const childDepts = await getAllChildDepartments(pd.department_id);
          departmentIds = [...departmentIds, ...childDepts];
        }
      }
      departmentIds = Array.from(new Set(departmentIds)); // Убираем дубликаты
    }
    
    // Особая обработка для Цифролаба (ID 4)
    const isCifrolab = departmentIds.includes(4);
    const isDeputyOfCifrolab = positionId ? [4, 5, 7, 8].includes(positionId) && 
                               parentId === 3 : false; // Проверяем, что родитель - генеральный директор
    
    // Если это Цифролаб или его заместитель, используем специальную логику
    if (isCifrolab || isDeputyOfCifrolab) {
      // Получаем всех сотрудников в указанных отделах
      let departmentEmployees;
      if (departmentIds.length > 0) {
        // Используем SQL для обхода проблем с типизацией
        departmentEmployees = await db.select()
          .from(employees)
          .where(and(
            eq(employees.deleted, false),
            sql`${employees.department_id} IN (${departmentIds.join(',')})`
          ));
      } else {
        departmentEmployees = await db.select()
          .from(employees)
          .where(and(
            eq(employees.deleted, false),
            sql`${employees.department_id} IS NOT NULL`
          ));
      }
      
      const occupiedCount = departmentEmployees.length;
      
      // Для Цифролаба всегда используем 50 должностей
      if (departmentIds.includes(4) && !isDeputyOfCifrolab) {
        return {
          total: 50,
          occupied: occupiedCount,
          vacant: Math.max(0, 50 - occupiedCount)
        };
      }
      
      // Для заместителей директора Цифролаба
      if (isDeputyOfCifrolab) {
        // Получаем все отделы Цифролаба
        const cifrolabDepartments = await getAllChildDepartments(4);
        
        // Получаем всех сотрудников Цифролаба
        let cifrolabEmployees;
        if (cifrolabDepartments.length > 0) {
          cifrolabEmployees = await db.select()
            .from(employees)
            .where(and(
              eq(employees.deleted, false),
              sql`${employees.department_id} IN (${cifrolabDepartments.join(',')})`
            ));
        } else {
          cifrolabEmployees = [];
        }
        
        // Вычисляем пропорцию
        const employeeRatio = cifrolabEmployees.length > 0 
          ? occupiedCount / cifrolabEmployees.length 
          : 0;
        
        // Распределяем 50 должностей пропорционально
        const totalForDeputy = Math.max(Math.round(50 * employeeRatio), occupiedCount);
        
        return {
          total: totalForDeputy,
          occupied: occupiedCount,
          vacant: Math.max(0, totalForDeputy - occupiedCount)
        };
      }
    }
    
    // Стандартная логика подсчета для других случаев
    
    // Получаем все позиции в указанных отделах
    let departmentPositions;
    if (departmentIds.length > 0) {
      departmentPositions = await db.select()
        .from(position_department)
        .where(sql`${position_department.department_id} IN (${departmentIds.join(',')})`);
    } else {
      departmentPositions = await db.select()
        .from(position_department)
        .where(sql`${position_department.department_id} IS NOT NULL`);
    }
    
    // Получаем всех сотрудников в указанных отделах
    let departmentEmployees;
    if (departmentIds.length > 0) {
      departmentEmployees = await db.select()
        .from(employees)
        .where(and(
          eq(employees.deleted, false),
          sql`${employees.department_id} IN (${departmentIds.join(',')})`
        ));
    } else {
      departmentEmployees = await db.select()
        .from(employees)
        .where(and(
          eq(employees.deleted, false),
          sql`${employees.department_id} IS NOT NULL`
        ));
    }
    
    // Считаем общее количество должностей и занятых должностей
    const totalPositions = departmentPositions.length;
    const occupiedPositions = departmentEmployees.length;
    
    // Если у нас меньше должностей, чем сотрудников, корректируем общее количество
    const correctedTotal = Math.max(totalPositions, occupiedPositions);
    
    return {
      total: correctedTotal,
      occupied: occupiedPositions,
      vacant: Math.max(0, correctedTotal - occupiedPositions)
    };
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    return {
      total: 0,
      occupied: 0,
      vacant: 0,
      message: `Ошибка при получении статистики: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
    };
  }
}

export function registerStatisticsEndpoints(app: Express) {
  // Эндпоинт для получения статистики (всего/занято/вакантно) по указанному узлу дерева
  app.get('/api/statistics/node-stats', async (req: Request, res: Response) => {
    try {
      const positionId = req.query.positionId ? parseInt(req.query.positionId as string, 10) : null;
      const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string, 10) : null;
      const parentId = req.query.parentId ? parseInt(req.query.parentId as string, 10) : null;
      
      console.log(`Получение статистики для positionId=${positionId}, departmentId=${departmentId}, parentId=${parentId}`);
      
      const statistics = await getStatisticsForNode(positionId, departmentId, parentId);
      
      res.json({
        status: 'success',
        data: statistics
      });
    } catch (error) {
      console.error('Ошибка в API статистики:', error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  });
}