import * as RadixPopover from '@radix-ui/react-popover';
import styles from './Popover.module.scss';
import { ReactNode, useState } from 'react';
import { AnimatePresence, m, type Variants } from 'framer-motion';
import clsx from 'clsx';

type Side = 'top' | 'right' | 'left' | 'bottom';

export type PopoverProps = {
  className?: string;
  side?: Side;
  children: ReactNode;
  renderContent: (close: VoidFunction) => ReactNode;
};

const variants = {
  "visible": (side: Side) => {
    return { opacity: 1, x: 0, y: 0 };
  },
  "hidden": (side: Side) => {
    if (side === 'top') return { opacity: 0, y: 3, };
    if (side === 'bottom') return { opacity: 0, y: -3, };
    if (side === 'right') return { opacity: 0, x: -3, };
    if (side === 'left') return { opacity: 0, x: 3, };
    return {};
  },
} satisfies Variants;

export const Popover = ({ children, renderContent, className, side = 'top' }: PopoverProps) => {
  const [open, setOpen] = useState(false);

  return (<RadixPopover.Root open={open} onOpenChange={setOpen}>
    <RadixPopover.Trigger asChild>{children}</RadixPopover.Trigger>

    <RadixPopover.Portal forceMount>
      <AnimatePresence>
        {open && <RadixPopover.Content asChild side={side}>
          <m.div 
            className={clsx(styles.Popover, className)}
            transition={{ duration: 0.15 }}
            variants={variants}
            custom={side}
            initial="hidden"
            animate="visible"
            exit="hidden"
            >
            {renderContent(() => setOpen(false))}
          </m.div>
        </RadixPopover.Content>}
      </AnimatePresence>
    </RadixPopover.Portal>
  </RadixPopover.Root>);
};
