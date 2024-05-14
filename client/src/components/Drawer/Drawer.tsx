import { Drawer as Vaul } from 'vaul';
import styles from './Drawer.module.scss';
import { ReactNode } from 'react';

export type DrawerProps = {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (newOpen: boolean) => void;
};

export const Drawer = ({ children, ...props }: DrawerProps) => {
  return (<Vaul.Root {...props} noBodyStyles>
    <Vaul.Portal>
      <Vaul.Content className={styles.drawer}>
        <Vaul.Handle className={styles.handle} />
        <div className={styles.content}>
          {children}
        </div>
      </Vaul.Content>
      <Vaul.Overlay className={styles.overlay} />
    </Vaul.Portal>
  </Vaul.Root>);
};
