import { cloneElement, ComponentPropsWithoutRef, MouseEventHandler, ReactElement, ReactNode } from 'react';
import styles from './Button.module.scss';
import clsx from 'clsx';
import { motion, useMotionTemplate, useTime, useTransform } from 'framer-motion';
import { inverseLerp, lerp } from '@client/utils/animations';

const LOADING_CYCLE_DURATION = 1000; // ms

export type ButtonProps = {
  loading?: boolean,
  variant?: 'primary' | 'normal' | 'borderless' | 'text',
  icon?: ReactElement,
  iconPosition?: 'before' | 'after',
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof motion.button>, 'children'>;

export const Button = ({ loading = false, variant = 'normal', iconPosition = 'before', onClick, className, style = {}, icon, children, ...props }: ButtonProps) => {
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
