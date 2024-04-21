import { useSettings } from '@client/api';
import styles from './SettingsPage.module.scss';

export const SettingsPage = () => {
  const { data, isLoading, } = useSettings()
  return (<div className={styles.SettingsPage}>
    <pre>
      {JSON.stringify(data, null, 4)}
    </pre>
  </div>);
};
