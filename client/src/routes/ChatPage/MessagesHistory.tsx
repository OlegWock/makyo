import { ReactNode, useMemo, useRef } from 'react';
import { useImmer } from 'use-immer';
import { MessageSchemaType } from '@shared/api';
import styles from './ChatPage.module.scss';
import { useMount } from '@client/utils/hooks';
import { buildTreeFromMessages } from './tree';
import { MessageBubble } from '@client/components/MessageBubble';
import { useRegenerateMessageMutation } from '@client/api';
import { useChatPageContext } from '@client/routes/ChatPage/context';
import { minmax } from '@client/utils/animations';

export type MessagesHistoryProps = {
  messages: MessageSchemaType[];
  modelName?: string;
};

export const MessagesHistory = ({ messages: messagesFromProps, modelName }: MessagesHistoryProps) => {
  const { chatId } = useChatPageContext();
  const regenerateMessage = useRegenerateMessageMutation(chatId);

  const tree = useMemo(() => buildTreeFromMessages(messagesFromProps), [messagesFromProps]);
  const [treeChoices, setTreeChoices] = useImmer(() => new Map<number, number>());
  const wrapperRef = useRef<HTMLDivElement>(null);

  let bubbles: ReactNode[] = [];
  let currentNode = tree;
  while (currentNode) {
    const node = currentNode;
    const parent = node.parent;

    // This is a bit confusing, because we use different values for selecting 
    // which branch to render and for displaying variants count
    // Essentially, selectedBranch is index of node we need to render next
    const selectedBranch = treeChoices.get(node.message.id) ?? 0;
    // And currentVariantIndex and totalVariants are for UI, and we need to take them from parent
    const totalVariants = parent?.children.length ?? 1;
    const currentVariantIndex = (parent ? treeChoices.get(parent.message.id) ?? 0 : 0) + 1;

    const sender = currentNode.message.sender === 'user' ? 'User' : modelName ?? 'LLM';
    bubbles.push(
      <MessageBubble
        currentVariantIndex={currentVariantIndex}
        totalVariants={totalVariants}
        onSwitchVariant={(forward) => {
          // Here we need to modify parent preferred branch
          if (!parent) return;
          setTreeChoices((draft) => {
            const current = draft.get(parent.message.id) ?? 0;
            const target = current + (forward ? 1 : -1);
            draft.set(parent.message.id, minmax(target, 0, parent.children.length -1));
          });
        }}
        onRegenerate={node.message.sender === 'user' ? undefined : async () => {
          await regenerateMessage.mutateAsync({messageId: node.message.id});
          setTreeChoices((draft) => {
            draft.set(node.parent!.message.id, node.parent!.children.length);
          });
        }}
        senderName={sender}
        message={currentNode.message}
        key={currentNode.message.id}
      />
    );

    currentNode = currentNode.children[selectedBranch];
  }
  bubbles.reverse();

  useMount(() => {
    wrapperRef.current?.scrollTo({ top: wrapperRef.current.scrollHeight });
  })

  return (<div className={styles.MessagesHistory} ref={wrapperRef}>
    <div className={styles.messagesWrapper}>
      {bubbles}
    </div>
    {/* <pre>{JSON.stringify(messages, null, 4)}</pre> */}
  </div>);
};
