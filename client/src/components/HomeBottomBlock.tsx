import { Link, useRoute } from "wouter";
import { CardTitle } from "@/components/ui/card";

export default function StatisticsBlock({
                                            isRootView,
                                            selectedPositionId,
                                            currentContext,
                                            organizations,
                                            getContextVacancies,
                                            getOrganizationVacancies,
                                            getContextDepartmentsCount,
                                            getContextProjectsCount,
                                            projects,
                                        }) {
    const formatedPositionId = selectedPositionId % 1000 === 0 ? selectedPositionId / 1000 : selectedPositionId;
    const vacanciesUrlForDep = currentContext.positionId / 1000 === currentContext.departmentId ? '/department' : '';
    const firstOrganization = organizations[0];
    const secondOrganization = organizations[1];
    
    const projectsEmployeeCount = projects.reduce((accumulator, currentValue) => accumulator += currentValue.employeeCount, 0);

    if ((selectedPositionId === 0 || isRootView)) {
        return (
            <>
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <Link href={`/vacancies/department/${firstOrganization?.department_id}`} onClick={() => {
                            localStorage.setItem('selectedOrganizationId', firstOrganization?.department_id.toString());
                            localStorage.setItem('selectedOrganizationName', firstOrganization?.name);
                        }}>
                            <div
                                className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="font-medium text-lg">ГБУ МОССТРОИНФОРМ</div>
                                    <div className="font-medium text-sm text-[#828282]">Учет вакансий</div>
                                </div>
                                {/* Строка 2 */}
                                <div className="flex justify-around">
                                    <div className="flex flex-col items-center">
                                        <div className="font-medium text-sm text-[#828282]">
                                            Всего
                                        </div>
                                        <span
                                            className="text-[30px] leading-none font-bold text-[#C00000]">{getOrganizationVacancies(firstOrganization?.department_id).total}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="font-medium text-sm text-[#828282]">
                                            Занято
                                        </div>
                                        <span
                                            className="text-[30px] leading-none font-bold text-[#489851]">{getOrganizationVacancies(firstOrganization?.department_id).occupied}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="font-medium text-sm text-[#828282]">
                                            Вакантно
                                        </div>
                                        <span
                                            className="text-[30px] leading-none font-bold text-[#C00000]">{getOrganizationVacancies(firstOrganization?.department_id).vacant}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                    <div className="flex-1">
                        <Link href="/projects">
                            <div
                                className="bg-white p-3 rounded-md shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                                <h3 className="font-medium text-lg mb-3">Проекты</h3>
                                <div className="flex justify-around">
                                    <div className="flex flex-col items-center">
                                        <div className="font-medium text-sm text-[#828282]">
                                            Активные проекты
                                        </div>
                                        <span
                                            className="text-[30px] leading-none font-bold text-[#489851]">{projects.length}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="font-medium text-sm text-[#828282]">
                                            Участники проектов
                                        </div>
                                        <span className="text-[30px] leading-none font-bold text-[#489851]">
                                            {projectsEmployeeCount}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                    <div className="flex-1">
                        <Link href={`/vacancies/department/${secondOrganization?.department_id}`} onClick={() => {
                            localStorage.setItem('selectedOrganizationId', secondOrganization?.department_id.toString());
                            localStorage.setItem('selectedOrganizationName', secondOrganization?.name);
                        }}>
                            <div
                                className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="font-medium text-lg">{secondOrganization?.name.toUpperCase()}</div>
                                    <div className="font-medium text-sm text-[#828282]">Учет вакансий</div>
                                </div>
                                {/* Строка 2 */}
                                <div className="flex justify-around">
                                    <div className="flex flex-col items-center">
                                        <div className="font-medium text-sm text-[#828282]">
                                            Всего
                                        </div>
                                        <span
                                            className="text-[30px] leading-none font-bold text-[#C00000]">{getOrganizationVacancies(secondOrganization?.department_id).total}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="font-medium text-sm text-[#828282]">
                                            Занято
                                        </div>
                                        <span
                                            className="text-[30px] leading-none font-bold text-[#489851]">{getOrganizationVacancies(secondOrganization?.department_id).occupied}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="font-medium text-sm text-[#828282]">
                                            Вакантно
                                        </div>
                                        <span
                                            className="text-[30px] leading-none font-bold text-[#C00000]">{getOrganizationVacancies(secondOrganization?.department_id).vacant}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-3 flex-shrink-0">
            {/* Отделы */}
            <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="font-medium text-lg mb-2">Отделы в подчинении</h3>
                <div className="text-2xl font-bold">
                    {getContextVacancies(currentContext.departmentId, currentContext.positionId).departments}
                </div>
                <div className="text-sm text-gray-500">Всего отделов</div>
            </div>
            {/* Сотрудники */}
            <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="font-medium text-lg mb-2">Сотрудники в подчинении</h3>
                <div className="text-2xl font-bold">
                    {getContextVacancies(currentContext.departmentId, currentContext.positionId).occupied}
                </div>
                <div className="text-sm text-gray-500">Всего сотрудников</div>
            </div>
            {/* Проекты */}
            {/*<Link href="/projects">*/}
            {/*    <div className="bg-white p-4 rounded-md shadow-sm hover:shadow-md cursor-pointer transition-shadow">*/}
            {/*        <h3 className="font-medium text-lg mb-2">Проекты</h3>*/}
            {/*        <div className="text-2xl font-bold">{getContextProjectsCount(currentContext.departmentId)}</div>*/}
            {/*        <div className="text-sm text-gray-500">Активных проектов</div>*/}
            {/*    </div>*/}
            {/*</Link>*/}
            {/* Вакансии */}
            <Link href={`/vacancies${selectedPositionId ? `${vacanciesUrlForDep}/` + formatedPositionId : ''}`}>
                <div className="bg-white p-4 rounded-md shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                    <h3 className="font-medium text-lg mb-2">Учет вакансий</h3>
                    <div className="flex justify-around">
                        <div className="flex flex-col items-center">
                            <div className="font-medium text-sm text-[#828282]">
                                Всего
                            </div>
                            <span
                                className="text-[30px] leading-none font-bold text-[#C00000]">{getContextVacancies(currentContext.departmentId, currentContext.positionId).total}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="font-medium text-sm text-[#828282]">
                                Занято
                            </div>
                            <span
                                className="text-[30px] leading-none font-bold text-[#489851]">{getContextVacancies(currentContext.departmentId, currentContext.positionId).occupied}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="font-medium text-sm text-[#828282]">
                                Вакантно
                            </div>
                            <span
                                className="text-[30px] leading-none font-bold text-[#C00000]">{getContextVacancies(currentContext.departmentId, currentContext.positionId).vacant}</span>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
