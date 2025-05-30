import {
  users,
  departments,
  positions,
  employees,
  projects,
  employeeprojects,
  leaves,
  position_department,
  position_position,
  settings,
  sort_tree,
  project_roles,
  org_units,
  employee_org_assignments,
  type OrgUnit,
  type InsertOrgUnit,
  type EmployeeOrgAssignment,
  type InsertEmployeeOrgAssignment, 
  type User,
  type InsertUser,
  type Department,
  type InsertDepartment,
  type Position,
  type InsertPosition,
  type PositionDepartment,
  type InsertPositionDepartment,
  type PositionPosition,
  type InsertPositionPosition,
  type Employee,
  type InsertEmployee,
  type Project,
  type InsertProject,
  type EmployeeProject,
  type InsertEmployeeProject,
  type Leave,
  type InsertLeave,
  type Setting,
  type InsertSetting,
  type SortTree,
  type InsertSortTree,
  type ProjectRole,
  type InsertProjectRole,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, inArray } from "drizzle-orm";

export interface IStorage {
  // Org Units
  getOrgUnits(): Promise<OrgUnit[]>;
  getOrgUnit(id: number): Promise<OrgUnit | undefined>;
  createOrgUnit(unit: InsertOrgUnit): Promise<OrgUnit>;
  updateOrgUnit(id: number, unit: Partial<OrgUnit>): Promise<OrgUnit | undefined>;
  deleteOrgUnit(id: number): Promise<boolean>;
  
  // Employee Org Assignments
  getEmployeeOrgAssignments(): Promise<EmployeeOrgAssignment[]>;
  createEmployeeOrgAssignment(assignment: InsertEmployeeOrgAssignment): Promise<EmployeeOrgAssignment>;

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
  updateDepartment(
      id: number,
      department: Partial<InsertDepartment>,
  ): Promise<Department | undefined>;
  deleteDepartment(id: number): Promise<boolean>;

  // Организации (отделы, помеченные как организации)
  getAllOrganizations(): Promise<Department[]>;
  setOrganizationStatus(
      departmentId: number,
      isOrganization: boolean,
  ): Promise<Department | undefined>;

  // Сортировка элементов иерархии
  getSortTree(): Promise<SortTree[]>;
  getSortTreeItem(
      type: string,
      type_id: number,
      parent_id: number | null,
  ): Promise<SortTree | undefined>;
  createSortTreeItem(item: InsertSortTree): Promise<SortTree>;
  updateSortTreeItem(
      id: number,
      item: Partial<InsertSortTree>,
  ): Promise<SortTree | undefined>;
  deleteSortTreeItem(id: number): Promise<boolean>;

  // Должности
  getPosition(id: number): Promise<Position | undefined>;
  getAllPositions(): Promise<Position[]>;
  getPositionCategories(): Promise<Position[]>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(
      id: number,
      position: Partial<InsertPosition>,
  ): Promise<Position | undefined>;
  deletePosition(id: number): Promise<boolean>;

  // Иерархия должностей
  getPositionPosition(id: number): Promise<PositionPosition | undefined>;
  getPositionPositionsByPosition(
      positionId: number,
  ): Promise<PositionPosition[]>;
  getPositionPositionsByParent(
      parentPositionId: number,
  ): Promise<PositionPosition[]>;
  getPositionPositionsByDepartment(
      departmentId: number,
  ): Promise<PositionPosition[]>;
  getAllPositionPositions(): Promise<PositionPosition[]>;
  createPositionPosition(
      positionPosition: InsertPositionPosition,
  ): Promise<PositionPosition>;
  updatePositionPosition(
      id: number,
      positionPosition: Partial<InsertPositionPosition>,
  ): Promise<PositionPosition | undefined>;
  deletePositionPosition(id: number): Promise<boolean>;

  // Связь должностей и отделов
  getPositionDepartment(id: number): Promise<PositionDepartment | undefined>;
  getAllPositionDepartments(): Promise<PositionDepartment[]>;
  createPositionDepartment(
      positionDepartment: InsertPositionDepartment,
  ): Promise<PositionDepartment>;
  updatePositionDepartment(
      id: number,
      positionDepartment: Partial<InsertPositionDepartment>,
  ): Promise<PositionDepartment | undefined>;
  deletePositionDepartment(id: number): Promise<boolean>;

