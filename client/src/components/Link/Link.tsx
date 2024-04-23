import { Link as WouterLink, LinkProps as WouterLinkProps } from 'wouter';
import styles from './Link.module.scss';
import buttonStyles from '../Button/Button.module.scss';
import clsx from 'clsx';
import { cloneElement, ReactElement } from 'react';

type Variant = "underline" | "unstyled" | "button" | "button-primary" | "button-text" | "button-borderless";

export type LinkProps = {
  className?: string | ((active: boolean) => string),
  variant?: Variant,
  icon?: ReactElement,
} & WouterLinkProps;

export const Link = ({ className, children, icon, variant = "underline", asChild, ...props }: LinkProps) => {
  return (<WouterLink className={(matching) => clsx(
    styles.Link,
    variant === 'underline' && styles.withUnderline,
    variant.startsWith('button-') && buttonStyles.Button,
    variant === "button-primary" && buttonStyles.primary,
    variant === "button-text" && buttonStyles.text,
    variant === "button-borderless" && buttonStyles.borderless,
    variant === "button" && buttonStyles.normal,
    variant.startsWith('button-') && !!icon && buttonStyles.withIcon,
    variant.startsWith('button-') && !!icon && !children && buttonStyles.onlyIcon,
    typeof className === 'function' ? className(matching) : className,
  )} asChild={false} {...props}
  >
    {!!icon && cloneElement(icon, { className: buttonStyles.icon })}
    {children}
  </WouterLink>);
};