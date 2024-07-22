import { ComponentPropsWithoutRef, Ref } from 'react';
import styles from './Input.module.scss';
import clsx from 'clsx';
import TextareaAutosize, { TextareaAutosizeProps } from 'react-textarea-autosize';

export type InputProps = {
  onValueChange?: (newVal: string) => void,
} & ComponentPropsWithoutRef<'input'>;

export const Input = ({ onValueChange, onChange, className, ...props }: InputProps) => {
  return (<input
    className={clsx(styles.Input, "nodrag", className)}
    onChange={(e) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
    }}
    {...props}
  />);
};

export type TextareaProps = {
  onValueChange?: (newVal: string) => void,
  ref?: Ref<HTMLTextAreaElement>,
} & TextareaAutosizeProps;

export const Textarea = ({ onValueChange, onChange, className, ...props }: TextareaProps) => {
  return (<TextareaAutosize
    className={clsx(styles.Input, styles.Textarea, "nodrag", className)}
    onChange={(e) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
    }}
    {...props}
  />);
};