  // Сотрудники
  getEmployee(id: number): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(
      id: number,
      employee: Partial<InsertEmployee>,
  ): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;

  // Проекты
  getProject(id: number): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(
      id: number,
      project: Partial<InsertProject>,
  ): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Роли
  getProjectsRoles(): Promise<Role[]>;
  createProjectsRole(role: InsertRole): Promise<Role>;

  // Связь сотрудников и проектов
  getEmployeeProject(
      employeeId: number,
      projectId: number,
  ): Promise<EmployeeProject | undefined>;
  getAllEmployeeProjects(): Promise<EmployeeProject[]>;
  getEmployeeProjectsByEmployee(employeeId: number): Promise<EmployeeProject[]>;
  getEmployeeProjectsByProject(projectId: number): Promise<EmployeeProject[]>;
  createEmployeeProject(
      employeeProject: InsertEmployeeProject,
  ): Promise<EmployeeProject>;
  updateEmployeeProject(
      employeeId: number,
      projectId: number,
      employeeProject: Partial<InsertEmployeeProject>,
  ): Promise<EmployeeProject | undefined>;
  deleteEmployeeProject(
      employeeId: number,
      projectId: number,
  ): Promise<boolean>;

  // Отпуска
  getLeave(id: number): Promise<Leave | undefined>;
  getAllLeaves(): Promise<Leave[]>;
  getLeavesByEmployee(employeeId: number): Promise<Leave[]>;
  createLeave(leave: InsertLeave): Promise<Leave>;
  updateLeave(
      id: number,
      leave: Partial<InsertLeave>,
  ): Promise<Leave | undefined>;
  deleteLeave(id: number): Promise<boolean>;

  // Настройки
  getSetting(key: string): Promise<Setting | undefined>;
  getAllSettings(): Promise<Setting[]>;
  createOrUpdateSetting(key: string, value: string): Promise<Setting>;

