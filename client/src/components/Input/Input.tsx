import { ComponentPropsWithoutRef } from 'react';
import styles from './Input.module.scss';
import clsx from 'clsx';

export type InputProps = {
  onValueChange?: (newVal: string) => void,
} & ComponentPropsWithoutRef<'input'>;

export const Input = ({onValueChange, onChange, className, ...props}: InputProps) => {
  return (<input 
    className={clsx(styles.Input, className)} 
    onChange={(e) => {
      onValueChange?.(e.target.value);
      return onChange?.(e);
    }}
    {...props} 
    />);
};

export type TextareaProps = {
  onValueChange?: (newVal: string) => void,
} & ComponentPropsWithoutRef<'textarea'>;

export const Textarea = ({onValueChange, onChange, className, ...props}: TextareaProps) => {
  return (<textarea 
    className={clsx(styles.Input, className)} 
    onChange={(e) => {
      onValueChange?.(e.target.value);
      return onChange?.(e);
    }}
    {...props} 
    />);
};
