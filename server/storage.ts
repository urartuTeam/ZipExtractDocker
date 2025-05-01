import { 
  users, departments, positions, employees, projects, employeeprojects, leaves, position_department, position_position, settings,
  type User, type InsertUser, 
  type Department, type InsertDepartment,
  type Position, type InsertPosition,
  type PositionDepartment, type InsertPositionDepartment,
  type PositionPosition, type InsertPositionPosition,
  type Employee, type InsertEmployee,
  type Project, type InsertProject,
  type EmployeeProject, type InsertEmployeeProject,
  type Leave, type InsertLeave,
  type Setting, type InsertSetting
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or } from "drizzle-orm";

export interface IStorage {
  // Пользователи
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Отделы
  getDepartment(id: number): Promise<Department | undefined>;
  getAllDepartments(): Promise<Department[]>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, department: Partial<InsertDepartment>): Promise<Department | undefined>;
  deleteDepartment(id: number): Promise<boolean>;

  // Должности
  getPosition(id: number): Promise<Position | undefined>;
  getAllPositions(): Promise<Position[]>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(id: number, position: Partial<InsertPosition>): Promise<Position | undefined>;
  deletePosition(id: number): Promise<boolean>;
  
  // Иерархия должностей
  getPositionPosition(id: number): Promise<PositionPosition | undefined>;
  getPositionPositionsByPosition(positionId: number): Promise<PositionPosition[]>;
  getPositionPositionsByParent(parentPositionId: number): Promise<PositionPosition[]>;
  getPositionPositionsByDepartment(departmentId: number): Promise<PositionPosition[]>;
  getAllPositionPositions(): Promise<PositionPosition[]>;
  createPositionPosition(positionPosition: InsertPositionPosition): Promise<PositionPosition>;
  updatePositionPosition(id: number, positionPosition: Partial<InsertPositionPosition>): Promise<PositionPosition | undefined>;
  deletePositionPosition(id: number): Promise<boolean>;

  // Связь должностей и отделов
  getPositionDepartment(id: number): Promise<PositionDepartment | undefined>;
  getAllPositionDepartments(): Promise<PositionDepartment[]>;
  createPositionDepartment(positionDepartment: InsertPositionDepartment): Promise<PositionDepartment>;
  updatePositionDepartment(id: number, positionDepartment: Partial<InsertPositionDepartment>): Promise<PositionDepartment | undefined>;
  deletePositionDepartment(id: number): Promise<boolean>;

  // Сотрудники
  getEmployee(id: number): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;

  // Проекты
  getProject(id: number): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Связь сотрудников и проектов
  getEmployeeProject(employeeId: number, projectId: number): Promise<EmployeeProject | undefined>;
  getAllEmployeeProjects(): Promise<EmployeeProject[]>;
  getEmployeeProjectsByEmployee(employeeId: number): Promise<EmployeeProject[]>;
  getEmployeeProjectsByProject(projectId: number): Promise<EmployeeProject[]>;
  createEmployeeProject(employeeProject: InsertEmployeeProject): Promise<EmployeeProject>;
  updateEmployeeProject(employeeId: number, projectId: number, employeeProject: Partial<InsertEmployeeProject>): Promise<EmployeeProject | undefined>;
  deleteEmployeeProject(employeeId: number, projectId: number): Promise<boolean>;

  // Отпуска
  getLeave(id: number): Promise<Leave | undefined>;
  getAllLeaves(): Promise<Leave[]>;
  getLeavesByEmployee(employeeId: number): Promise<Leave[]>;
  createLeave(leave: InsertLeave): Promise<Leave>;
  updateLeave(id: number, leave: Partial<InsertLeave>): Promise<Leave | undefined>;
  deleteLeave(id: number): Promise<boolean>;
  
  // Настройки
  getSetting(key: string): Promise<Setting | undefined>;
  getAllSettings(): Promise<Setting[]>;
  createOrUpdateSetting(key: string, value: string): Promise<Setting>;
}

