import { createStrictContext } from "@client/utils/context";

export const [ChatPageContextProvider, useChatPageContext] = createStrictContext<{
  chatId: number,
}>('ChatPageContext');
