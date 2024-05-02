import * as RadixScrollArea from '@radix-ui/react-scroll-area';
import styles from './ScrollArea.module.scss';
import { ReactNode, Ref, UIEvent } from 'react';
import clsx from 'clsx';

export type ScrollAreaProps = {
  type?: 'auto' | 'scroll' | 'always' | 'hover';
  direction?: 'vertical' | 'horizontal' | 'both';
  children?: ReactNode;
  className?: string;
  viewportClassName?: string;
  viewportRef?: Ref<HTMLDivElement>;
  scrollbarClassName?: string;

  onScroll?: (e: UIEvent<HTMLDivElement>) => void;
};

export const ScrollArea = ({ direction = 'vertical', children, className, type, scrollbarClassName, viewportClassName, viewportRef, onScroll }: ScrollAreaProps) => {
  return (<RadixScrollArea.Root className={clsx(styles.ScrollArea, className)} type={type}>
    <RadixScrollArea.Viewport className={clsx(styles.viewport, viewportClassName)} ref={viewportRef} onScroll={onScroll}>
      {children}
    </RadixScrollArea.Viewport>
    {['horizontal', 'both'].includes(direction) && <RadixScrollArea.Scrollbar className={clsx(styles.scrollbar, scrollbarClassName)} orientation="horizontal">
      <RadixScrollArea.Thumb className={styles.thumb} />
    </RadixScrollArea.Scrollbar>}
    {['vertical', 'both'].includes(direction) && <RadixScrollArea.Scrollbar className={clsx(styles.scrollbar, scrollbarClassName)} orientation="vertical">
      <RadixScrollArea.Thumb className={styles.thumb} />
    </RadixScrollArea.Scrollbar>}
    <RadixScrollArea.Corner className={styles.corner} />
  </RadixScrollArea.Root>);
};
