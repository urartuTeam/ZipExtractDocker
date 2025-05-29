import { useMemo } from 'react';
import OrgUnitNode from './OrgUnitNode';
import { OrgUnit, OrgUnitWithChildren } from '@shared/schema';

interface OrgTreeProps {
  orgUnits: OrgUnit[];
  onAddUnit: (parentId: number) => void;
}

export default function OrgTree({ orgUnits, onAddUnit }: OrgTreeProps) {
  // Build the tree structure from flat array
  const treeData = useMemo(() => {
    const buildTree = (): OrgUnitWithChildren[] => {
      const orgUnitMap = new Map<number, OrgUnitWithChildren>();
      
      // Create mapping of id to orgUnit with children array
      orgUnits.forEach(unit => {
        orgUnitMap.set(unit.id, { ...unit, children: [] });
      });
      
      // Build the tree by adding children to their parents
      const rootUnits: OrgUnitWithChildren[] = [];
      
      orgUnits.forEach(unit => {
        const currentUnit = orgUnitMap.get(unit.id);
        if (currentUnit) {
          if (unit.parentId === null) {
            rootUnits.push(currentUnit);
          } else {
            const parentUnit = orgUnitMap.get(unit.parentId);
            if (parentUnit) {
              parentUnit.children.push(currentUnit);
            }
          }
        }
      });
      
      return rootUnits;
    };
    
    return buildTree();
  }, [orgUnits]);

  if (!treeData.length) {
    return <div className="text-center my-8">Нет данных для отображения</div>;
  }

  return (
    <div className="w-full h-full flex-1 overflow-auto">
      <div className="tree-view flex justify-center p-8">
        {treeData.map(unit => (
          <OrgUnitNode 
            key={unit.id} 
            unit={unit} 
            onAddChild={() => onAddUnit(unit.id)} 
          />
        ))}
      </div>
    </div>
  );
}
