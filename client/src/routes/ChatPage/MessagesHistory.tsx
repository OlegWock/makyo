import { UIEventHandler, useRef } from 'react';
import styles from './ChatPage.module.scss';
import { useMount } from '@client/utils/hooks';
import { MessageBubble, MessageBubbleActionsProp } from '@client/components/MessageBubble';
import { useDuplicateMessageMutation, useRegenerateMessageMutation } from '@client/api';
import { useChatPageContext } from '@client/routes/ChatPage/context';
import { minmax } from '@client/utils/animations';
import { mapOverMessagesTree } from '@client/routes/ChatPage/tree';
import useMotionMeasure from 'react-use-motion-measure';
import { useMotionValueEvent } from 'framer-motion';

export type MessagesHistoryProps = {
  modelName?: string;
};

export const MessagesHistory = ({ modelName }: MessagesHistoryProps) => {
  const onScroll: UIEventHandler<HTMLDivElement> = (e) => {
    const diff = Math.abs((e.currentTarget.scrollTop + e.currentTarget.clientHeight) - e.currentTarget.scrollHeight);
    const scrolledToBottom = diff < 40;
    shouldControlScrollRef.current = scrolledToBottom;
  };

  const { chatId, messagesTree, treeChoices, setTreeChoices } = useChatPageContext();
  const regenerateMessage = useRegenerateMessageMutation(chatId);
  const duplicateMessage = useDuplicateMessageMutation(chatId);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const shouldControlScrollRef = useRef(true);
  const [messagesContainerRef, messagesContainerBounds] = useMotionMeasure();
  useMotionValueEvent(messagesContainerBounds.height, 'change', (val) => {
    if (messagesContainerBounds.height.getPrevious() === 0) return;
    if (shouldControlScrollRef.current) {
      wrapperRef.current?.scrollTo({ top: wrapperRef.current.scrollHeight });
    }
  })

  const bubbles = mapOverMessagesTree(messagesTree, treeChoices, (node) => {
    const { parent, message } = node;
    const totalVariants = parent?.children.length ?? 1;
    const currentVariantIndex = (parent ? treeChoices.get(parent.message.id) ?? 0 : 0) + 1;

    const sender = message.sender === 'user' ? 'User' : modelName ?? 'LLM';

    const actions = message.sender === 'user' ? undefined : {
      variants: {
        current: currentVariantIndex,
        total: totalVariants,
        onSwitchVariant(forward) {
          // Here we need to modify parent preferred branch
          if (!parent) return;
          setTreeChoices((draft) => {
            const current = draft.get(parent.message.id) ?? 0;
            const target = current + (forward ? 1 : -1);
            draft.set(parent.message.id, minmax(target, 0, parent.children.length - 1));
          });
        },
      },
      onRegenerate: async () => {
        await regenerateMessage.mutateAsync({ messageId: message.id });
        setTreeChoices((draft) => {
          draft.set(parent!.message.id, parent!.children.length);
        });
      },
      onDuplicate: async () => {
        await duplicateMessage.mutateAsync({ messageId: message.id })
        setTreeChoices((draft) => {
          draft.set(parent!.message.id, parent!.children.length);
        });
      },
    } satisfies MessageBubbleActionsProp;
    return (
      <MessageBubble
        senderName={sender}
        message={message}
        actions={actions}
        key={message.id}
      />
    );
  });

  useMount(() => {
    wrapperRef.current?.scrollTo({ top: wrapperRef.current.scrollHeight });
  })

  return (<div className={styles.MessagesHistory} onScroll={onScroll} ref={wrapperRef}>
    <div className={styles.messagesWrapper} ref={messagesContainerRef}>
      {bubbles}
    </div>
    {/* <pre>{JSON.stringify(messages, null, 4)}</pre> */}
  </div>);
};
