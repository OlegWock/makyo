import { withErrorBoundary } from '@client/components/ErrorBoundary';
import styles from './PresetsPage.module.scss';

export const PresetsPage = withErrorBoundary(() => {
  return (<div className={styles.PresetsPage}>PresetsPage</div>);
});

PresetsPage.displayName = 'PresetsPage';