  // Роли проектов
  getAllProjectRoles(): Promise<ProjectRole[]>;
  getProjectRole(id: number): Promise<ProjectRole | undefined>;
  createProjectRole(insertRole: InsertProjectRole): Promise<ProjectRole>;
  updateProjectRole(
      id: number,
      roleData: Partial<InsertProjectRole>,
  ): Promise<ProjectRole | undefined>;
  deleteProjectRole(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Org Units (временная заглушка)
  async getOrgUnits(): Promise<OrgUnit[]> {
    return [];
  }

  async getOrgUnit(id: number): Promise<OrgUnit | undefined> {
    return undefined;
  }

  async createOrgUnit(unit: InsertOrgUnit): Promise<OrgUnit> {
    // Временная заглушка
    return {
      id: 1,
      type: unit.type,
      type_id: unit.type_id,
      parent_id: unit.parent_id || null,
      staff_count: unit.staff_count || 1,
      head_employee_id: unit.head_employee_id || null,
      head_position_id: unit.head_position_id || null,
      position_x: unit.position_x || 0,
      position_y: unit.position_y || 0,
      created_at: new Date(),
    };
  }

  async updateOrgUnit(id: number, unit: Partial<OrgUnit>): Promise<OrgUnit | undefined> {
    return undefined;
  }

  async deleteOrgUnit(id: number): Promise<boolean> {
    return false;
  }

  async getEmployeeOrgAssignments(): Promise<EmployeeOrgAssignment[]> {
    return [];
  }

  async createEmployeeOrgAssignment(assignment: InsertEmployeeOrgAssignment): Promise<EmployeeOrgAssignment> {
    // Временная заглушка
    return {
      id: 1,
      employee_id: assignment.employee_id,
      org_unit_id: assignment.org_unit_id,
      position_id: assignment.position_id || null,
      is_head: assignment.is_head || false,
      assigned_at: new Date(),
    };
  }

      async getOrgUnit(
        id: number,
      ): Promise<(OrgUnit & { typeName: string }) | undefined> {
        const [unit] = await db.select().from(orgUnits).where(eq(orgUnits.id, id));
        if (!unit) return undefined;

        const name = await this.getOrgUnitName(unit.type, unit.typeId);

        return {
          ...unit,
          name,
        };
      }

      async getRootOrgUnits(): Promise<(OrgUnit & { typeName: string })[]> {
        const units = await db
          .select()
          .from(orgUnits)
          .where(isNull(orgUnits.parentId));

        return await Promise.all(
          units.map(async (unit) => ({
            ...unit,
            typeName: await this.getOrgUnitName(unit.type, unit.typeId),
          })),
        );
      }

      async getChildOrgUnits(parentId: number): Promise<OrgUnit[]> {
        return await db
          .select()
          .from(orgUnits)
          .where(eq(orgUnits.parentId, parentId));
      }

      async createOrgUnit(unit: InsertOrgUnit): Promise<OrgUnit> {
        const [newUnit] = await db
          .insert(orgUnits)
          .values({
            ...unit,
            isOrganization: unit.type === "organization",
            isManagement: unit.type === "management",
            isDepartment: unit.type === "department",
            isPosition: unit.type === "position",
          })
          .returning();
        return newUnit;
      }

      async updateOrgUnit(
        id: number,
        unit: Partial<OrgUnit>,
      ): Promise<OrgUnit | undefined> {
        const [updatedUnit] = await db
          .update(orgUnits)
          .set(unit)
          .where(eq(orgUnits.id, id))
          .returning();
        return updatedUnit;
      }

      async deleteOrgUnit(id: number): Promise<boolean> {
        const result = await db.delete(orgUnits).where(eq(orgUnits.id, id));
        return true;
      }


      async getOrgUnitName(type: string, typeId: number): Promise<string> {
        switch (type) {
          case "position": {
            const [position] = await db
              .select()
              .from(positions)
              .where(eq(positions.id, typeId))
              .execute();
            return position?.name || "";
          }
          case "department":
          case "management": {
            const [department] = await db
              .select()
              .from(departments)
              .where(eq(departments.id, typeId))
              .execute();
            return department?.name || "";
          }
          case "organization": {
            const [organization] = await db
              .select()
              .from(organizations)
              .where(eq(organizations.id, typeId))
              .execute();
            return organization?.name || "";
          }
          default:
            return "";
        }
      }

    // Employee Positions methods
      async getEmployeePositions(orgUnitId: number): Promise<EmployeePosition[]> {
        return await db
          .select()
          .from(employeePositions)
          .where(eq(employeePositions.orgUnitId, orgUnitId));
      }

      async getEmployeesByOrgUnit(orgUnitId: number): Promise<Employee[]> {
        const result = await db
          .select({
            id: employees.id,
            firstName: employees.firstName,
            lastName: employees.lastName,
            middleName: employees.middleName,
            email: employees.email,
            phone: employees.phone,
            positionId: employees.positionId,
            departmentId: employees.departmentId,
            managerId: employees.managerId,
            createdAt: employees.createdAt,
            isHead: employeePositions.isHead,
          })
          .from(employees)
          .innerJoin(employeePositions, eq(employees.id, employeePositions.employeeId))
          .where(eq(employeePositions.orgUnitId, orgUnitId));

        return result.map(emp => ({
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          middleName: emp.middleName,
          email: emp.email,
          phone: emp.phone,
          positionId: emp.positionId,
          departmentId: emp.departmentId,
          managerId: emp.managerId,
          createdAt: emp.createdAt,
        }));
      }

      async assignEmployeeToOrgUnit(assignment: InsertEmployeePosition): Promise<EmployeePosition> {
        const [result] = await db
          .insert(employeePositions)
          .values(assignment)
          .returning();
        return result;
      }

      async removeEmployeeFromOrgUnit(employeeId: number, orgUnitId: number): Promise<boolean> {
        const result = await db
          .delete(employeePositions)
          .where(
            and(
              eq(employeePositions.employeeId, employeeId),
              eq(employeePositions.orgUnitId, orgUnitId)
            )
          );
        return result.rowCount > 0;
      }

    
    
    // Методы для работы с пользователями
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(
      id: number,
      userData: Partial<InsertUser>,
  ): Promise<User | undefined> {
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
    const [department] = await db
        .select()
        .from(departments)
        .where(
            and(eq(departments.department_id, id), eq(departments.deleted, false)),
        );
    return department || undefined;
  }

  async getAllDepartments(): Promise<any[]> {
    const results = await db
        .select({
          department_id: departments.department_id,
          name: departments.name,
          parent_department_id: departments.parent_department_id,
          parent_position_id: departments.parent_position_id,
          leadership_position_id: departments.leadership_position_id,
          manager_id: departments.manager_id,
          is_organization: departments.is_organization,
          logo_path: departments.logo_path,
          sort: departments.sort,
          deleted: departments.deleted,
          deleted_at: departments.deleted_at,
          leadership_position_name: positions.name,
          manager_name: employees.full_name,
          manager_photo: employees.photo_url,
        })
        .from(departments)
        .leftJoin(positions, eq(departments.leadership_position_id, positions.position_id))
        .leftJoin(employees, eq(departments.manager_id, employees.employee_id))
        .where(eq(departments.deleted, false));

    // Sort by sort field first, then by department_id
    return results.sort((a, b) => {
      const aSort = a.sort ?? 0;
      const bSort = b.sort ?? 0;

      // If sort values are different, sort by sort
      if (aSort !== bSort) {
        return aSort - bSort;
      }
      // If sort values are the same, sort by department_id
      return a.department_id - b.department_id;
    });
  }

  async createDepartment(
      insertDepartment: InsertDepartment,
  ): Promise<Department> {
    const [department] = await db
        .insert(departments)
        .values(insertDepartment)
        .returning();
    return department;
  }

  async updateDepartment(
      id: number,
      departmentData: Partial<InsertDepartment>,
  ): Promise<Department | undefined> {

    const [department] = await db
        .update(departments)
        .set(departmentData)
        .where(eq(departments.department_id, id))
        .returning();
    return departmentData || undefined;
  }

  async deleteDepartment(id: number): Promise<boolean> {
    const [updated] = await db
        .update(departments)
        .set({
          deleted: true,
          deleted_at: new Date(),
        })
        .where(eq(departments.department_id, id))
        .returning({ id: departments.department_id });
    return !!updated;
  }

  // Методы для работы с должностями
  async getPosition(id: number): Promise<Position | undefined> {
    const [position] = await db
        .select()
        .from(positions)
        .where(and(eq(positions.position_id, id), eq(positions.deleted, false)));
    return position || undefined;
  }

  async getAllPositions(): Promise<Position[]> {
    const results = await db
        .select()
        .from(positions)
        .where(eq(positions.deleted, false));

    // Sort by sort field first, then by position_id
    return results.sort((a, b) => {
      const aSort = a.sort ?? 0;
      const bSort = b.sort ?? 0;

      // If sort values are different, sort by sort
      if (aSort !== bSort) {
        return aSort - bSort;
      }
      // If sort values are the same, sort by position_id
      return a.position_id - b.position_id;
    });
  }

  async getPositionCategories(): Promise<Position[]> {
    return await db
        .select()
        .from(positions)
        .where(
            and(eq(positions.deleted, false), eq(positions.is_category, true)),
        );
  }

  async createPosition(insertPosition: InsertPosition): Promise<Position> {
    const existing = await db
        .select()
        .from(positions)
        .where(
            and(
                eq(positions.name, insertPosition.name),
                eq(positions.deleted, true),
            ),
        );

    if (existing.length) {
      await db
          .delete(positions)
          .where(eq(positions.position_id, existing[0].position_id));
    }

    // Ни одного ALTER SEQUENCE здесь!
    const [newPos] = await db
        .insert(positions)
        .values(insertPosition)
        .returning();

    return newPos;
  }

  async updatePosition(
      id: number,
      positionData: Partial<InsertPosition>,
  ): Promise<Position | undefined> {
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
          deleted_at: new Date(),
        })
        .where(eq(positions.position_id, id))
        .returning({ id: positions.position_id });
    return !!updated;
  }

  // Методы для работы с иерархией должностей
  async getPositionPosition(id: number): Promise<PositionPosition | undefined> {
    const [positionPosition] = await db
        .select()
        .from(position_position)
        .where(
            and(
                eq(position_position.position_relation_id, id),
                eq(position_position.deleted, false),
            ),
        );
    return positionPosition || undefined;
  }

  async getPositionPositionsByPosition(
      positionId: number,
  ): Promise<PositionPosition[]> {
    return await db
        .select()
        .from(position_position)
        .where(
            and(
                eq(position_position.position_id, positionId),
                eq(position_position.deleted, false),
            ),
        );
  }

  async getPositionPositionsByParent(
      parentPositionId: number,
  ): Promise<PositionPosition[]> {
    return await db
        .select()
        .from(position_position)
        .where(
            and(
                eq(position_position.parent_position_id, parentPositionId),
                eq(position_position.deleted, false),
            ),
        );
  }

  async getPositionPositionsByDepartment(
      departmentId: number,
  ): Promise<PositionPosition[]> {
    return await db
        .select()
        .from(position_position)
        .where(
            and(
                eq(position_position.department_id, departmentId),
                eq(position_position.deleted, false),
            ),
        );
  }

  async getAllPositionPositions(): Promise<PositionPosition[]> {
    return await db
        .select()
        .from(position_position)
        .where(eq(position_position.deleted, false));
  }

  async createPositionPosition(
      insertPositionPosition: InsertPositionPosition,
  ): Promise<PositionPosition> {
    const [positionPosition] = await db
        .insert(position_position)
        .values(insertPositionPosition)
        .returning();
    return positionPosition;
  }

  async updatePositionPosition(
      id: number,
      positionPositionData: Partial<InsertPositionPosition>,
  ): Promise<PositionPosition | undefined> {
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
    const positionPositions =
        await this.getPositionPositionsByParent(positionId);

    // Извлекаем ID подчиненных должностей
    const subordinateIds = positionPositions.map((pp) => pp.position_id);

    // Если нет подчиненных, возвращаем пустой массив
    if (subordinateIds.length === 0) {
      return [];
    }

    // Пустой placeholder, так как мы уже не используем условия

    // Простой подход - если только один ID, используем eq
    // Для нескольких ID - фильтруем в JavaScript
    let subordinatePositions: Position[] = [];

    // Если нет подчиненных должностей, возвращаем пустой массив
    if (subordinateIds.length === 0) {
      return [];
    }

    // Получаем все должности, которые не удалены
    const allPositions = await db
        .select()
        .from(positions)
        .where(eq(positions.deleted, false));

    // Фильтруем только те должности, ID которых есть в списке подчиненных
    subordinatePositions = allPositions.filter((pos) =>
        subordinateIds.includes(pos.position_id),
    );

    return subordinatePositions;
  }

  // Методы для работы со связью должностей и отделов
  async getPositionDepartment(
      id: number,
  ): Promise<PositionDepartment | undefined> {
    const [positionDepartment] = await db
        .select()
        .from(position_department)
        .where(
            and(
                eq(position_department.position_link_id, id),
                eq(position_department.deleted, false),
            ),
        );
    return positionDepartment || undefined;
  }

  async getAllPositionDepartments(): Promise<PositionDepartment[]> {
    return await db
        .select()
        .from(position_department)
        .where(eq(position_department.deleted, false));
  }

  async createPositionDepartment(
      insertPositionDepartment: InsertPositionDepartment,
  ): Promise<PositionDepartment> {
    const [pd] = await db
        .insert(position_department)
        .values(insertPositionDepartment)
        .returning();
    return pd;
  }

  async updatePositionDepartment(
      id: number,
      positionDepartmentData: Partial<InsertPositionDepartment>,
  ): Promise<PositionDepartment | undefined> {
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
    const [employee] = await db
        .select()
        .from(employees)
        .where(and(eq(employees.employee_id, id), eq(employees.deleted, false)));
    return employee || undefined;
  }

  async getAllEmployees(): Promise<Employee[]> {
    return await db
        .select()
        .from(employees)
        .where(eq(employees.deleted, false))
        .orderBy(employees.full_name);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const [employee] = await db
        .insert(employees)
        .values(insertEmployee)
        .returning();
    return employee;
  }

  async updateEmployee(
      id: number,
      employeeData: Partial<InsertEmployee>,
  ): Promise<Employee | undefined> {
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
          deleted_at: new Date(),
        })
        .where(eq(employees.employee_id, id))
        .returning({ id: employees.employee_id });
    return !!updated;
  }

  // Методы для работы с проектами
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.project_id, id), eq(projects.deleted, false)));
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

  async updateProject(
      id: number,
      projectData: Partial<InsertProject>,
  ): Promise<Project | undefined> {
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
          deleted_at: new Date(),
        })
        .where(eq(projects.project_id, id))
        .returning({ id: projects.project_id });
    return !!updated;
  }

  // Методы для работы со связью сотрудников и проектов
  async getEmployeeProject(
      employeeId: number,
      projectId: number,
  ): Promise<EmployeeProject | undefined> {
    const [employeeProject] = await db
        .select()
        .from(employeeprojects)
        .where(
            and(
                eq(employeeprojects.employee_id, employeeId),
                eq(employeeprojects.project_id, projectId),
            ),
        );
    return employeeProject || undefined;
  }

  async getAllEmployeeProjects(): Promise<EmployeeProject[]> {
    return await db.select().from(employeeprojects);
  }

  async getEmployeeProjectsByEmployee(
      employeeId: number,
  ): Promise<EmployeeProject[]> {
    return await db
        .select()
        .from(employeeprojects)
        .where(and(eq(employeeprojects.employee_id, employeeId)));
  }

  async getEmployeeProjectsByProject(
      projectId: number,
  ): Promise<EmployeeProject[]> {
    return await db
        .select({
          employee_id: employeeprojects.employee_id,
          project_id: employeeprojects.project_id,
          role_id: employeeprojects.role_id,
        })
        .from(employeeprojects)
        .leftJoin(
            employees,
            eq(employeeprojects.employee_id, employees.employee_id),
        )
        .where(and(eq(employeeprojects.project_id, projectId)))
        .orderBy(employees.full_name);
  }

  async createEmployeeProject(
      insertEmployeeProject: InsertEmployeeProject,
  ): Promise<EmployeeProject> {
    const [employeeProject] = await db
        .insert(employeeprojects)
        .values(insertEmployeeProject)
        .returning();
    return employeeProject;
  }

  async updateEmployeeProject(
      employeeId: number,
      projectId: number,
      employeeProjectData: Partial<InsertEmployeeProject>,
      currentRoleId?: number,
  ): Promise<EmployeeProject | undefined> {
    let whereCondition = and(
        eq(employeeprojects.employee_id, employeeId),
        eq(employeeprojects.project_id, projectId),
    );

    // Если передана текущая роль, добавляем ее в условие WHERE
    if (currentRoleId !== undefined && currentRoleId !== null) {
      whereCondition = and(
          whereCondition,
          eq(employeeprojects.role_id, currentRoleId),
      );
    }

    const [employeeProject] = await db
        .update(employeeprojects)
        .set(employeeProjectData)
        .where(whereCondition)
        .returning();
    return employeeProject || undefined;
  }

  async deleteEmployeeProject(
      employeeId: number,
      projectId: number,
  ): Promise<boolean> {
    const deleted = await db
        .delete(employeeprojects)
        .where(
            and(
                eq(employeeprojects.employee_id, employeeId),
                eq(employeeprojects.project_id, projectId),
            ),
        )
        .returning();

    return deleted.length > 0;
  }

  // Методы для работы с отпусками
  async getLeave(id: number): Promise<Leave | undefined> {
    const [leave] = await db
        .select()
        .from(leaves)
        .where(and(eq(leaves.leave_id, id), eq(leaves.deleted, false)));
    return leave || undefined;
  }

  async getAllLeaves(): Promise<Leave[]> {
    return await db.select().from(leaves).where(eq(leaves.deleted, false));
  }

  async getLeavesByEmployee(employeeId: number): Promise<Leave[]> {
    return await db
        .select()
        .from(leaves)
        .where(
            and(eq(leaves.employee_id, employeeId), eq(leaves.deleted, false)),
        );
  }

  async createLeave(insertLeave: InsertLeave): Promise<Leave> {
    const [leave] = await db.insert(leaves).values(insertLeave).returning();
    return leave;
  }

  async updateLeave(
      id: number,
      leaveData: Partial<InsertLeave>,
  ): Promise<Leave | undefined> {
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
          deleted_at: new Date(),
        })
        .where(eq(leaves.leave_id, id))
        .returning({ id: leaves.leave_id });
    return !!updated;
  }

  // Методы для работы с настройками
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db
        .select()
        .from(settings)
        .where(eq(settings.data_key, key));
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
            updated_at: new Date(),
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
            data_value: value,
          })
          .returning();
      return setting;
    }
  }

  // Методы для работы с ролями проектов
  async getAllProjectRoles(): Promise<ProjectRole[]> {
    return await db.select().from(project_roles).orderBy(project_roles.id);
  }

  async getProjectRole(id: number): Promise<ProjectRole | undefined> {
    const [role] = await db
        .select()
        .from(project_roles)
        .where(eq(project_roles.id, id));
    return role || undefined;
  }

  async createProjectRole(insertRole: InsertProjectRole): Promise<ProjectRole> {
    const [role] = await db
        .insert(project_roles)
        .values(insertRole)
        .returning();
    return role;
  }

  async updateProjectRole(
      id: number,
      roleData: Partial<InsertProjectRole>,
  ): Promise<ProjectRole | undefined> {
    const [role] = await db
        .update(project_roles)
        .set(roleData)
        .where(eq(project_roles.id, id))
        .returning();
    return role || undefined;
  }

  async deleteProjectRole(id: number): Promise<boolean> {
    const result = await db
        .delete(project_roles)
        .where(eq(project_roles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Методы для работы с сортировкой дерева
  async getSortTree(): Promise<SortTree[]> {
    return await db
        .select()
        .from(sort_tree)
        .orderBy(sort_tree.type, sort_tree.type_id, sort_tree.sort);
  }

  async getSortTreeItem(
      type: string,
      type_id: number,
      parent_id: number | null,
  ): Promise<SortTree | undefined> {
    let query;

    if (parent_id === null) {
      query = and(
          eq(sort_tree.type, type),
          eq(sort_tree.type_id, type_id),
          // eq(sort_tree.parent_id, null) - this is causing issues
          eq(sort_tree.parent_id, undefined as any), // workaround
      );
    } else {
      query = and(
          eq(sort_tree.type, type),
          eq(sort_tree.type_id, type_id),
          eq(sort_tree.parent_id, parent_id),
      );
    }

    const [item] = await db.select().from(sort_tree).where(query);
    return item || undefined;
  }

  async createSortTreeItem(item: InsertSortTree): Promise<SortTree> {
    const [sortItem] = await db.insert(sort_tree).values(item).returning();
    return sortItem;
  }

  async updateSortTreeItem(
      id: number,
      item: Partial<InsertSortTree>,
  ): Promise<SortTree | undefined> {
    const [sortItem] = await db
        .update(sort_tree)
        .set(item)
        .where(eq(sort_tree.id, id))
        .returning();
    return sortItem || undefined;
  }

  async deleteSortTreeItem(id: number): Promise<boolean> {
    const [deleted] = await db
        .delete(sort_tree)
        .where(eq(sort_tree.id, id))
        .returning({ id: sort_tree.id });
    return !!deleted;
  }

  // Методы для работы с организациями
  async getAllOrganizations(): Promise<Department[]> {
    return await db
        .select()
        .from(departments)
        .where(
            and(
                eq(departments.deleted, false),
                eq(departments.is_organization, true),
            ),
        )
        .orderBy(departments.name);
  }

  async setOrganizationStatus(
      departmentId: number,
      isOrganization: boolean,
  ): Promise<Department | undefined> {
    const [department] = await db
        .update(departments)
        .set({ is_organization: isOrganization })
        .where(eq(departments.department_id, departmentId))
        .returning();
    return department || undefined;
  }

  async getProjectsRoles(): Promise<Role[]> {
    return await db.select().from(roles);
  }

  async createProjectsRole(insertRole: InsertRole): Promise<Role> {
    const [role] = await db
        .insert(roles)
        .values(insertRole)
        .returning();

    return role;
  }
}

export const storage = new DatabaseStorage();
