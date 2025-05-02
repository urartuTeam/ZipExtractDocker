import { db } from "./db";
import { departments, positions, position_department, position_position } from "@shared/schema";
import { eq } from "drizzle-orm";

export type TreeNode = {
  id: string;
  name: string;
  type: "department" | "position";
  children: TreeNode[];
};

export async function fetchTree(): Promise<TreeNode[]> {
  // Получаем все необходимые данные из базы
  const depts = await db.select().from(departments).where(eq(departments.deleted, false));
  const poses = await db.select().from(positions).where(eq(positions.deleted, false));
  const pd = await db.select().from(positionDepartments).where(eq(positionDepartments.deleted, false));
  const pp = await db.select().from(positionPositions).where(eq(positionPositions.deleted, false));

  // Создаем карты для быстрого доступа
  const deptMap = new Map(
    depts.map((d) => [d.department_id, { ...d, children: [] as TreeNode[] }]),
  );
  const posMap = new Map(
    poses.map((p) => [p.position_id, { ...p, children: [] as TreeNode[] }]),
  );
  const tree: TreeNode[] = [];

  // Прикрепляем отделы к структуре
  depts.forEach((d) => {
    const node: TreeNode = {
      id: `d${d.department_id}`,
      name: d.name,
      type: "department",
      children: deptMap.get(d.department_id)!.children,
    };
    if (d.parent_position_id) {
      const ppNode = posMap.get(d.parent_position_id);
      if (ppNode) {
        if (!ppNode.children) ppNode.children = [];
        ppNode.children.push(node);
      }
    } else if (d.parent_department_id) {
      const parentDept = deptMap.get(d.parent_department_id);
      if (parentDept) {
        if (!parentDept.children) parentDept.children = [];
        parentDept.children.push(node);
      }
    } else {
      tree.push(node);
    }
  });

  // Строим карту position->position
  const childPos = new Map<number, TreeNode[]>();
  pp.forEach((r) => {
    const pos = posMap.get(r.position_id);
    if (pos) {
      const node: TreeNode = {
        id: `p${r.position_id}`,
        name: pos.name,
        type: "position",
        children: [],
      };
      if (!childPos.has(r.parent_position_id)) {
        childPos.set(r.parent_position_id, []);
      }
      const children = childPos.get(r.parent_position_id);
      if (children) {
        children.push(node);
      }
    }
  });

  // Прикрепляем должности
  pd.forEach((r) => {
    const pos = posMap.get(r.position_id);
    if (pos) {
      const node: TreeNode = {
        id: `p${r.position_id}`,
        name: pos.name,
        type: "position",
        children: childPos.get(r.position_id) || [],
      };
      // Проверяем, есть ли у должности родительская должность
      const ppos = pp.find((x) => x.position_id === r.position_id);
      if (ppos) {
        // Если есть родительская должность, игнорируем связь с отделом
        const parent = posMap.get(ppos.parent_position_id);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(node);
        }
      } else {
        // Если нет родительской должности, привязываем к отделу
        const dept = deptMap.get(r.department_id);
        if (dept) {
          if (!dept.children) dept.children = [];
          dept.children.push(node);
        }
      }
    }
  });

  console.log(`Построено дерево с ${tree.length} корневыми узлами`);
  return tree;
}