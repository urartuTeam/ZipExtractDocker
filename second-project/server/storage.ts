import {
  departments,
  type Employee,
  type EmployeeProjectRole,
  employeeProjectRoles,
  type EmployeePosition,
  employeePositions,
  employees,
  type InsertEmployee,
  type InsertEmployeeProjectRole,
  type InsertEmployeePosition,
  type InsertOrgUnit,
  type InsertProject,
  type InsertProjectRole,
  organizations,
  type OrgUnit,
  orgUnits,
  positions,
  type Project,
  type ProjectRole,
  projectRoles,
  projects,
} from "@shared/schema";
import { db } from "./db";
import { and, eq, isNull, isNotNull, sql } from "drizzle-orm";

export interface IStorage {
  // Org Units
  getOrgUnits(): Promise<OrgUnit[]>;
  getOrgUnit(id: number): Promise<OrgUnit | undefined>;
  getRootOrgUnits(): Promise<OrgUnit[]>;
  getChildOrgUnits(parentId: number): Promise<OrgUnit[]>;
  createOrgUnit(unit: InsertOrgUnit): Promise<OrgUnit>;
  updateOrgUnit(
    id: number,
    unit: Partial<OrgUnit>,
  ): Promise<OrgUnit | undefined>;
  deleteOrgUnit(id: number): Promise<boolean>;

  // Employees
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  getEmployeesByPosition(positionId: number): Promise<Employee[]>;
  getEmployeesByDepartment(departmentId: number): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(
    id: number,
    employee: Partial<Employee>,
  ): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;

  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(
    id: number,
    project: Partial<Project>,
  ): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Project Roles
  getProjectRoles(projectId: number): Promise<ProjectRole[]>;
  getProjectRole(id: number): Promise<ProjectRole | undefined>;
  createProjectRole(role: InsertProjectRole): Promise<ProjectRole>;
  updateProjectRole(
    id: number,
    role: Partial<ProjectRole>,
  ): Promise<ProjectRole | undefined>;
  deleteProjectRole(id: number): Promise<boolean>;

  // Employee Project Roles
  getEmployeeProjectRoles(projectId: number): Promise<EmployeeProjectRole[]>;
  getEmployeesByProjectRole(roleId: number): Promise<Employee[]>;
  addEmployeeToProjectRole(
    employeeProjectRole: InsertEmployeeProjectRole,
  ): Promise<EmployeeProjectRole>;
  removeEmployeeFromProjectRole(
    employeeId: number,
    projectRoleId: number,
  ): Promise<boolean>;

  // Employee Positions (назначения сотрудников)
  getAllEmployeePositions(): Promise<EmployeePosition[]>;
  getEmployeePositions(orgUnitId: number): Promise<EmployeePosition[]>;
  getEmployeesByOrgUnit(orgUnitId: number): Promise<Employee[]>;
  assignEmployeeToOrgUnit(assignment: InsertEmployeePosition): Promise<EmployeePosition>;
  removeEmployeeFromOrgUnit(employeeId: number, orgUnitId: number): Promise<boolean>;
  updateEmployeeAssignment(id: number, assignment: Partial<EmployeePosition>): Promise<EmployeePosition | undefined>;

  // Individual table methods
  getPositions(): Promise<any[]>;
  getDepartments(): Promise<any[]>;
  getOrganizations(): Promise<any[]>;
  getManagements(): Promise<any[]>;
  
  // Head employees
  getHeadEmployeeIds(): Promise<number[]>;
}

