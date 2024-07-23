import { MessageNodeType } from "@client/routes/ChatPage/types";
import { Edge } from "@xyflow/react";

const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 100;
const HORIZONTAL_SPACING = 60;
const VERTICAL_SPACING = 100;

type Node = Pick<MessageNodeType, 'id' | 'measured' | 'position' | 'data'>;

export function layoutNodes<T extends Node>(_nodes: T[], edges: Edge[]): T[] {
  const nodes = structuredClone(_nodes);
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const childrenMap = new Map<string, string[]>();
  const rootNodes: Node[] = [];

  for (const edge of edges) {
    if (!childrenMap.has(edge.source)) {
      childrenMap.set(edge.source, []);
    }
    childrenMap.get(edge.source)!.push(edge.target);
  }

  for (const node of nodes) {
    if (!edges.some(edge => edge.target === node.id)) {
      rootNodes.push(node);
    }
  }

  for (const children of childrenMap.values()) {
    children.sort((a, b) => {
      const nodeA = nodeMap.get(a)!;
      const nodeB = nodeMap.get(b)!;
      return (nodeA.data.createdAt ?? Infinity) - (nodeB.data.createdAt ?? Infinity);
    });
  }

  rootNodes.sort((a, b) => (a.data.createdAt ?? Infinity) - (b.data.createdAt ?? Infinity));

  const levels: Node[][] = [];
  populateLevels(rootNodes, 0, levels, childrenMap, nodeMap);

  let currentY = 0;
  for (const level of levels) {
    const maxHeight = Math.max(...level.map(node => getNodeHeight(node)));
    for (const node of level) {
      node.position.y = currentY;
    }
    currentY += maxHeight + VERTICAL_SPACING;
  }

  let currentX = 0;
  for (const root of rootNodes) {
    const subtreeWidth = positionSubtree(root, currentX, childrenMap, nodeMap);
    currentX += subtreeWidth + HORIZONTAL_SPACING;
  }

  return nodes;
}

function populateLevels(
  nodes: Node[],
  level: number,
  levels: Node[][],
  childrenMap: Map<string, string[]>,
  nodeMap: Map<string, Node>
): void {
  if (!levels[level]) {
    levels[level] = [];
  }
  levels[level].push(...nodes);
  for (const node of nodes) {
    const children = childrenMap.get(node.id) || [];
    if (children.length > 0) {
      populateLevels(children.map(id => nodeMap.get(id)!), level + 1, levels, childrenMap, nodeMap);
    }
  }
}

function positionSubtree(
  node: Node,
  startX: number,
  childrenMap: Map<string, string[]>,
  nodeMap: Map<string, Node>
): number {
  const children = childrenMap.get(node.id) || [];
  if (children.length === 0) {
    node.position.x = startX + getNodeWidth(node) / 2;
    return getNodeWidth(node);
  }

  let totalChildrenWidth = 0;
  for (const childId of children) {
    const child = nodeMap.get(childId)!;
    totalChildrenWidth += positionSubtree(child, startX + totalChildrenWidth, childrenMap, nodeMap);
    if (childId !== children[children.length - 1]) {
      totalChildrenWidth += HORIZONTAL_SPACING;
    }
  }

  const leftmostChild = nodeMap.get(children[0])!;
  const rightmostChild = nodeMap.get(children[children.length - 1])!;
  const childrenCenter = (leftmostChild.position.x! + rightmostChild.position.x!) / 2;

  node.position.x = childrenCenter;

  return Math.max(totalChildrenWidth, getNodeWidth(node));
}

function getNodeWidth(node: Node): number {
  return node.measured?.width ?? DEFAULT_WIDTH;
}

function getNodeHeight(node: Node): number {
  return node.measured?.height ?? DEFAULT_HEIGHT;
}
