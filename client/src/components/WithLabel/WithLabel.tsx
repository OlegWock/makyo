import { Children, cloneElement, isValidElement, ReactElement, ReactNode, useId } from 'react';
import styles from './WithLabel.module.scss';
import clsx from 'clsx';

export type WithLabelProps = {
  label: string,
  hint?: string,
  children?: ReactNode
  className?: string,
};

export const WithLabel = ({ children, label, className, hint }: WithLabelProps) => {
  const child = Children.only(children);
  if (!isValidElement(child)) {
    throw new Error('WithLabel works only with elements');
  }

  const narrowedChild = child as ReactElement<Record<string, unknown>>;
  const id = useId();
  return (<div className={clsx(styles.WithLabel, className)}>
    <div className={styles.label}>
      <label htmlFor={id}>{label}</label>
    </div>
    <div className={styles.content}>
      {cloneElement(narrowedChild, { ...narrowedChild.props, id })}
    </div>
    {!!hint && <div className={styles.hint}>{hint}</div>}
  </div>);
};
