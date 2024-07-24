import { MessageTreeNode, PreferredTreeBranchesMap } from "@client/routes/ChatPage/tree";
import { createStrictContext } from "@client/utils/context";
import { ChatWithMessagesSchemaType } from "@shared/api";
import { MotionRectReadOnly } from "react-use-motion-measure";

export const [ChatPageContextProvider, useChatPageContext] = createStrictContext<{
  chatId: number,
  viewportBounds: MotionRectReadOnly,
  chatInfo: ChatWithMessagesSchemaType,
  providerId: string,
  setMessageText: (val: string) => void;
  sendMessage: (message: string) => void;
  messagesTree: MessageTreeNode[],
  treeChoices: PreferredTreeBranchesMap,
  setTreeChoices: (update: (p: PreferredTreeBranchesMap) => PreferredTreeBranchesMap) => void,
}>('ChatPageContext');
