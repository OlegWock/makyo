import clsx from 'clsx';
import { HiPlus, HiListBullet, HiOutlineUser, HiOutlineCog6Tooth } from 'react-icons/hi2';
import styles from './TopNav.module.scss';
import { Link, LinkProps } from '@client/components/Link';
import { Tooltip } from '@client/components/Tooltip';


const Item = (props: LinkProps) => {
  return (<Link
    variant='button-borderless'
    className={(active) => clsx(styles.item, active && styles.active)}
    {...props}
  />);
};

export type TopNavProps = {

};

export const TopNav = ({ }: TopNavProps) => {
  return (<div className={styles.TopNav}>

    <Tooltip text='New chat' side='right'>
      <Item icon={<HiPlus />} href="/" />
    </Tooltip>

    <Tooltip text='All chats' side='right'>
      <Item href="/chats" icon={<HiListBullet />} />
    </Tooltip>

    <Tooltip text='Presets' side='right'>
      <Item href="/presets" icon={<HiOutlineUser />} />
    </Tooltip>

    <div className={styles.spacer} />
    <Tooltip text='Settings' side='right'>
      <Item href="/settings" icon={<HiOutlineCog6Tooth />} />
    </Tooltip>
  </div >);
};