export class DatabaseStorage implements IStorage {
  // Методы для работы с пользователями
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });
    return !!deleted;
  }

  // Методы для работы с отделами
  async getDepartment(id: number): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(
      and(
        eq(departments.department_id, id),
        eq(departments.deleted, false)
      )
    );
    return department || undefined;
  }

  async getAllDepartments(): Promise<Department[]> {
    return await db.select().from(departments).where(eq(departments.deleted, false)).orderBy(departments.department_id);
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const [department] = await db
      .insert(departments)
      .values(insertDepartment)
      .returning();
    return department;
  }

  async updateDepartment(id: number, departmentData: Partial<InsertDepartment>): Promise<Department | undefined> {
    const [department] = await db
      .update(departments)
      .set(departmentData)
      .where(eq(departments.department_id, id))
      .returning();
    return department || undefined;
  }

  async deleteDepartment(id: number): Promise<boolean> {
    const [updated] = await db
      .update(departments)
      .set({ 
        deleted: true, 
        deleted_at: new Date() 
      })
      .where(eq(departments.department_id, id))
      .returning({ id: departments.department_id });
    return !!updated;
  }

  // Методы для работы с должностями
  async getPosition(id: number): Promise<Position | undefined> {
    const [position] = await db.select().from(positions).where(
      and(
        eq(positions.position_id, id),
        eq(positions.deleted, false)
      )
    );
    return position || undefined;
  }

  async getAllPositions(): Promise<Position[]> {
    return await db.select().from(positions).where(eq(positions.deleted, false));
  }

  async createPosition(insertPosition: InsertPosition): Promise<Position> {
    const [position] = await db
      .insert(positions)
      .values(insertPosition)
      .returning();
    return position;
  }

  async updatePosition(id: number, positionData: Partial<InsertPosition>): Promise<Position | undefined> {
    const [position] = await db
      .update(positions)
      .set(positionData)
      .where(eq(positions.position_id, id))
      .returning();
    return position || undefined;
  }

  async deletePosition(id: number): Promise<boolean> {
    const [updated] = await db
      .update(positions)
      .set({ 
        deleted: true, 
        deleted_at: new Date() 
      })
      .where(eq(positions.position_id, id))
      .returning({ id: positions.position_id });
    return !!updated;
  }
  
  // Методы для работы с иерархией должностей
  async getPositionPosition(id: number): Promise<PositionPosition | undefined> {
    const [positionPosition] = await db.select().from(position_position).where(
      and(
        eq(position_position.position_relation_id, id),
        eq(position_position.deleted, false)
      )
    );
    return positionPosition || undefined;
  }

  async getPositionPositionsByPosition(positionId: number): Promise<PositionPosition[]> {
    return await db.select().from(position_position).where(
      and(
        eq(position_position.position_id, positionId),
        eq(position_position.deleted, false)
      )
    );
  }

  async getPositionPositionsByParent(parentPositionId: number): Promise<PositionPosition[]> {
    return await db.select().from(position_position).where(
      and(
        eq(position_position.parent_position_id, parentPositionId),
        eq(position_position.deleted, false)
      )
    );
  }

  async getPositionPositionsByDepartment(departmentId: number): Promise<PositionPosition[]> {
    return await db.select().from(position_position).where(
      and(
        eq(position_position.department_id, departmentId),
        eq(position_position.deleted, false)
      )
    );
  }

  async getAllPositionPositions(): Promise<PositionPosition[]> {
    return await db.select().from(position_position).where(eq(position_position.deleted, false));
  }

  async createPositionPosition(insertPositionPosition: InsertPositionPosition): Promise<PositionPosition> {
    const [positionPosition] = await db
      .insert(position_position)
      .values(insertPositionPosition)
      .returning();
    return positionPosition;
  }

  async updatePositionPosition(id: number, positionPositionData: Partial<InsertPositionPosition>): Promise<PositionPosition | undefined> {
    const [positionPosition] = await db
      .update(position_position)
      .set(positionPositionData)
      .where(eq(position_position.position_relation_id, id))
      .returning();
    return positionPosition || undefined;
  }

  async deletePositionPosition(id: number): Promise<boolean> {
    // Физически удаляем запись вместо установки флага deleted
    const [deleted] = await db
      .delete(position_position)
      .where(eq(position_position.position_relation_id, id))
      .returning({ id: position_position.position_relation_id });
    return !!deleted;
  }
  
  // Совместимость с предыдущими версиями - теперь используется position_position
  async getPositionSubordinates(positionId: number): Promise<Position[]> {
    // Получаем все записи связей position_position, где текущая должность - родительская
    const positionPositions = await this.getPositionPositionsByParent(positionId);
    
    // Извлекаем ID подчиненных должностей
    const subordinateIds = positionPositions.map(pp => pp.position_id);
    
    // Если нет подчиненных, возвращаем пустой массив
    if (subordinateIds.length === 0) {
      return [];
    }
    
    // Пустой placeholder, так как мы уже не используем условия
    
    // Простой подход - если только один ID, используем eq
    // Для нескольких ID - фильтруем в JavaScript
    let subordinatePositions: Position[] = [];
    
    if (subordinateIds.length === 1) {
      // Для одного ID используем простой запрос
      subordinatePositions = await db.select()
        .from(positions)
        .where(
          and(
            eq(positions.position_id, subordinateIds[0]),
            eq(positions.deleted, false)
          )
        );
    } else {
      // Для многих ID - сначала получаем все неудаленные должности, потом фильтруем
      const allPositions = await db.select()
        .from(positions)
        .where(eq(positions.deleted, false));
      
      // Фильтруем в памяти
      subordinatePositions = allPositions.filter(pos => 
        subordinateIds.includes(pos.position_id)
      );
    }
    
    return subordinatePositions;
  }

  // Методы для работы со связью должностей и отделов
  async getPositionDepartment(id: number): Promise<PositionDepartment | undefined> {
    const [positionDepartment] = await db.select().from(position_department).where(
      and(
        eq(position_department.position_link_id, id),
        eq(position_department.deleted, false)
      )
    );
    return positionDepartment || undefined;
  }

  async getAllPositionDepartments(): Promise<PositionDepartment[]> {
    return await db.select().from(position_department).where(eq(position_department.deleted, false));
  }

  async createPositionDepartment(insertPositionDepartment: InsertPositionDepartment): Promise<PositionDepartment> {
    const [positionDepartment] = await db
      .insert(position_department)
      .values(insertPositionDepartment)
      .returning();
    return positionDepartment;
  }

  async updatePositionDepartment(id: number, positionDepartmentData: Partial<InsertPositionDepartment>): Promise<PositionDepartment | undefined> {
    const [positionDepartment] = await db
      .update(position_department)
      .set(positionDepartmentData)
      .where(eq(position_department.position_link_id, id))
      .returning();
    return positionDepartment || undefined;
  }

  async deletePositionDepartment(id: number): Promise<boolean> {
    // Полностью удаляем запись, вместо установки флага deleted
    const [deleted] = await db
      .delete(position_department)
      .where(eq(position_department.position_link_id, id))
      .returning({ id: position_department.position_link_id });
    return !!deleted;
  }

  // Методы для работы с сотрудниками
  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(
      and(
        eq(employees.employee_id, id),
        eq(employees.deleted, false)
      )
    );
    return employee || undefined;
  }

  async getAllEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).where(eq(employees.deleted, false));
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const [employee] = await db
      .insert(employees)
      .values(insertEmployee)
      .returning();
    return employee;
  }

  async updateEmployee(id: number, employeeData: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [employee] = await db
      .update(employees)
      .set(employeeData)
      .where(eq(employees.employee_id, id))
      .returning();
    return employee || undefined;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const [updated] = await db
      .update(employees)
      .set({ 
        deleted: true, 
        deleted_at: new Date() 
      })
      .where(eq(employees.employee_id, id))
      .returning({ id: employees.employee_id });
    return !!updated;
  }

  // Методы для работы с проектами
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(
      and(
        eq(projects.project_id, id),
        eq(projects.deleted, false)
      )
    );
    return project || undefined;
  }

  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.deleted, false));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set(projectData)
      .where(eq(projects.project_id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    const [updated] = await db
      .update(projects)
      .set({ 
        deleted: true, 
        deleted_at: new Date() 
      })
      .where(eq(projects.project_id, id))
      .returning({ id: projects.project_id });
    return !!updated;
  }

  // Методы для работы со связью сотрудников и проектов
  async getEmployeeProject(employeeId: number, projectId: number): Promise<EmployeeProject | undefined> {
    const [employeeProject] = await db.select().from(employeeprojects).where(
      and(
        eq(employeeprojects.employee_id, employeeId),
        eq(employeeprojects.project_id, projectId),
        eq(employeeprojects.deleted, false)
      )
    );
    return employeeProject || undefined;
  }

  async getAllEmployeeProjects(): Promise<EmployeeProject[]> {
    return await db.select().from(employeeprojects).where(eq(employeeprojects.deleted, false));
  }

  async getEmployeeProjectsByEmployee(employeeId: number): Promise<EmployeeProject[]> {
    return await db.select().from(employeeprojects).where(
      and(
        eq(employeeprojects.employee_id, employeeId),
        eq(employeeprojects.deleted, false)
      )
    );
  }

  async getEmployeeProjectsByProject(projectId: number): Promise<EmployeeProject[]> {
    return await db.select().from(employeeprojects).where(
      and(
        eq(employeeprojects.project_id, projectId),
        eq(employeeprojects.deleted, false)
      )
    );
  }

  async createEmployeeProject(insertEmployeeProject: InsertEmployeeProject): Promise<EmployeeProject> {
    const [employeeProject] = await db
      .insert(employeeprojects)
      .values(insertEmployeeProject)
      .returning();
    return employeeProject;
  }

  async updateEmployeeProject(employeeId: number, projectId: number, employeeProjectData: Partial<InsertEmployeeProject>): Promise<EmployeeProject | undefined> {
    const [employeeProject] = await db
      .update(employeeprojects)
      .set(employeeProjectData)
      .where(
        and(
          eq(employeeprojects.employee_id, employeeId),
          eq(employeeprojects.project_id, projectId)
        )
      )
      .returning();
    return employeeProject || undefined;
  }

  async deleteEmployeeProject(employeeId: number, projectId: number): Promise<boolean> {
    // Для таблицы связи нужно добавить колонки deleted и deleted_at в БД
    const [updated] = await db
      .update(employeeprojects)
      .set({ 
        deleted: true, 
        deleted_at: new Date() 
      })
      .where(
        and(
          eq(employeeprojects.employee_id, employeeId),
          eq(employeeprojects.project_id, projectId)
        )
      )
      .returning();
    return !!updated;
  }

  // Методы для работы с отпусками
  async getLeave(id: number): Promise<Leave | undefined> {
    const [leave] = await db.select().from(leaves).where(
      and(
        eq(leaves.leave_id, id),
        eq(leaves.deleted, false)
      )
    );
    return leave || undefined;
  }

  async getAllLeaves(): Promise<Leave[]> {
    return await db.select().from(leaves).where(eq(leaves.deleted, false));
  }

  async getLeavesByEmployee(employeeId: number): Promise<Leave[]> {
    return await db.select().from(leaves).where(
      and(
        eq(leaves.employee_id, employeeId),
        eq(leaves.deleted, false)
      )
    );
  }

  async createLeave(insertLeave: InsertLeave): Promise<Leave> {
    const [leave] = await db
      .insert(leaves)
      .values(insertLeave)
      .returning();
    return leave;
  }

  async updateLeave(id: number, leaveData: Partial<InsertLeave>): Promise<Leave | undefined> {
    const [leave] = await db
      .update(leaves)
      .set(leaveData)
      .where(eq(leaves.leave_id, id))
      .returning();
    return leave || undefined;
  }

  async deleteLeave(id: number): Promise<boolean> {
    const [updated] = await db
      .update(leaves)
      .set({ 
        deleted: true, 
        deleted_at: new Date() 
      })
      .where(eq(leaves.leave_id, id))
      .returning({ id: leaves.leave_id });
    return !!updated;
  }
  
  // Методы для работы с настройками
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.data_key, key));
    return setting || undefined;
  }
  
  async getAllSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }
  
  async createOrUpdateSetting(key: string, value: string): Promise<Setting> {
    // Проверяем, существует ли запись
    const existingSetting = await this.getSetting(key);
    
    if (existingSetting) {
      // Если существует, обновляем
      const [updated] = await db
        .update(settings)
        .set({ 
          data_value: value,
          updated_at: new Date()
        })
        .where(eq(settings.data_key, key))
        .returning();
      return updated;
    } else {
      // Если нет, создаем новую
      const [setting] = await db
        .insert(settings)
        .values({ 
          data_key: key, 
          data_value: value 
        })
        .returning();
      return setting;
    }
  }
}

export const storage = new DatabaseStorage();
