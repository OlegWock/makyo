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

  const mainColor = 'var(--color-btn-background)';
  const secondaryColor = 'var(--color-btn-background-loading)';
  const time = useTime();
  const progress = useTransform(time, (t) => inverseLerp(t % LOADING_CYCLE_DURATION, 0, LOADING_CYCLE_DURATION));

  const strip1Start = useTransform(progress, p => lerp(p, -40, 0));
  const strip1End = useTransform(progress, p => lerp(p, -20, 20));
  const strip2End = useTransform(progress, p => lerp(p, 0, 40));
  const strip3End = useTransform(progress, p => lerp(p, 20, 60));
  const strip4End = useTransform(progress, p => lerp(p, 40, 80));
  const strip5End = useTransform(progress, p => lerp(p, 60, 100));
  const strip6End = useTransform(progress, p => lerp(p, 80, 120));

  const loadingGradient = useMotionTemplate`linear-gradient(135deg,
    ${mainColor} ${strip1Start}%,
    ${mainColor} ${strip1End}%,

    ${secondaryColor} ${strip1End}%,
    ${secondaryColor} ${strip2End}%,

    ${mainColor} ${strip2End}%,
    ${mainColor} ${strip3End}%,

    ${secondaryColor} ${strip3End}%,
    ${secondaryColor} ${strip4End}%,

    ${mainColor} ${strip4End}%,
    ${mainColor} ${strip5End}%,

    ${secondaryColor} ${strip5End}%,
    ${secondaryColor} ${strip6End}%,

    ${mainColor} ${strip6End}%,
    ${mainColor})`;


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
      background: loading ? loadingGradient : 'invalid',
      ...(style || {}),
    }}
    onClick={localOnClick}
    whileTap={!loading ? {
      boxShadow: '0 0 0 0 var(--color-btn-shadow)',
      transition: {
        duration: 0.1,
      }
    } : undefined}
    {...props}
  >
    {!!icon && iconPosition === 'before' && cloneElement(icon, { className: styles.icon })}
    {children}
    {!!icon && iconPosition === 'after' && cloneElement(icon, { className: styles.icon })}
  </motion.button>);
};
