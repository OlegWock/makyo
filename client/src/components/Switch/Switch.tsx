import * as RadixSwitch from '@radix-ui/react-switch';
import styles from './Switch.module.scss';
import { Children, ReactNode, useId } from 'react';
import { m } from 'framer-motion';

export type SwitchProps = {
  children?: ReactNode;
  checked: boolean;
  onChange?: (checked: boolean) => void;
};

const MotionThumb = m(RadixSwitch.Thumb);
const MotionRoot = m(RadixSwitch.Root);

export const Switch = ({ children, checked, onChange }: SwitchProps) => {
  const id = useId();
  const hasLabel = Children.count(children) > 0;

  return (<div className={styles.Switch}>
    <MotionRoot
      layoutRoot
      layout
      className={styles.root}
      id={id}
      checked={checked}
      onCheckedChange={onChange}
      initial={{
        backgroundColor: checked ? 'var(--jade-10)' : 'var(--gray-6)',
      }}
      animate={{
        backgroundColor: checked ? 'var(--jade-10)' : 'var(--gray-6)',
      }}
    >
      <MotionThumb
        layout
        className={styles.thumb}
      />
    </MotionRoot>
    {hasLabel && <label className={styles.label} htmlFor={id}>{children}</label>}
  </div>);
};
