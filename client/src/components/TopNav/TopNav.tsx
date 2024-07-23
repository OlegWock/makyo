import clsx from 'clsx';
import { HiPlus, HiListBullet, HiOutlineUser, HiOutlineCog6Tooth, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import styles from './TopNav.module.scss';
import { Link, LinkProps } from '@client/components/Link';


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
    <img src="/favicon.svg" className={styles.logo} />
    <Item icon={<HiPlus />} href="/" />
    <Item href="/chats" icon={<HiOutlineChatBubbleLeftRight />} />
    <Item href="/snippets" icon={<HiListBullet />} />
    <Item href="/personas" icon={<HiOutlineUser />} />
    <div className={styles.spacer} />
    <Item href="/settings" icon={<HiOutlineCog6Tooth />} />
  </div >);
};
