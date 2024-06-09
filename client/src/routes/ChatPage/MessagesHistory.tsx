import { UIEventHandler, useRef } from 'react';
import styles from './ChatPage.module.scss';
import { useMount } from '@client/utils/hooks';
import { MessageBubble, MessageBubbleActionsProp } from '@client/components/MessageBubble';
import { useDeleteMessageMutation, useDuplicateMessageMutation, useEditMessageMutation, usePersonas, useRegenerateMessageMutation } from '@client/api';
import { useChatPageContext } from '@client/routes/ChatPage/context';
import { minmax } from '@client/utils/animations';
import { mapOverMessagesTree, MessageTreeNode } from '@client/routes/ChatPage/tree';
import useMotionMeasure from 'react-use-motion-measure';
import { useMotionValueEvent } from 'framer-motion';
import { ProviderIcon } from '@client/components/icons';
import { ScrollArea } from '@client/components/ScrollArea';
import { produce } from 'immer';
import { iife } from '@shared/utils';

export type MessagesHistoryProps = {

};

export const MessagesHistory = ({ }: MessagesHistoryProps) => {
  const onScroll: UIEventHandler<HTMLDivElement> = (e) => {
    const diff = Math.abs((e.currentTarget.scrollTop + e.currentTarget.clientHeight) - e.currentTarget.scrollHeight);
    const scrolledToBottom = diff < 40;
    shouldControlScrollRef.current = scrolledToBottom;
  };

  const onEditMessage = (node: MessageTreeNode, text: string, regenerateResponse: boolean) => {
    editMessage.mutateAsync({ chatId, payload: { messageId: node.message.id, text, regenerateResponse } }).then(() => {
      if (regenerateResponse) {
        const parentId = node.parent ? node.parent.message.id : 'root';
        const parentChildren = node.parent ? node.parent.children : messagesTree;
        setTreeChoices((p) => produce(p, (draft) => {
          draft[parentId] = parentChildren.length;
        }));
      }
    });
  };

  const { chatId, messagesTree, treeChoices, setTreeChoices, chatInfo, setMessageText, sendMessage } = useChatPageContext();

  const { data: personas } = usePersonas();
  const regenerateMessage = useRegenerateMessageMutation();
  const duplicateMessage = useDuplicateMessageMutation();
  const editMessage = useEditMessageMutation();
  const deleteMessage = useDeleteMessageMutation();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const shouldControlScrollRef = useRef(true);
  const [messagesContainerRef, messagesContainerBounds] = useMotionMeasure();
  useMotionValueEvent(messagesContainerBounds.height, 'change', (val) => {
    if (messagesContainerBounds.height.getPrevious() === 0) return;
    if (shouldControlScrollRef.current) {
      wrapperRef.current?.scrollTo({ top: wrapperRef.current.scrollHeight });
    }
  });

  const bubbles = mapOverMessagesTree(messagesTree, treeChoices, (node) => {
    const { parent, message } = node;
    const parentId = parent?.message.id ?? 'root';
    const parentChildren = parent?.children ?? messagesTree;
    const totalVariants = parentChildren.length ?? 1;
    const currentVariantIndex = (treeChoices[parentId] ?? 0) + 1;
    const isSingleRootMessage = !parent && totalVariants === 1;
    const isSingleAiMessage = message.sender === 'ai' && totalVariants === 1;

    const icon = iife(() => {
      if (message.sender !== 'ai') return null;
      if (chatInfo.chat.personaId) {
        const persona = personas.find(p => p.id === chatInfo.chat.personaId);
        if (persona) {
          return <div className={styles.personaAvatar}>{persona.avatar}</div>
        }
      }

      return (<ProviderIcon provider={message.providerId!} />);
    });
    const name = iife(() => {
      if (message.sender === 'ai' && chatInfo.chat.personaId) {
        const persona = personas.find(p => p.id === chatInfo.chat.personaId);
        if (persona) {
          return `${persona.name} (${message.senderName})`;
        }
      }

      return message.senderName;
    })
    const sender = <>
      {icon}
      {name}
    </>;

    const sharedActions: Partial<MessageBubbleActionsProp> = {
      copy: !message.error,
      variants: {
        current: currentVariantIndex,
        total: totalVariants,
        onSwitchVariant(forward) {
          // Here we need to modify parent preferred branch
          setTreeChoices((p) => produce(p, (draft) => {
            const current = draft[parentId] ?? 0;
            const target = current + (forward ? 1 : -1);
            draft[parentId] = minmax(target, 0, parentChildren.length - 1);
          }));
        },
      },
      editing: message.error ? undefined : {
        allowRegenerateResponse: message.sender === 'user',
        onEdit: (text, regenerateMessage) => onEditMessage(node, text, regenerateMessage),
      },
      onDelete: (isSingleRootMessage || isSingleAiMessage) ? undefined : async () => {
        await deleteMessage.mutateAsync({ chatId, messageId: message.id });
        const treeChoiceOutOfBounds = (treeChoices[parentId] ?? 0) > (parentChildren.length - 2) && parentChildren.length > 1;
        if (treeChoiceOutOfBounds) {
          setTreeChoices((p) => produce(p, (draft) => {
            draft[parentId] = parentChildren.length - 2;
          }));
        }
      }
    };
    const actions: MessageBubbleActionsProp = message.sender === 'user' ? {
      ...sharedActions,
    } : {
      ...sharedActions,
      onRegenerate: async () => {
        await regenerateMessage.mutateAsync({ chatId, messageId: message.id });
        setTreeChoices((p) => produce(p, (draft) => {
          draft[parent!.message.id] = parent!.children.length;
        }));
      },
      onDuplicate: message.error ? undefined : async () => {
        await duplicateMessage.mutateAsync({ chatId, messageId: message.id })
        setTreeChoices((p) => produce(p, (draft) => {
          draft[parent!.message.id] = parent!.children.length;
        }));
      },
    };
    return (
      <MessageBubble
        senderName={sender}
        message={message}
        actions={actions}
        key={message.id}
        onSelectionAction={(text, send) => {
          if (send) sendMessage(text);
          else setMessageText(text);
        }}
      />
    );
  });

  useMount(() => {
    wrapperRef.current?.scrollTo({ top: wrapperRef.current.scrollHeight });
  });


  return (<ScrollArea className={styles.MessagesHistory} onScroll={onScroll} viewportRef={wrapperRef}>
    <div className={styles.messagesWrapper} ref={messagesContainerRef}>
      {bubbles}
    </div>
    {/* <pre>{JSON.stringify(messages, null, 4)}</pre> */}
  </ScrollArea>);
};
