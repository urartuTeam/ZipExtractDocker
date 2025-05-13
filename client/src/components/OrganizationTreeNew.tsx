subordinateNode) {
            // Добавляем информацию о контексте отдела
            subordinateNode.departmentContext = department.department_id;
            subordinatePositions.push(subordinateNode);
          }
        }
      });

      // Создаем узел должности
      const node: PositionHierarchyNode = {
        position,
        employees: positionEmployees,
        subordinates: subordinatePositions,
        childDepartments,
        departmentContext: department.department_id
      };

      return node;
    };

    // Отфильтровать должности администрации
    const buildHierarchy = () => {
      if (
        departments.length === 0 ||
        positions.length === 0 ||
        positionRelations.length === 0
      ) {
        return;
      }

      // Находим корневой отдел
      const rootDepartment = departments.find(
        d => d.parent_department_id === null && d.parent_position_id === null
      );

      if (!rootDepartment) return;

      // Находим высшие должности администрации
      let adminPositions: Position[] = [];

      // Сначала проверим positions с отделами (из /api/positions/with-departments)
      if (positionsWithDepartments && positionsWithDepartments.length > 0) {
        adminPositions = positionsWithDepartments.filter(pos => {
          // Проверяем, есть ли у должности привязка к корневому отделу
          return (
            pos.departments &&
            Array.isArray(pos.departments) &&
            pos.departments.some(
              (d: any) => d.department_id === rootDepartment.department_id
            )
          );
        });
      }

      // Если не нашли через positions с отделами, ищем через обычные должности
      if (adminPositions.length === 0) {
        // Находим все должности, которые имеют связь с корневым отделом
        const positionIds = positionRelations
          .filter(
            rel =>
              rel.department_id === rootDepartment.department_id &&
              !rel.deleted
          )
          .map(rel => rel.position_id);

        adminPositions = positions.filter(pos =>
          positionIds.includes(pos.position_id)
        );
      }

      // Выбираем высшие должности (без родительских должностей в этом же отделе)
      const rootPositions = adminPositions.filter(pos => {
        const parentRel = positionRelations.find(
          rel => 
            rel.position_id === pos.position_id && 
            rel.department_id === rootDepartment.department_id
        );
        
        return !parentRel || !adminPositions.some(
          p => p.position_id === parentRel.parent_position_id
        );
      });

      // Создаем иерархию должностей для каждой корневой должности
      const hierarchyNodes = rootPositions.map(position => {
        return createPositionHierarchyNode(
          position.position_id,
          rootDepartment
        );
      }).filter(Boolean) as PositionHierarchyNode[];

      setPositionHierarchy(hierarchyNodes);
      setFilteredHierarchy(hierarchyNodes);
    };

    buildHierarchy();
  }, [departments, employees, positions, positionRelations, positionsWithDepartments]);

  // Фильтруем иерархию в зависимости от выбранной должности
  useEffect(() => {
    if (selectedPositionId) {
      // Рекурсивно ищем узел должности по ID
      const findPositionNodeById = (
        nodes: PositionHierarchyNode[],
        positionId: number,
        departmentId?: number | null
      ): PositionHierarchyNode | null => {
        for (const node of nodes) {
          if (node.position.position_id === positionId) {
            // Если указан контекст отдела, проверяем его
            if (departmentId && node.departmentContext && 
                node.departmentContext !== departmentId) {
              continue; // Пропускаем этот узел, ищем должность в правильном контексте
            }
            
            return JSON.parse(JSON.stringify(node)); // Глубокая копия узла
          }
          
          // Рекурсивно ищем в подчиненных
          if (node.subordinates && node.subordinates.length > 0) {
            const foundInSubordinates = findPositionNodeById(
              node.subordinates,
              positionId,
              departmentId
            );
            if (foundInSubordinates) return foundInSubordinates;
          }
        }
        
        return null;
      };
      
      // Ищем выбранную должность
      const selectedNode = findPositionNodeById(
        positionHierarchy,
        selectedPositionId,
        currentDepartmentContext
      );
      
      if (selectedNode) {
        // Создаем копию узла для обработки
        const selectedNodeCopy = JSON.parse(JSON.stringify(selectedNode));
        
        if (currentDepartmentContext) {
          // Фильтруем подчиненных, чтобы показать только те, которые относятся к выбранному отделу
          let filteredSubordinates = selectedNodeCopy.subordinates;
          
          // Функция для проверки связи должности с отделом
          const isPositionLinkedToDepartment = (positionId: number): boolean => {
            // 1. Проверяем связи между должностями в этом отделе
            const hasPositionRelation = positionRelations.some(
              rel =>
                (rel.position_id === positionId ||
                  rel.parent_position_id === positionId) &&
                rel.department_id === currentDepartmentContext && 
                !rel.deleted
            );
            
            if (hasPositionRelation) return true;
            
            // 2. Проверяем привязку должности к отделу
            const hasDepartmentLink = positionsWithDepartments
              .find(p => p.position_id === positionId)
              ?.departments?.some((d: any) => d.department_id === currentDepartmentContext);
            
            if (hasDepartmentLink) return true;
            
            // 3. Проверяем сотрудников в этом отделе
            const hasEmployees = employees.some(
              e =>
                e.position_id === positionId &&
                e.department_id === currentDepartmentContext &&
                !e.deleted
            );
            
            return hasEmployees;
          };
          
          // Фильтруем подчиненных
          filteredSubordinates = filteredSubordinates.filter(subNode => {
            return isPositionLinkedToDepartment(subNode.position.position_id);
          });
          
          // Обновляем информацию о сотрудниках и отделе для каждого подчиненного
          filteredSubordinates = filteredSubordinates.map(subNode => {
            const updatedNode = { ...subNode };
            
            // Фильтруем сотрудников для этого отдела
            updatedNode.employees = employees.filter(
              e =>
                e.position_id === subNode.position.position_id &&
                e.department_id === currentDepartmentContext &&
                !e.deleted
            );
            
            // Добавляем информацию об отделе
            const departmentInfo = departments.find(
              d => d.department_id === currentDepartmentContext
            );
            if (departmentInfo) {
              updatedNode.department = departmentInfo;
            }
            
            return updatedNode;
          });
          
          // Обновляем список подчиненных
          selectedNodeCopy.subordinates = filteredSubordinates;
        }
        
        // Показываем только выбранный узел
        setFilteredHierarchy([selectedNodeCopy]);
      } else {
        // Если должность не найдена, показываем второй уровень иерархии
        if (positionHierarchy[0] && positionHierarchy[0].subordinates) {
          setFilteredHierarchy(positionHierarchy[0].subordinates);
        } else {
          setFilteredHierarchy([]);
        }
      }
    } else {
      // Если должность не выбрана, показываем полную иерархию
      setFilteredHierarchy(positionHierarchy);
    }
  }, [selectedPositionId, currentDepartmentContext, positionHierarchy, departments, employees, positionRelations, positionsWithDepartments]);

  // Если данные еще не загружены, показываем загрузку
  if (
    departments.length === 0 ||
    positions.length === 0 ||
    positionRelations.length === 0
  ) {
    return (
      <div className="loading-message">
        Загрузка организационной структуры...
        {departments.length > 0 &&
          positions.length > 0 &&
          positionRelations.length === 0 && (
            <div>Ожидание загрузки связей между должностями...</div>
          )}
      </div>
    );
  }

  return (
    <div className="org-tree-container">
      {/* Отображаем иерархию должностей как горизонтальное дерево */}
      <div
        className="position-hierarchy"
        style={{ overflowX: "auto", width: "100%" }}
      >
        <div className="organization-controls">
          {selectedPositionId && (
            <div className="position-navigation">
              <button className="back-to-main-hierarchy" onClick={handleGoBack}>
                ← Вернуться к предыдущей структуре
              </button>
            </div>
          )}

          <div className="display-settings-wrapper">
            <DisplaySettings
              showThreeLevels={showThreeLevelsState}
              showVacancies={showVacanciesState}
              onShowThreeLevelsChange={handleThreeLevelsChange}
              onShowVacanciesChange={handleShowVacanciesChange}
            />
          </div>
        </div>

        <PositionTree
          nodes={filteredHierarchy}
          allPositions={positions}
          allEmployees={employees}
          onPositionClick={handlePositionClick}
          handleGoBack={handleGoBack}
          selectedPositionId={selectedPositionId || undefined}
          hierarchyInitialLevels={Number(hierarchyInitialLevels)}
          showThreeLevels={showThreeLevelsState}
          showVacancies={showVacanciesState}
        />
      </div>
    </div>
  );
};

export default OrganizationTreeNew;