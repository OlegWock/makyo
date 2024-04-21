import clsx from 'clsx';
import { HiPlus, HiListBullet, HiOutlineUser, HiOutlineCog6Tooth } from 'react-icons/hi2';
import styles from './TopNav.module.scss';
import { Link } from '@client/components/Link';
import { ReactElement, ReactNode } from 'react';


const Item = ({ href, children, icon }: { href: string, children?: ReactNode; icon?: ReactElement }) => {
  return (<Link
    variant='button-borderless'
    href={href}
    icon={icon}
    className={(active) => clsx(styles.item, active && styles.active)}
  >
    {children}
  </Link>);
};

export type TopNavProps = {

};

export const TopNav = ({ }: TopNavProps) => {
  return (<div className={styles.TopNav}>
    <Item icon={<HiPlus />} href="/" />
    <Item href="/chats" icon={<HiListBullet />} />
    <Item href="/presets" icon={<HiOutlineUser />} />
    <div className={styles.spacer} />
    <Item href="/settings" icon={<HiOutlineCog6Tooth />} />
  </div>);
};
