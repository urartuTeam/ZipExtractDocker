export type VacancyCount = {
    total: number;   // Общее количество штатных единиц
    occupied: number; // Количество занятых позиций
    vacant: number;   // Количество свободных вакансий
    departments: number; // Количество отделов
};

export class VacancyCounter {
    private departments: Array<{
        department_id: number;
        parent_department_id: number | null;
        [key: string]: any;
    }>;

    private employees: Array<{
        employee_id: number;
        position_id: number;
        department_id: number;
        deleted: boolean;
        [key: string]: any;
    }>;

    private positionsWithDepartments: Array<{
        position_id: number;
        departments: Array<{
            department_id: number;
            vacancies: number;
            deleted: boolean;
            [key: string]: any;
        }>;
        [key: string]: any;
    }>;

    private positionPositions: Array<{
        parent_position_id: number;
        parent_department_id: number;
        child_position_id: number;
        child_department_id: number;
        [key: string]: any;
    }>;

    constructor(
        departments: any[],
        employees: any[],
        positionsWithDepartments: any[],
        positionPositions: any[]
    ) {
        this.departments = departments;
        this.employees = employees;
        this.positionsWithDepartments = positionsWithDepartments;
        this.positionPositions = positionPositions;
    }

    /**
     * Основной метод для получения количества вакансий
     * @param context Контекст с departmentId и/или positionId
     * @returns Объект с подсчитанными вакансиями
     */
    public getVacancyCount(context: {
        departmentId?: number | null;
        positionId?: number | null;
        hasSubordinates?: boolean;
    }): VacancyCount {
        const { departmentId, positionId, hasSubordinates = false } = context;

        if (hasSubordinates) {
            // Если есть подчиненные, считаем только текущую позицию (vacancies на текущей позиции)
            if (positionId != null && departmentId != null) {
                return this.getPositionVacancyCount(departmentId, positionId);
            }
            // Если departmentId или positionId нет, fallback:
            if (departmentId != null) {
                return this.getDepartmentVacancyCount(departmentId);
            }
            return this.getOrganizationVacancyCount();
        }

        // Если подчиненных нет, считаем рекурсивно subtree
        const hasBinding =
            positionId != null &&
            departmentId != null &&
            this.positionsWithDepartments.some(p =>
                p.position_id === positionId &&
                p.departments.some(d => d.department_id === departmentId && !d.deleted)
            );

        if (hasBinding) {
            return this.getPositionSubtreeVacancyCount(departmentId!, positionId!);
        } else if (departmentId != null) {
            return this.getDepartmentVacancyCount(departmentId);
        } else {
            return this.getOrganizationVacancyCount();
        }
    }


    private getPositionSubtreeVacancyCount(
        startDept: number,
        startPos: number
    ): VacancyCount {

        const visitedPos = new Set<string>();
        const visitedDept = new Set<number>();
        const deptIds = new Set<number>(); // для подсчёта отделов
        let total = 0, occupied = 0;

        const dfs = (deptId: number, posId: number, isRoot = false) => {
            const key = `${deptId}:${posId}`;
            if (visitedPos.has(key)) return;
            visitedPos.add(key);

            deptIds.add(deptId); // добавляем отдел

            if (!isRoot) {
                const pwd = this.positionsWithDepartments
                    .find(p => p.position_id === posId)
                    ?.departments.find(d => d.department_id === deptId && !d.deleted);

                if (pwd) {
                    total += pwd.vacancies || 0;
                    occupied += this.employees.filter(e =>
                        e.position_id === posId &&
                        e.department_id === deptId &&
                        !e.deleted
                    ).length;
                }
            }

            this.positionPositions
                .filter(pp =>
                    pp.parent_position_id === posId && pp.department_id === deptId
                )
                .forEach(pp => dfs(deptId, pp.position_id));

            const me = this.positionsWithDepartments.find(p => p.position_id === posId);
            me?.children_positions
                .filter(cp => cp.department_id === deptId)
                .forEach(cp => dfs(deptId, cp.position_id));

            const simple = this.departments
                .filter(d => d.parent_position_id === posId)
                .map(d => d.department_id);

            const linked = this.positionPositions
                .filter(pp => pp.parent_department_id === deptId)
                .map(pp => pp.child_department_id!);

            Array.from(new Set([...simple, ...linked]))
                .forEach(childDeptId => {
                    if (visitedDept.has(childDeptId)) return;
                    visitedDept.add(childDeptId);
                    deptIds.add(childDeptId);
                    const { total: dT, occupied: dO } = this.getDepartmentVacancyCount(childDeptId);
                    total += dT;
                    occupied += dO;
                });
        };

        dfs(startDept, startPos, true);


        return {
            total,
            occupied,
            vacant: Math.max(0, total - occupied),
            departments: deptIds.size - 1,
        };
    }

