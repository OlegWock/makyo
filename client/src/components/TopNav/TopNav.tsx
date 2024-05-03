import clsx from 'clsx';
import { HiPlus, HiListBullet, HiOutlineUser, HiOutlineCog6Tooth } from 'react-icons/hi2';
import styles from './TopNav.module.scss';
import { Link, LinkProps } from '@client/components/Link';
import { Tooltip } from '@client/components/Tooltip';


const Item = (props: LinkProps) => {
  return (<Link
    variant='button-borderless'
    size='large'
    className={(active) => clsx(styles.item, active && styles.active)}
    {...props}
  />);
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
  </div >);
};
