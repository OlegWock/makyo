import { ReactNode } from 'react';
import styles from './Layout.module.scss';
import { TopNav } from '../TopNav';
import { Card } from '@client/components/Card';

export type LayoutProps = {
  children: ReactNode
};

export const Layout = ({ children }: LayoutProps) => {
  return (<div className={styles.Layout}>
    <Card padding='small' className={styles.navigationCard}>
      <TopNav />
    </Card>
    <div className={styles.content}>
    {children}
    </div>
  </div>);
};
