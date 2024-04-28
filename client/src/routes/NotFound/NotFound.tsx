import { Card } from '@client/components/Card';
import styles from './NotFound.module.scss';
import { usePageTitle } from '@client/utils/hooks';

export const NotFound = () => {
  usePageTitle('Not found');
  return (<Card flexGrow><div className={styles.NotFound}>404 Not found :(</div></Card>);
};
