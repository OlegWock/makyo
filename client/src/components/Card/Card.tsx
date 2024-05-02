import { ReactNode } from 'react';
import styles from './Card.module.scss';
import clsx from 'clsx';
import { ScrollArea } from '@client/components/ScrollArea';

export type CardProps = {
  withScrollArea?: boolean;
  padding?: 'small' | 'medium';
  flexGrow?: boolean;
  className?: string;
  children?: ReactNode;
};

export const Card = ({ children, className, padding = 'medium', flexGrow, withScrollArea = true }: CardProps) => {
  if (withScrollArea) {
    return (<ScrollArea
      type='always'
      className={clsx(
        styles.Card,
        styles[padding],
        flexGrow && styles.flexGrow,
        className
      )}
      scrollbarClassName={styles.scrollbar}
    >
      {children}
    </ScrollArea>);
  }

  return (<div className={clsx(
    styles.Card,
    styles[padding],
    flexGrow && styles.flexGrow,
    className
  )}>{children}</div>)
};
