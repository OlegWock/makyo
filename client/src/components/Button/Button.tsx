import { cloneElement, ComponentPropsWithRef, HTMLAttributes, MouseEventHandler, ReactElement, ReactNode } from 'react';
import styles from './Button.module.scss';
import clsx from 'clsx';
import { m } from 'framer-motion';
import type {MotionProps} from 'framer-motion'

export type ButtonProps = {
  loading?: boolean,
  variant?: 'primary' | 'danger' | 'normal' | 'borderless' | 'text',
  size?: 'small' | 'medium' | 'large',
  icon?: ReactElement<HTMLAttributes<SVGSVGElement>>,
  iconPosition?: 'before' | 'after',
  children?: ReactNode;
} & Omit<ComponentPropsWithRef<'button'>, 'children'> & MotionProps;

export const Button = ({ loading = false, variant = 'normal', iconPosition = 'before', onClick, className, style = {}, icon, children, size = 'medium', ...props }: ButtonProps) => {
  const localOnClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (loading) return;
    if (onClick) return onClick(e);
  };

  return (<m.button
    className={clsx(
      styles.Button,
      loading && styles.loading,
      variant === 'normal' && styles.normal,
      variant === 'borderless' && styles.borderless,
      variant === 'primary' && styles.primary,
      variant === 'danger' && styles.danger,
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
    {!!icon && iconPosition === 'before' && cloneElement(icon, { className: clsx(styles.icon, icon.props.className) })}
    {children}
    {!!icon && iconPosition === 'after' && cloneElement(icon, { className: clsx(styles.icon, icon.props.className) })}
  </m.button>);
};
