import { Popover, PopoverProps } from '@client/components/Popover';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import styles from './EmojiPopover.module.scss';
import { ReactNode } from 'react';

export type EmojiPopoverProps = {
  children: ReactNode;
  side?: PopoverProps["side"],
  onSelect?: (emoji: string) => void,
};

export const EmojiPopover = ({ children, onSelect, side, ...props }: EmojiPopoverProps) => {
  return (<Popover
    side={side}
    renderContent={(close) => <Picker
      data={data}
      maxFrequentRows={0}
      theme="light"
      onEmojiSelect={(val: any) => {
        onSelect?.(val.native);
        close();
      }}
      {...props}
    />}
    className={styles.EmojiPopover}
  >
    {children}
  </Popover>);
};
