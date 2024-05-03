import { MessageTreeNode, PreferredTreeBranchesMap } from "@client/routes/ChatPage/tree";
import { createStrictContext } from "@client/utils/context";
import { SetStateAction } from "react";

export const [ChatPageContextProvider, useChatPageContext] = createStrictContext<{
  chatId: number,
  providerId: string,
  messagesTree: MessageTreeNode[],
  treeChoices: PreferredTreeBranchesMap,
  setTreeChoices: (update: (p: PreferredTreeBranchesMap) => PreferredTreeBranchesMap) => void,
}>('ChatPageContext');
