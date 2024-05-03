import { MessageSchemaType } from "@shared/api";

export type MessageTreeNode = {
  message: MessageSchemaType;
  parent: MessageTreeNode | null;
  children: MessageTreeNode[];
};

export type PreferredTreeBranchesMap = Record<number | 'root', number>;

export const buildTreeFromMessages = (messages: MessageSchemaType[]) => {
  const messageMap = new Map<number, MessageSchemaType>();
  const childsMap = new Map<number, Array<MessageSchemaType>>();

  let rootMessages: MessageSchemaType[] = [];
  messages.forEach(message => {
    messageMap.set(message.id, message);
    if (message.parentId) {
      let parentMessageChildren = childsMap.get(message.parentId)
      if (!parentMessageChildren) parentMessageChildren = [];
      parentMessageChildren.push(message);
      childsMap.set(message.parentId, parentMessageChildren);
    } else {
      rootMessages.push(message);
    }
  });

  if (!rootMessages.length) {
    throw new Error('no root message found');
  }

  const createNode = (message: MessageSchemaType, parent: MessageTreeNode | null): MessageTreeNode => {
    const childrenNodes: MessageTreeNode[] = [];
    const children = childsMap.get(message.id);

    const node = {
      message,
      children: childrenNodes,
      parent,
    }
    children?.forEach(childMessage => {
      const childNode = createNode(childMessage, node);
      childrenNodes.push(childNode);
    });
    childrenNodes.sort((a, b) => a.message.createdAt - b.message.createdAt);
    return node;
  };

  return rootMessages.map(message => createNode(message, null));
};

export const getLastMessage = (tree: MessageTreeNode[], treeChoices: PreferredTreeBranchesMap) => {
  const branchIndex = treeChoices['root'] ?? 0;
  let currentNode = tree[branchIndex];
  while (currentNode.children.length) {
    const branchIndex = treeChoices[currentNode.message.id] ?? 0;
    currentNode = currentNode.children[branchIndex];
  }

  return currentNode;
};

export const walkOverMessagesTree = (tree: MessageTreeNode[], treeChoices: PreferredTreeBranchesMap, cb: (node: MessageTreeNode) => void | boolean) => {
  const branchIndex = treeChoices['root'] ?? 0;
  let currentNode = tree[branchIndex];
  while (currentNode) {
    const node = currentNode;
    const selectedBranch = treeChoices[node.message.id] ?? 0;

    const result = cb(node);
    if (result === false) {
      break;
    }

    currentNode = currentNode.children[selectedBranch];
  }
};

export const walkOverAllMessagesInTree = (tree: MessageTreeNode[], cb: (node: MessageTreeNode) => void | boolean) => {
  let nodesToWalk = tree;
  while (nodesToWalk.length) {
    for (const node of nodesToWalk) {
      const result = cb(node);
      if (result === false) {
        break;
      }
    }

    nodesToWalk = nodesToWalk.flatMap(n => n.children);
  }
};

export const mapOverMessagesTree = <T>(tree: MessageTreeNode[], treeChoices: PreferredTreeBranchesMap, cb: (node: MessageTreeNode) => T) => {
  let result: T[] = [];
  walkOverMessagesTree(tree, treeChoices, (node) => {
    result.push(cb(node));
  });
  return result;
};
