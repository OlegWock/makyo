import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import styles from './DropdownMenu.module.scss';
import { ReactNode, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import clsx from 'clsx';


export type DropdownMenuProps = {
  children?: ReactNode;
  menu?: ReactNode;
};

export const DropdownMenu = ({ children, menu }: DropdownMenuProps) => {
  const [open, setOpen] = useState(false);

  return (<RadixDropdownMenu.Root onOpenChange={setOpen} open={open}>
    <RadixDropdownMenu.Trigger asChild>
      {children}
    </RadixDropdownMenu.Trigger>
    <RadixDropdownMenu.Portal forceMount>
      <AnimatePresence>
        {open &&
          <RadixDropdownMenu.Content
            sideOffset={5}
            align='end'
            forceMount
            asChild
          >
            <m.div
              style={{ transformOrigin: 'top right' }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.75 }}
              transition={{ duration: 0.05 }}
              className={styles.DropdownMenu}
            >
              {menu}
            </m.div>
          </RadixDropdownMenu.Content>}
      </AnimatePresence>
    </RadixDropdownMenu.Portal>
  </RadixDropdownMenu.Root>);
};

export type DropdownMenuItemProps = {
  type?: 'normal' | 'danger' | 'danger-with-confirmation';
  children?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  onSelect?: (e: Event) => void;
}

DropdownMenu.Item = ({ children, disabled, icon, onSelect, type }: DropdownMenuItemProps) => {
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  return (<RadixDropdownMenu.Item
    className={clsx(styles.DropdownMenuItem, type?.startsWith('danger') && styles.danger)}
    disabled={disabled}
    onSelect={(e) => {
      if (type === 'danger-with-confirmation') {
        if (waitingForConfirmation) {
          onSelect?.(e);
          setWaitingForConfirmation(false);
        } else {
          setWaitingForConfirmation(true);
          e.preventDefault();
          setTimeout(() => {
            setWaitingForConfirmation(false);
          }, 3000);
        }
      } else {
        onSelect?.(e);
      }
    }}
  >
    {icon}
    <span>
      {waitingForConfirmation ? 'Click again to confirm' : children}
    </span>
  </RadixDropdownMenu.Item>)
};
