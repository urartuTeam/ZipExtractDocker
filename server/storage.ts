import { 
  users, departments, positions, employees, projects, employeeprojects, leaves, position_department,
  type User, type InsertUser, 
  type Department, type InsertDepartment,
  type Position, type InsertPosition,
  type PositionDepartment, type InsertPositionDepartment,
  type Employee, type InsertEmployee,
  type Project, type InsertProject,
  type EmployeeProject, type InsertEmployeeProject,
  type Leave, type InsertLeave
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

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
  getPositionSubordinates(positionId: number): Promise<Position[]>;

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
    const [department] = await db.select().from(departments).where(eq(departments.department_id, id));
    return department || undefined;
  }

  async getAllDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
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
    const [deleted] = await db
      .delete(departments)
      .where(eq(departments.department_id, id))
      .returning({ id: departments.department_id });
    return !!deleted;
  }

  // Методы для работы с должностями
  async getPosition(id: number): Promise<Position | undefined> {
    const [position] = await db.select().from(positions).where(eq(positions.position_id, id));
    return position || undefined;
  }

  async getAllPositions(): Promise<Position[]> {
    return await db.select().from(positions);
  }

  async createPosition(insertPosition: InsertPosition): Promise<Position> {
    // Находим максимальный position_id в таблице
    const result = await db.execute(sql`SELECT MAX(position_id) as max_id FROM positions`);
    const maxId = result.rows[0]?.max_id || 0;
    const nextId = maxId + 1;
    
    // Вставляем с явно указанным position_id
    const [position] = await db
      .insert(positions)
      .values({
        ...insertPosition,
        position_id: nextId
      })
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
    const [deleted] = await db
      .delete(positions)
      .where(eq(positions.position_id, id))
      .returning({ id: positions.position_id });
    return !!deleted;
  }
  
  async getPositionSubordinates(positionId: number): Promise<Position[]> {
    return await db.select().from(positions).where(eq(positions.parent_position_id, positionId));
  }

  // Методы для работы со связью должностей и отделов
  async getPositionDepartment(id: number): Promise<PositionDepartment | undefined> {
    const [positionDepartment] = await db.select().from(position_department).where(eq(position_department.position_link_id, id));
    return positionDepartment || undefined;
  }

  async getAllPositionDepartments(): Promise<PositionDepartment[]> {
    return await db.select().from(position_department);
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
    const [deleted] = await db
      .delete(position_department)
      .where(eq(position_department.position_link_id, id))
      .returning({ id: position_department.position_link_id });
    return !!deleted;
  }

  // Методы для работы с сотрудниками
  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.employee_id, id));
    return employee || undefined;
  }

  async getAllEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
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
    const [deleted] = await db
      .delete(employees)
      .where(eq(employees.employee_id, id))
      .returning({ id: employees.employee_id });
    return !!deleted;
  }

  // Методы для работы с проектами
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.project_id, id));
    return project || undefined;
  }

  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects);
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
    const [deleted] = await db
      .delete(projects)
      .where(eq(projects.project_id, id))
      .returning({ id: projects.project_id });
    return !!deleted;
  }

  // Методы для работы со связью сотрудников и проектов
  async getEmployeeProject(employeeId: number, projectId: number): Promise<EmployeeProject | undefined> {
    const [employeeProject] = await db.select().from(employeeprojects).where(
      and(
        eq(employeeprojects.employee_id, employeeId),
        eq(employeeprojects.project_id, projectId)
      )
    );
    return employeeProject || undefined;
  }

  async getAllEmployeeProjects(): Promise<EmployeeProject[]> {
    return await db.select().from(employeeprojects);
  }

  async getEmployeeProjectsByEmployee(employeeId: number): Promise<EmployeeProject[]> {
    return await db.select().from(employeeprojects).where(eq(employeeprojects.employee_id, employeeId));
  }

  async getEmployeeProjectsByProject(projectId: number): Promise<EmployeeProject[]> {
    return await db.select().from(employeeprojects).where(eq(employeeprojects.project_id, projectId));
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
    const [deleted] = await db
      .delete(employeeprojects)
      .where(
        and(
          eq(employeeprojects.employee_id, employeeId),
          eq(employeeprojects.project_id, projectId)
        )
      )
      .returning();
    return !!deleted;
  }

  // Методы для работы с отпусками
  async getLeave(id: number): Promise<Leave | undefined> {
    const [leave] = await db.select().from(leaves).where(eq(leaves.leave_id, id));
    return leave || undefined;
  }

  async getAllLeaves(): Promise<Leave[]> {
    return await db.select().from(leaves);
  }

  async getLeavesByEmployee(employeeId: number): Promise<Leave[]> {
    return await db.select().from(leaves).where(eq(leaves.employee_id, employeeId));
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
    const [deleted] = await db
      .delete(leaves)
      .where(eq(leaves.leave_id, id))
      .returning({ id: leaves.leave_id });
    return !!deleted;
  }
}

export const storage = new DatabaseStorage();
