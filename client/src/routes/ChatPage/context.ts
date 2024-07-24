import { createStrictContext } from "@client/utils/context";
import { ChatWithMessagesSchemaType } from "@shared/api";
import { MotionRectReadOnly } from "react-use-motion-measure";

export const [ChatPageContextProvider, useChatPageContext] = createStrictContext<{
  chatId: number,
  viewportBounds: MotionRectReadOnly,
  chatInfo: ChatWithMessagesSchemaType,
  providerId: string,
  defaultScrollTo: string | undefined,
}>('ChatPageContext');
