import { ReactNode } from 'react';
import styles from './Layout.module.scss';
import { TopNav } from '../TopNav';

export type LayoutProps = {
  children: ReactNode
};

export const Layout = ({ children }: LayoutProps) => {
  return (<div className={styles.Layout}>
    <div className={styles.navWrapper}>
      <TopNav />
    </div>
    <div className={styles.content}>
      {children}
    </div>
  </div>);
};
