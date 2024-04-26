import { MessageTreeNode } from "@client/routes/ChatPage/tree";
import { createStrictContext } from "@client/utils/context";
import { Updater } from "use-immer";

export const [ChatPageContextProvider, useChatPageContext] = createStrictContext<{
  chatId: number,
  messagesTree: MessageTreeNode,
  treeChoices: Map<number, number>,
  setTreeChoices: Updater<Map<number, number>>,
}>('ChatPageContext');
