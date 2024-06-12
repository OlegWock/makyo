import { minmax } from "@client/utils/animations";
import { useMirrorStateToRef } from "@client/utils/hooks";
import { MessageSchemaType } from "@shared/api";
import { SetStateAction, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useMemo } from "react";

export type MessageTreeNode = {
  message: MessageSchemaType;
  parent: MessageTreeNode | null;
  children: MessageTreeNode[];
};

export type PreferredTreeBranchesMap = Record<number | 'root', number>;

const treeChoicesAtom = atomWithStorage<PreferredTreeBranchesMap>('messageChoices', {} as PreferredTreeBranchesMap, undefined, { getOnInit: true });

export const useTreeChoices = (tree: MessageTreeNode[]) => {
  const setTreeChoices = (action: SetStateAction<PreferredTreeBranchesMap>) => {
    const newValue = typeof action === 'function' ? action(normalizedRef.current) : action;
    setVal(newValue);
  }
  const [val, setVal] = useAtom(treeChoicesAtom);
  const normalized = useMemo(() => {
    const copy = {...val};
    walkOverAllMessagesInTree(tree, (node) => {
      if (copy[node.message.id] === undefined || copy[node.message.id] >= node.children.length) {
        copy[node.message.id] = 0;
      }
    });
    return copy;
  }, [tree, val]);
  const normalizedRef = useMirrorStateToRef(normalized);

  return [normalized, setTreeChoices] as const;
}

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

  return rootMessages.map(message => createNode(message, null)).sort((a, b) => a.message.createdAt - b.message.createdAt);
};

export const getLastMessage = (tree: MessageTreeNode[], treeChoices: PreferredTreeBranchesMap): MessageTreeNode => {
  const branchIndex = treeChoices['root'] ?? 0;
  let currentNode = tree[branchIndex];
  while (currentNode.children.length) {
    const branchIndex = minmax(treeChoices[currentNode.message.id] ?? 0, 0, currentNode.children.length -1);
    currentNode = currentNode.children[branchIndex];
  }

  return currentNode;
};

export const walkOverMessagesTree = (tree: MessageTreeNode[], treeChoices: PreferredTreeBranchesMap, cb: (node: MessageTreeNode) => void | boolean) => {
  const branchIndex = treeChoices['root'] ?? 0;
  let currentNode = tree[branchIndex];
  while (currentNode) {
    const node = currentNode;
    const selectedBranch = minmax(treeChoices[node.message.id] ?? 0, 0, node.children.length - 1);

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
