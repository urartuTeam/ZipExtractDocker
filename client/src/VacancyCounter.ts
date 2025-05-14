export type VacancyCount = {
    total: number;   // Общее количество штатных единиц
    occupied: number; // Количество занятых позиций
    vacant: number;   // Количество свободных вакансий
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
    public getVacancyCount1(context: {
        departmentId?: number | null;
        positionId?: number | null;
    }): VacancyCount {

        if (context.departmentId && context.positionId) {
            return this.getPositionVacancyCount(context.departmentId, context.positionId);
        } else if (context.departmentId) {
            return this.getDepartmentVacancyCount(context.departmentId);
        } else {
            return this.getOrganizationVacancyCount();
        }
    }

    public getVacancyCount(context: {
        departmentId?: number | null;
        positionId?: number | null;
    }): VacancyCount {
        const { departmentId, positionId } = context;

        // 1) Если позиция задана
        if (positionId != null && positionId > 0) {
            // найти все реальные отделы, к которым привязана эта позиция:
            const p = this.positionsWithDepartments
                .find(p => p.position_id === positionId);
            const bindingDepts = p
                ? p.departments.filter(d => !d.deleted).map(d => d.department_id)
                : [];

            // если есть хоть одна привязка — суммировать по каждой ветке
            if (bindingDepts.length > 0) {
                let total = 0, occupied = 0;
                for (const realDept of bindingDepts) {
                    const { total: t, occupied: o } =
                        this.getPositionSubtreeVacancyCount(realDept, positionId);
                    total += t;
                    occupied += o;
                }
                return { total, occupied, vacant: Math.max(0, total - occupied) };
            }
            // если привязок нет — упадем дальше на отдел/организацию
        }

        // 2) Без валидной позиции — по отделу
        if (departmentId != null) {
            return this.getDepartmentVacancyCount(departmentId);
        }

        // 3) Ни позиции, ни отдела — по всей организации
        return this.getOrganizationVacancyCount();
    }

    private getPositionSubtreeVacancyCount(
        startDept: number,
        startPos: number
    ): VacancyCount {
        const visited = new Set<string>();
        let total = 0, occupied = 0;

        const dfs = (deptId: number, posId: number) => {
            const key = `${deptId}:${posId}`;
            if (visited.has(key)) return;
            visited.add(key);

            // 1) считаем саму связку pos–dept
            const pwd = this.positionsWithDepartments
                .find(p => p.position_id === posId)
                ?.departments.find(d => d.department_id === deptId && !d.deleted);
            if (pwd) {
                total += pwd.vacancies || 0;
                occupied += this.employees.filter(e =>
                    !e.deleted &&
                    e.position_id === posId &&
                    e.department_id === deptId
                ).length;
            }

            // 2) дочерние позиции в том же отделе
            this.positionPositions
                .filter(pp => pp.parent_position_id === posId && pp.department_id === deptId)
                .forEach(pp => dfs(deptId, pp.position_id));

            // 3) cross-dept children_positions
            const me = this.positionsWithDepartments.find(p => p.position_id === posId);
            me?.children_positions
                .filter(cp => cp.department_id === deptId)
                .forEach(cp => dfs(deptId, cp.position_id));

            // 4) дочерние отделы из departments
            const childDepts = this.departments
                .filter(d => d.parent_department_id === deptId)
                .map(d => d.department_id);

            childDepts.forEach(cd => dfs(cd, posId));
        };

        dfs(startDept, startPos);
        return { total, occupied, vacant: Math.max(0, total - occupied) };
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
            return { total: 0, occupied: 0, vacant: 0 };
        }

        // Находим данные по отделу в этой должности
        const departmentData = position.departments.find(
            d => d.department_id === departmentId && !d.deleted
        );

        if (!departmentData) {
            return { total: 0, occupied: 0, vacant: 0 };
        }

        // Считаем занятые позиции
        const occupied = this.employees.filter(
            e => e.position_id === positionId &&
                e.department_id === departmentId &&
                !e.deleted
        ).length;

        return {
            total: departmentData.vacancies || 0,
            occupied,
            vacant: Math.max(0, (departmentData.vacancies || 0) - occupied)
        };
    }

    private getDepartmentVacancyCount(departmentId: number): VacancyCount {
        const visited = new Set<number>()
        let total = 0, occupied = 0

        const dfs = (deptId: number) => {
            if (visited.has(deptId)) return
            visited.add(deptId)

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
        }

        dfs(departmentId)
        return { total, occupied, vacant: Math.max(0, total - occupied) }
    }

    /**
     * Подсчет вакансий для отдела и всех его подотделов
     * @param departmentId ID отдела
     * @returns Данные по вакансиям
     */
    private getDepartmentVacancyCount2(departmentId: number): VacancyCount {
        const childDepartments = this.getAllChildDepartments(departmentId);
        const result: VacancyCount = { total: 0, occupied: 0, vacant: 0 };
        const processedPairs = new Set<string>();
        console.log('1------------------------------------',[childDepartments,result,processedPairs ]);
        this.positionsWithDepartments.forEach(position => {
            position.departments.forEach(department => {
                if (childDepartments.includes(department.department_id) && !department.deleted) {
                    const key = `${position.position_id}:${department.department_id}`;
                    if (!processedPairs.has(key)) {
                        processedPairs.add(key);
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
        return result;
    }

    /**
     * Подсчет вакансий для всей организации
     * @returns Данные по вакансиям
     */
    private getOrganizationVacancyCount(): VacancyCount {
        const result: VacancyCount = { total: 0, occupied: 0, vacant: 0 };
        const processedPairs = new Set<string>();

        this.positionsWithDepartments.forEach(position => {
            position.departments.forEach(department => {
                if (!department.deleted) {
                    const key = `${position.position_id}:${department.department_id}`;
                    if (!processedPairs.has(key)) {
                        processedPairs.add(key);
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