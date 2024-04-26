import * as RadixTooltip from '@radix-ui/react-tooltip';
import styles from './Tooltip.module.scss';
import { ReactNode, useState } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';

type Side = 'top' | 'right' | 'left' | 'bottom';

export type TooltipProps = {
  text: string;
  children: ReactNode;
  side?: Side;
  delayDuration?: number,
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

export const Tooltip = ({ children, text, side = 'top', delayDuration = 300 }: TooltipProps) => {
  const [open, setOpen] = useState(false);
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root delayDuration={delayDuration} open={open} onOpenChange={setOpen}>
        <RadixTooltip.Trigger asChild>
          {children}
        </RadixTooltip.Trigger>
        <AnimatePresence>
          {open && <RadixTooltip.Portal forceMount>
            <RadixTooltip.Content
              forceMount
              className={styles.content}
              sideOffset={2}
              side={side}
              asChild
            >
              <motion.div
                transition={{ duration: 0.15 }}
                variants={variants}
                custom={side}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {text}
              </motion.div>
            </RadixTooltip.Content>

          </RadixTooltip.Portal>}
        </AnimatePresence>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};