export class DatabaseStorage implements IStorage {
  // Org Units
  async getOrgUnits(): Promise<(OrgUnit & { typeName: string })[]> {
    const units = await db.select().from(orgUnits);

    return await Promise.all(
      units.map(async (unit) => ({
        ...unit,
        name: await this.getOrgUnitName(unit.type, unit.type_id),
      })),
    );
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

  // Employees
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, id));
    return employee;
  }

  async getEmployeesByPosition(positionId: number): Promise<Employee[]> {
    return await db
      .select()
      .from(employees)
      .where(eq(employees.positionId, positionId));
  }

  async getEmployeesByDepartment(departmentId: number): Promise<Employee[]> {
    return await db
      .select()
      .from(employees)
      .where(eq(employees.departmentId, departmentId));
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db
      .insert(employees)
      .values(employee)
      .returning();
    return newEmployee;
  }

  async updateEmployee(
    id: number,
    employee: Partial<Employee>,
  ): Promise<Employee | undefined> {
    const [updatedEmployee] = await db
      .update(employees)
      .set(employee)
      .where(eq(employees.id, id))
      .returning();
    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    await db.delete(employees).where(eq(employees.id, id));
    return true;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(
    id: number,
    project: Partial<Project>,
  ): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    await db.delete(projects).where(eq(projects.id, id));
    return true;
  }

  // Project Roles
  async getProjectRoles(projectId: number): Promise<ProjectRole[]> {
    return await db
      .select()
      .from(projectRoles)
      .where(eq(projectRoles.projectId, projectId));
  }

  async getProjectRole(id: number): Promise<ProjectRole | undefined> {
    const [role] = await db
      .select()
      .from(projectRoles)
      .where(eq(projectRoles.id, id));
    return role;
  }

  async createProjectRole(role: InsertProjectRole): Promise<ProjectRole> {
    const [newRole] = await db.insert(projectRoles).values(role).returning();
    return newRole;
  }

  async updateProjectRole(
    id: number,
    role: Partial<ProjectRole>,
  ): Promise<ProjectRole | undefined> {
    const [updatedRole] = await db
      .update(projectRoles)
      .set(role)
      .where(eq(projectRoles.id, id))
      .returning();
    return updatedRole;
  }

  async deleteProjectRole(id: number): Promise<boolean> {
    await db.delete(projectRoles).where(eq(projectRoles.id, id));
    return true;
  }

  // Employee Project Roles
  async getEmployeeProjectRoles(
    projectId: number,
  ): Promise<EmployeeProjectRole[]> {
    const projectRolesList = await this.getProjectRoles(projectId);
    const roleIds = projectRolesList.map((role) => role.id);

    if (roleIds.length === 0) {
      return [];
    }

    return await db
      .select()
      .from(employeeProjectRoles)
      .where(
        roleIds
          .map((id) => eq(employeeProjectRoles.projectRoleId, id))
          .reduce((acc, curr) => acc || curr),
      );
  }

  async getEmployeesByProjectRole(roleId: number): Promise<Employee[]> {
    const employeeRoles = await db
      .select()
      .from(employeeProjectRoles)
      .where(eq(employeeProjectRoles.projectRoleId, roleId));

    if (employeeRoles.length === 0) {
      return [];
    }

    const employeeIds = employeeRoles.map((role) => role.employeeId);

    return await db
      .select()
      .from(employees)
      .where(
        employeeIds
          .map((id) => eq(employees.id, id))
          .reduce((acc, curr) => acc || curr),
      );
  }

  async addEmployeeToProjectRole(
    employeeProjectRole: InsertEmployeeProjectRole,
  ): Promise<EmployeeProjectRole> {
    const [newRole] = await db
      .insert(employeeProjectRoles)
      .values(employeeProjectRole)
      .returning();
    return newRole;
  }

  async removeEmployeeFromProjectRole(
    employeeId: number,
    projectRoleId: number,
  ): Promise<boolean> {
    await db
      .delete(employeeProjectRoles)
      .where(
        and(
          eq(employeeProjectRoles.employeeId, employeeId),
          eq(employeeProjectRoles.projectRoleId, projectRoleId),
        ),
      );
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

  async updatePositionName(typeId: number, name: string): Promise<void> {
    await db.update(positions).set({ name }).where(eq(positions.id, typeId));
  }

  async updateOrganizationName(typeId: number, name: string): Promise<void> {
    await db
      .update(organizations)
      .set({ name })
      .where(eq(organizations.id, typeId));
  }

  async updateDepartmentName(
    typeId: number,
    name: string,
    isManagement: boolean,
  ): Promise<void> {
    await db
      .update(departments)
      .set({
        name,
        isManagment: isManagement, // camelCase как в схеме
      })
      .where(eq(departments.id, typeId));
  }

  // Individual table methods
  async getPositions(): Promise<any[]> {
    return await db.select().from(positions);
  }

  async getDepartments(): Promise<any[]> {
    return await db.select().from(departments);
  }

  async getOrganizations(): Promise<any[]> {
    return await db.select().from(organizations);
  }

  async getManagements(): Promise<any[]> {
    return await db.select().from(departments).where(eq(departments.isManagment, true));
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

  async updateEmployeeAssignment(
    id: number,
    assignment: Partial<EmployeePosition>
  ): Promise<EmployeePosition | undefined> {
    const [result] = await db
      .update(employeePositions)
      .set(assignment)
      .where(eq(employeePositions.id, id))
      .returning();
    return result;
  }

  async getAllEmployeePositions(): Promise<EmployeePosition[]> {
    const assignments = await db.select().from(employeePositions);
    return assignments;
  }

  async getHeadEmployeeIds(): Promise<number[]> {
    const result = await db
      .select({ headEmployeeId: orgUnits.headEmployeeId })
      .from(orgUnits)
      .where(sql`head_employee_id IS NOT NULL`);
    
    return result.map(row => row.headEmployeeId).filter(id => id !== null) as number[];
  }
}

export const storage = new DatabaseStorage();
