/**
 * Рисует соединительные линии между узлами организационного дерева
 */
export function drawConnections(
  nodes: any[],
  ctx: CanvasRenderingContext2D,
  scale: number = 1
) {
  // Находим связи между узлами
  const connections = nodes
    .filter(node => node.parentId)
    .map(node => ({
      from: nodes.find(n => n.id === node.parentId),
      to: node
    }))
    .filter(conn => conn.from && conn.to);

  // Настраиваем стиль линий
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2 * scale;

  // Рисуем линии
  connections.forEach(conn => {
    const fromNode = conn.from;
    const toNode = conn.to;
    
    // Вычисляем центры узлов
    const fromX = (fromNode.x + fromNode.width / 2) * scale;
    const fromY = (fromNode.y + fromNode.height) * scale;
    const toX = (toNode.x + toNode.width / 2) * scale;
    const toY = toNode.y * scale;
    
    // Рисуем линию с изгибом
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    
    // Контрольные точки для кривой Безье
    const controlPointY = fromY + (toY - fromY) / 2;
    
    ctx.bezierCurveTo(
      fromX, controlPointY, // контрольная точка 1
      toX, controlPointY,   // контрольная точка 2
      toX, toY              // конечная точка
    );
    
    ctx.stroke();
    
    // Рисуем стрелку
    const arrowSize = 6 * scale;
    const angle = Math.atan2(toY - controlPointY, toX - toX);
    
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - arrowSize * Math.cos(angle - Math.PI / 6),
      toY - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - arrowSize * Math.cos(angle + Math.PI / 6),
      toY - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  });
}

/**
 * Вычисляет начальные позиции для новых узлов дерева
 */
export function calculateInitialPosition(
  parentNode: any,
  existingNodes: any[],
  nodeType: string
) {
  if (!parentNode) {
    // Если нет родительского узла, размещаем в центре видимой области
    return {
      x: window.innerWidth / 2 - 100,
      y: 100
    };
  }
  
  // Получаем существующие дочерние узлы
  const childNodes = existingNodes.filter(
    node => node.parentId === parentNode.id
  );
  
  // Базовое смещение
  const baseOffsetX = 250;
  const baseOffsetY = 150;
  
  if (childNodes.length === 0) {
    // Если нет дочерних узлов, размещаем прямо под родителем
    return {
      x: parentNode.x,
      y: parentNode.y + baseOffsetY
    };
  } else {
    // Если есть дочерние узлы, размещаем справа от последнего
    const lastChild = childNodes[childNodes.length - 1];
    return {
      x: lastChild.x + baseOffsetX,
      y: lastChild.y
    };
  }
}

/**
 * Организует узлы в дереве автоматически
 */
export function organizeTree(
  nodes: any[],
  rootX: number = window.innerWidth / 2,
  rootY: number = 50
) {
  const newNodes = [...nodes];
  
  // Находим корневые узлы
  const rootNodes = newNodes.filter(node => !node.parentId);
  
  // Если нет корневых узлов, нечего организовывать
  if (rootNodes.length === 0) return newNodes;
  
  // Распределяем корневые узлы горизонтально
  const rootSpacing = 600;
  rootNodes.forEach((rootNode, index) => {
    const rootNodeIndex = newNodes.findIndex(node => node.id === rootNode.id);
    newNodes[rootNodeIndex] = {
      ...newNodes[rootNodeIndex],
      x: rootX + (index - Math.floor(rootNodes.length / 2)) * rootSpacing,
      y: rootY
    };
    
    // Организуем дочерние узлы каждого корня
    organizeChildren(
      rootNode.id,
      newNodes,
      newNodes[rootNodeIndex].x,
      newNodes[rootNodeIndex].y,
      150, // вертикальное расстояние между уровнями
      0 // текущий уровень
    );
  });
  
  return newNodes;
}

/**
 * Рекурсивно организует дочерние узлы
 */
function organizeChildren(
  parentId: string,
  nodes: any[],
  parentX: number,
  parentY: number,
  levelHeight: number,
  level: number
) {
  // Находим всех прямых потомков
  const children = nodes.filter(node => node.parentId === parentId);
  
  if (children.length === 0) return;
  
  // Рассчитываем общую ширину для дочерних узлов
  const childSpacing = 250; // расстояние между узлами на одном уровне
  const totalWidth = (children.length - 1) * childSpacing;
  
  // Начальная позиция для первого дочернего узла
  const startX = parentX - totalWidth / 2;
  
  // Располагаем каждый дочерний узел
  children.forEach((child, index) => {
    const childIndex = nodes.findIndex(node => node.id === child.id);
    
    // Обновляем позицию
    nodes[childIndex] = {
      ...nodes[childIndex],
      x: startX + index * childSpacing,
      y: parentY + levelHeight
    };
    
    // Рекурсивно организуем потомков этого узла
    organizeChildren(
      child.id,
      nodes,
      nodes[childIndex].x,
      nodes[childIndex].y,
      levelHeight,
      level + 1
    );
  });
}