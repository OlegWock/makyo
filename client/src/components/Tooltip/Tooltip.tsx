import * as RadixTooltip from '@radix-ui/react-tooltip';
import styles from './Tooltip.module.scss';
import { ReactNode, Ref, useState } from 'react';
import { AnimatePresence, m, type Variants } from 'framer-motion';

type Side = 'top' | 'right' | 'left' | 'bottom';

export type TooltipProps = {
  text: string;
  children: ReactNode;
  side?: Side;
  delayDuration?: number,
  sideOffset?: number,
  ref?: Ref<HTMLButtonElement>,
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

// TODO: use asChild approach once this issue gets fixed: https://github.com/radix-ui/primitives/issues/2981
const MotionContent = m(RadixTooltip.Content);

export const Tooltip = ({ children, text, side = 'top', delayDuration = 300, sideOffset = 5, ref }: TooltipProps) => {
  const [open, setOpen] = useState(false);
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root delayDuration={delayDuration} open={open} onOpenChange={setOpen}>
        <RadixTooltip.Trigger asChild ref={ref}>
          {children}
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal forceMount>
          <AnimatePresence>
            {open &&
              <MotionContent
                forceMount
                className={styles.content}
                sideOffset={sideOffset}
                side={side}
                transition={{ duration: 0.15 }}
                variants={variants}
                custom={side}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {text}
              </MotionContent>
            }
          </AnimatePresence>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};
