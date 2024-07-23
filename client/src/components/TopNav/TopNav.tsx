import clsx from 'clsx';
import { HiPlus, HiListBullet, HiOutlineUser, HiOutlineCog6Tooth, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import styles from './TopNav.module.scss';
import { Link, LinkProps } from '@client/components/Link';
import { Card } from '@client/components/Card';


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
  return (<>
    <Card padding='small' withScrollArea={false} className={styles.card}>
      <img src="/favicon.svg" className={styles.logo} />
    </Card>
    <Card padding='small' withScrollArea={false} className={clsx(styles.card, styles.mainCard)}>
      <Item icon={<HiPlus />} href="/" />
      <Item href="/chats" icon={<HiOutlineChatBubbleLeftRight />} />
      <Item href="/snippets" icon={<HiListBullet />} />
      <Item href="/personas" icon={<HiOutlineUser />} />
      <div className={styles.spacer} />
      <Item href="/settings" icon={<HiOutlineCog6Tooth />} />
    </Card>
  </>);
};
