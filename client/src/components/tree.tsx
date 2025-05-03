import React, { useEffect, useState } from "react";

type NodeType = "department" | "position";

interface Employee {
  id: number;
  fullName: string;
}
interface TreeNodeData {
  id: string;
  name: string;
  type: NodeType;
  children: TreeNodeData[];
  departmentId?: number;
  positionId?: number;
  sort: number;
  employee?: Employee;
}

interface TreeResponse {
  status: string;
  data: TreeNodeData[];
}

const TreeComponent: React.FC = () => {
  const [tree, setTree] = useState<TreeNodeData[]>([]);

  useEffect(() => {
    fetch("/api/tree")
      .then((res) => res.json())
      .then((data: TreeResponse) => setTree(data.data));
  }, []);

  const renderNode = (node: TreeNodeData, depth: number) => {
    const isTopPos = node.type === "position" && depth < 2;
    const baseClass = "position-card";
    const typeClass =
      node.type === "department"
        ? "departmentClass department-card"
        : "positionClass";
    const topClass = isTopPos ? "topTopPositionClass" : "";
    const title = node.name;
    const content =
      node.type === "department" ? (
        <div className="department-type">Отдел</div>
      ) : node.employee ? (
        <div className="employee-names">
          <div className="employee-name">{node.employee.fullName}</div>
        </div>
      ) : (
        <div className="position-vacant">Вакантная должность</div>
      );

    return (
      <div className="tree-node" key={node.id}>
        <div className="tree-branch">
          <div className="tree-node-container">
            <div
              className={`${baseClass} ${typeClass} ${topClass}`}
              style={{ cursor: "pointer", position: "relative" }}
            >
              <div className="position-title">{title}</div>
              <div className="position-divider" />
              {content}
            </div>
          </div>
          {node.children.length > 0 && (
            <div className="subordinates-container">
              <div className="tree-branch-connections">
                <div className="tree-branch-line" />
              </div>
              <div
                className="subordinate-branch"
                style={{ 
                  minWidth: node.children.length * 240, 
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  flexWrap: 'wrap'
                }}
              >
                {node.children.map((child) => renderNode(child, depth + 1))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="tree-root" style={{ minWidth: 'max-content', overflow: 'visible' }}>
      {tree.map((node) => renderNode(node, 0))}
    </div>
  );
};

export default TreeComponent;
