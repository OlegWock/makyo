import { cloneElement, ComponentPropsWithRef, MouseEventHandler, ReactElement, ReactNode } from 'react';
import styles from './Button.module.scss';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export type ButtonProps = {
  loading?: boolean,
  variant?: 'primary' | 'normal' | 'borderless' | 'text',
  size?: 'small' | 'medium' | 'large',
  icon?: ReactElement,
  iconPosition?: 'before' | 'after',
  children?: ReactNode;
} & Omit<ComponentPropsWithRef<typeof motion.button>, 'children'>;

export const Button = ({ loading = false, variant = 'normal', iconPosition = 'before', onClick, className, style = {}, icon, children, size = 'medium', ...props }: ButtonProps) => {
  const localOnClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (loading) return;
    if (onClick) return onClick(e);
  };

  return (<motion.button
    className={clsx(
      styles.Button,
      loading && styles.loading,
      variant === 'normal' && styles.normal,
      variant === 'borderless' && styles.borderless,
      variant === 'primary' && styles.primary,
      variant === 'text' && styles.text,
      styles[size],
      !!icon && styles.withIcon,
      (!!icon && !children) && styles.onlyIcon,
      className
    )}
    style={{
      ...(style || {}),
    }}
    onClick={localOnClick}
    {...props}
  >
    {!!icon && iconPosition === 'before' && cloneElement(icon, { className: styles.icon })}
    {children}
    {!!icon && iconPosition === 'after' && cloneElement(icon, { className: styles.icon })}
  </motion.button>);
};
