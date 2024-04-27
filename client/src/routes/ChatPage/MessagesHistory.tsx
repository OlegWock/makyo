import { UIEventHandler, useRef } from 'react';
import styles from './ChatPage.module.scss';
import { useMount } from '@client/utils/hooks';
import { MessageBubble, MessageBubbleActionsProp } from '@client/components/MessageBubble';
import { useDeleteMessageMutation, useDuplicateMessageMutation, useEditMessageMutation, useRegenerateMessageMutation } from '@client/api';
import { useChatPageContext } from '@client/routes/ChatPage/context';
import { minmax } from '@client/utils/animations';
import { mapOverMessagesTree, MessageTreeNode } from '@client/routes/ChatPage/tree';
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

  const onEditMessage = (node: MessageTreeNode, text: string, regenerateResponse: boolean) => {
    editMessage.mutateAsync({ messageId: node.message.id, text, regenerateResponse }).then(() => {
      if (regenerateResponse) {
        const parentId = node.parent ? node.parent.message.id : 'root';
        const parentChildren = node.parent ? node.parent.children : messagesTree;
        setTreeChoices((draft) => {
          draft.set(parentId, parentChildren.length);
        });
      }
    });
  };

  const { chatId, messagesTree, treeChoices, setTreeChoices } = useChatPageContext();
  const regenerateMessage = useRegenerateMessageMutation(chatId);
  const duplicateMessage = useDuplicateMessageMutation(chatId);
  const editMessage = useEditMessageMutation(chatId);
  const deleteMessage = useDeleteMessageMutation(chatId);

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
    const parentId = parent?.message.id ?? 'root';
    const parentChildren = parent?.children ?? messagesTree;
    const totalVariants = parentChildren.length ?? 1;
    const currentVariantIndex = (treeChoices.get(parentId) ?? 0) + 1;
    const isSingleRootMessage = !parent && totalVariants === 1;

    const sender = message.sender === 'user' ? 'User' : modelName ?? 'LLM';

    const sharedActions: Partial<MessageBubbleActionsProp> = {
      variants: {
        current: currentVariantIndex,
        total: totalVariants,
        onSwitchVariant(forward) {
          // Here we need to modify parent preferred branch
          setTreeChoices((draft) => {
            const current = draft.get(parentId) ?? 0;
            const target = current + (forward ? 1 : -1);
            draft.set(parentId, minmax(target, 0, parentChildren.length - 1));
          });
        },
      },
      editing: {
        allowRegenerateResponse: message.sender === 'user',
        onEdit: (text, regenerateMessage) => onEditMessage(node, text, regenerateMessage),
      },
      onDelete: isSingleRootMessage ? undefined : async () => {
        await deleteMessage.mutateAsync(message.id);
        const treeChoiceOutOfBounds = (treeChoices.get(parentId) ?? 0) > (parentChildren.length - 2);
        if (treeChoiceOutOfBounds) {
          setTreeChoices(draft => {
            draft.set(parentId, parentChildren.length - 2);
          });
        }
      }
    };
    const actions: MessageBubbleActionsProp = message.sender === 'user' ? {
      ...sharedActions,
    } : {
      ...sharedActions,
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
    };
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
