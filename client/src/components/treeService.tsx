// treeService.tsx
import { useState, useEffect } from "react";

export type Dept = {
  department_id: number;
  name: string;
  parent_department_id: number | null;
  parent_position_id: number | null;
};
export type Pos = { position_id: number; name: string };
export type PosDept = {
  position_link_id: number;
  position_id: number;
  department_id: number;
};
export type PosPos = {
  position_relation_id: number;
  position_id: number;
  parent_position_id: number;
  department_id: number | null;
};

export type TreeNode = {
  id: string;
  name: string;
  type: "department" | "position";
  children: TreeNode[];
};

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json();
}

export async function fetchTree(): Promise<TreeNode[]> {
  const [depts, poses, pd, pp] = await Promise.all([
    fetchJSON<Dept[]>("/api/departments"),
    fetchJSON<Pos[]>("/api/positions"),
    fetchJSON<PosDept[]>("/api/position_department"),
    fetchJSON<PosPos[]>("/api/position_position"),
  ]);
  const deptMap = new Map(
    depts.map((d) => [d.department_id, { ...d, children: [] as TreeNode[] }]),
  );
  const posMap = new Map(
    poses.map((p) => [p.position_id, { ...p, children: [] as TreeNode[] }]),
  );
  const tree: TreeNode[] = [];

  // attach departments
  depts.forEach((d) => {
    const node: TreeNode = {
      id: `d${d.department_id}`,
      name: d.name,
      type: "department",
      children: deptMap.get(d.department_id)!.children,
    };
    if (d.parent_position_id) {
      const ppNode = posMap.get(d.parent_position_id)!;
      ppNode.children.push(node);
    } else if (d.parent_department_id) {
      deptMap.get(d.parent_department_id)!.children.push(node);
    } else tree.push(node);
  });

  // build position->position map
  const childPos = new Map<number, TreeNode[]>();
  pp.forEach((r) => {
    const node: TreeNode = {
      id: `p${r.position_id}`,
      name: posMap.get(r.position_id)!.name,
      type: "position",
      children: [],
    };
    if (!childPos.has(r.parent_position_id))
      childPos.set(r.parent_position_id, []);
    childPos.get(r.parent_position_id)!.push(node);
  });

  // attach positions
  pd.forEach((r) => {
    const node: TreeNode = {
      id: `p${r.position_id}`,
      name: posMap.get(r.position_id)!.name,
      type: "position",
      children: childPos.get(r.position_id) || [],
    };
    const ppos = pp.find((x) => x.position_id === r.position_id);
    if (ppos) {
      // ignore dept if has parent position
      const parent = posMap.get(ppos.parent_position_id)!;
      parent.children.push(node);
    } else {
      deptMap.get(r.department_id)!.children.push(node);
    }
  });

  return tree;
}

// React hook
export function useTree() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  useEffect(() => {
    fetchTree().then(setTree);
  }, []);
  return tree;
}
