import { ReactNode } from 'react';
import styles from './Card.module.scss';
import clsx from 'clsx';
import { ScrollArea } from '@client/components/ScrollArea';
import { m, type MotionProps } from 'framer-motion';

export type CardProps = {
  withScrollArea?: boolean;
  
  padding?: 'small' | 'medium';
  flexGrow?: boolean;
  className?: string;
  children?: ReactNode;
} & MotionProps;

export const Card = ({ children, className, padding = 'medium', flexGrow, withScrollArea = true, ...props }: CardProps) => {
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
      {...props}
    >
      {children}
    </ScrollArea>);
  }

  return (<m.div className={clsx(
    styles.Card,
    styles[padding],
    flexGrow && styles.flexGrow,
    className
  )} {...props}>{children}</m.div>)
};
