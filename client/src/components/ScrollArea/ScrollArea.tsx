import * as RadixScrollArea from '@radix-ui/react-scroll-area';
import styles from './ScrollArea.module.scss';
import { ReactNode, Ref, UIEvent } from 'react';
import clsx from 'clsx';
import { m, type MotionProps } from 'framer-motion';

export type ScrollAreaProps = {
  type?: 'auto' | 'scroll' | 'always' | 'hover';
  direction?: 'vertical' | 'horizontal' | 'both';
  children?: ReactNode;
  className?: string;
  viewportClassName?: string;
  viewportRef?: Ref<HTMLDivElement>;
  scrollbarClassName?: string;

  onScroll?: (e: UIEvent<HTMLDivElement>) => void;
} & MotionProps;

export const ScrollArea = ({ direction = 'vertical', children, className, type, scrollbarClassName, viewportClassName, viewportRef, onScroll, ...props }: ScrollAreaProps) => {
  return (<RadixScrollArea.Root type={type} asChild>
    <m.div
      className={clsx(styles.ScrollArea, className)}
      {...props}
    >
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
    </m.div>
  </RadixScrollArea.Root>);
};
