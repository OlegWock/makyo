import { MessageTreeNode, PreferredTreeBranchesMap } from "@client/routes/ChatPage/tree";
import { createStrictContext } from "@client/utils/context";
import { ChatWithMessagesSchemaType } from "@shared/api";

export const [ChatPageContextProvider, useChatPageContext] = createStrictContext<{
  chatId: number,
  chatInfo: ChatWithMessagesSchemaType,
  providerId: string,
  messagesTree: MessageTreeNode[],
  treeChoices: PreferredTreeBranchesMap,
  setTreeChoices: (update: (p: PreferredTreeBranchesMap) => PreferredTreeBranchesMap) => void,
}>('ChatPageContext');
