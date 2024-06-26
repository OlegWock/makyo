import * as RadixCheckbox from '@radix-ui/react-checkbox';
import styles from './Checkbox.module.scss';
import { ReactNode, useId } from 'react';
import clsx from 'clsx';
import { HiMiniCheck } from 'react-icons/hi2';

export type CheckboxProps = {
  children?: ReactNode,
  checked: boolean,
  onCheckedChange?: (val: boolean) => void,
  disabled?: boolean,
  className?: string,
};

export const Checkbox = ({ children, className, disabled, ...props }: CheckboxProps) => {
  const id = useId();
  return (<div className={clsx(styles.CheckboxWrapper, className)} data-disabled={disabled || undefined}>
      <RadixCheckbox.Root id={id} className={styles.checkbox} disabled={disabled} {...props}>
        <RadixCheckbox.Indicator className={styles.indicator}><HiMiniCheck /></RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <label htmlFor={id}>{children}</label>
    </div>);
};
