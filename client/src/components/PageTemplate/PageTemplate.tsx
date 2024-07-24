import { ReactNode } from 'react';
import styles from './PageTemplate.module.scss';
import { Card } from '@client/components/Card';
import { Link, LinkProps } from '@client/components/Link';
import clsx from 'clsx';
import { HiPlus, HiOutlineChatBubbleLeftRight, HiListBullet, HiOutlineUser, HiOutlineCog6Tooth } from 'react-icons/hi2';
import { useSubscription } from '@client/api/subscription';

const NavItem = (props: LinkProps) => {
  return (<Link
    variant='button-borderless'
    size='large'
    className={(active) => clsx(styles.item, active && styles.active)}
    {...props}
  />);
};

const Logo = () => {
  const { status } = useSubscription();
  return (<Card padding='small' withScrollArea={false} className={clsx(styles.card, styles.logoCard)}>
    <img src="/favicon.svg" className={styles.logo} />
    <div className={clsx(styles.dot, styles[status])} />
  </Card>);
}

const TopNav = ({ }) => {
  return (<>
    <Logo />
    <Card padding='small' withScrollArea={false} className={clsx(styles.card, styles.mainCard)}>
      <NavItem icon={<HiPlus />} href="/" />
      <NavItem href="/chats" icon={<HiOutlineChatBubbleLeftRight />} />
      <NavItem href="/snippets" icon={<HiListBullet />} />
      <NavItem href="/personas" icon={<HiOutlineUser />} />
      <div className={styles.spacer} />
      <NavItem href="/settings" icon={<HiOutlineCog6Tooth />} />
    </Card>
  </>);
};

export type PageTemplateProps = {
  children: ReactNode
};

export const PageTemplate = ({ children }: PageTemplateProps) => {
  return (<div className={styles.Layout}>
    <div className={styles.navigationWrapper}><TopNav /></div>
    <div className={styles.content}>
      {children}
    </div>
  </div>);
};