    /**
     * Подсчет вакансий для конкретной позиции в отделе
     * @param departmentId ID отдела
     * @param positionId ID должности
     * @returns Данные по вакансиям
     */
    private getPositionVacancyCount(departmentId: number, positionId: number): VacancyCount {
        // Находим связку должность-отдел
        const position = this.positionsWithDepartments.find(
            p => p.position_id === positionId
        );

        if (!position) {
            return {departments: 0, total: 0, occupied: 0, vacant: 0 };
        }

        // Находим данные по отделу в этой должности
        const departmentData = position.departments.find(
            d => d.department_id === departmentId && !d.deleted
        );

        if (!departmentData) {
            return {departments: 0, total: 0, occupied: 0, vacant: 0 };
        }

        // Считаем занятые позиции
        const occupied = this.employees.filter(
            e => e.position_id === positionId &&
                e.department_id === departmentId &&
                !e.deleted
        ).length;

        return {
            departments: 0,
            total: departmentData.vacancies || 0,
            occupied,
            vacant: Math.max(0, (departmentData.vacancies || 0) - occupied)
        };
    }

    private getDepartmentVacancyCount(departmentId: number): VacancyCount {
        const visited = new Set<number>();
        const deptIds = new Set<number>();
        let total = 0, occupied = 0;
        const dfs = (deptId: number) => {
            if (visited.has(deptId)) return
            visited.add(deptId);
            deptIds.add(deptId);

            // 1) Vacancies в позиционно-отделочной таблице
            this.positionsWithDepartments.forEach(pwd => {
                pwd.departments.forEach(d => {
                    if (d.department_id === deptId && !d.deleted) {
                        total += d.vacancies || 0
                    }
                })
            })

            // 2) Занятые
            this.employees.forEach(e => {
                if (e.department_id === deptId && !e.deleted) {
                    occupied += 1
                }
            })

            // 3) Рекурсивно по «чистым» дочерним отделам
            this.departments
                .filter(d => d.parent_department_id === deptId)
                .forEach(d => dfs(d.department_id))

            // 4) По «связным» дочерним отделам через positionPositions
            this.positionPositions
                .filter(pp => pp.parent_department_id === deptId)
                .map(pp => pp.child_department_id!)
                .forEach(childDeptId => dfs(childDeptId))

            const childPositions = this.positionsWithDepartments.filter(p => (
                p.departments.filter(d => d.department_id === departmentId && d.parent_position === null).length > 0
            ));

            const childsOfChildrenPositionIds: number[] = [];
            childPositions.forEach(pos => {
                childsOfChildrenPositionIds.push(...pos.children_positions.map(childPos => childPos.position_id));
            });

            this.departments
                .filter(dep => childsOfChildrenPositionIds.includes(dep.parent_position_id))
                .forEach(dep => dfs(dep.department_id));

        }

        dfs(departmentId)
        return { total, occupied, vacant: Math.max(0, total - occupied), departments: deptIds.size -1 };
    }

    /**
     * Подсчет вакансий для всей организации
     * @returns Данные по вакансиям
     */
    private getOrganizationVacancyCount(): VacancyCount {
        const result: VacancyCount = { total: 0, occupied: 0, vacant: 0, departments: 0 };
        const processedPairs = new Set<string>();
        const deptIds = new Set<number>();

        this.positionsWithDepartments.forEach(position => {
            position.departments.forEach(department => {
                if (!department.deleted) {
                    const key = `${position.position_id}:${department.department_id}`;
                    if (!processedPairs.has(key)) {
                        processedPairs.add(key);
                        deptIds.add(department.department_id);
                        const count = this.getPositionVacancyCount(
                            department.department_id,
                            position.position_id
                        );
                        result.total += count.total;
                        result.occupied += count.occupied;
                    }
                }
            });
        });

        result.vacant = Math.max(0, result.total - result.occupied);
        result.departments = deptIds.size;

        return result;
    }


    /**
     * Получение всех дочерних отделов (включая текущий)
     * @param departmentId ID отдела
     * @returns Массив ID отделов
     */
    private getAllChildDepartments(departmentId: number): number[] {
        const result: number[] = [];
        const queue: number[] = [departmentId];
        while (queue.length > 0) {
            const currentId = queue.shift()!;
            if (!result.includes(currentId)) {
                result.push(currentId);
                const children = this.departments.filter(
                    d => d.parent_department_id === currentId
                );
                children.forEach(child => queue.push(child.department_id));
            }
        }

        return result;
    }
}