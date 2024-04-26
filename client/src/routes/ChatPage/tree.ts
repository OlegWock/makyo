import { MessageSchemaType } from "@shared/api";

export type MessageTreeNode = {
  message: MessageSchemaType;
  parent: MessageTreeNode | null;
  children: MessageTreeNode[];
}

export const buildTreeFromMessages = (messages: MessageSchemaType[]) => {
  const messageMap = new Map<number, MessageSchemaType>();
  const childsMap = new Map<number, Array<MessageSchemaType>>();

  let rootMessage: MessageSchemaType | undefined = undefined;
  messages.forEach(message => {
    messageMap.set(message.id, message);
    if (message.parentId) {
      let parentMessageChildren = childsMap.get(message.parentId)
      if (!parentMessageChildren) parentMessageChildren = [];
      parentMessageChildren.push(message);
      childsMap.set(message.parentId, parentMessageChildren);
    } else {
      rootMessage = message;
    }
  });

  if (!rootMessage) {
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
    return node;
  };

  const rootNode = createNode(rootMessage, null);
  return rootNode;
};
