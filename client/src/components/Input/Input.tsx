import { ComponentPropsWithoutRef } from 'react';
import styles from './Input.module.scss';
import clsx from 'clsx';
import TextareaAutosize, { TextareaAutosizeProps } from 'react-textarea-autosize';

export type InputProps = {
  onValueChange?: (newVal: string) => void,
} & ComponentPropsWithoutRef<'input'>;

export const Input = ({ onValueChange, onChange, className, ...props }: InputProps) => {
  return (<input
    className={clsx(styles.Input, className)}
    onChange={(e) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
    }}
    {...props}
  />);
};

export type TextareaProps = {
  onValueChange?: (newVal: string) => void,
} & TextareaAutosizeProps;

export const Textarea = ({ onValueChange, onChange, className, ...props }: TextareaProps) => {
  return (<TextareaAutosize
    className={clsx(styles.Input, styles.Textarea, className)}
    onChange={(e) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
    }}
    {...props}
  />);
};
