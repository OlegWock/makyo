import { MessageSchemaType, MessageSearchResultSchemaType } from '@shared/api';
import styles from './MessageCard.module.scss';
import { MessageBubble } from '@client/components/MessageBubble';
import { ProviderIcon } from '@client/components/icons';
import { useModels } from '@client/api';
import { useMemo, useState } from 'react';
import { Markdown } from '@client/components/Markdown';
import useMeasure from 'react-use-measure';
import clsx from 'clsx';
import { Button } from '@client/components/Button';
import { Link } from '@client/components/Link';
import { HiChevronRight } from 'react-icons/hi2';

export type MessageCardProps = {
  message: MessageSearchResultSchemaType,
};

export const MessageCard = ({ message }: MessageCardProps) => {
  const [ref, bound] = useMeasure();
  const [expaned, setExpanded] = useState(false);
  const { data: providers } = useModels();

  const usedModel = useMemo(() => {
    const provider = providers.find(p => p.provider.id === message.providerId);
    const model = provider?.models.find(m => m.id === message.modelId);
    return model?.name;
  }, [providers, message.modelId, message.providerId]);

  const collapsed = bound.height > 400 && !expaned;
  return (<div className={clsx(styles.MessageCard, collapsed && styles.collapsed)} ref={ref}>
    <div className={styles.senderWrapper}>
      <div className={styles.sender}>
        {message.sender === 'ai' && <ProviderIcon provider={message.providerId} />}
        {message.sender === 'user' ? 'User' : usedModel ?? 'LLM'}
      </div>
      <Link
        href={`/chats/${message.chatId}?messageId=${message.id}`}
        variant='button-borderless'
        icon={<HiChevronRight />}
        iconPosition='after'
      >Go to message</Link>
    </div>
    <Markdown className={styles.text} content={message.text} />

    {collapsed && <div className={styles.gradient}>
      <Button
        variant='borderless'
        onClick={() => setExpanded(true)}
        className={styles.showAllButton}
      >
        Show all
      </Button>
    </div>}
  </div>);
};
