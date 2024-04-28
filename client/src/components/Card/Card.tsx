import { ReactNode } from 'react';
import styles from './Card.module.scss';
import clsx from 'clsx';

export type CardProps = {
  padding?: 'small' | 'medium';
  flexGrow?: boolean;
  className?: string;
  children?: ReactNode;
};

export const Card = ({ children, className, padding = 'medium', flexGrow }: CardProps) => {
  return (<div
    className={clsx(
      styles.Card,
      styles[padding],
      flexGrow && styles.flexGrow,
      className
    )}
  >
    {children}
  </div>);
};
