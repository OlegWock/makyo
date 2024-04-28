import { withErrorBoundary } from '@client/components/ErrorBoundary';
import styles from './PresetsPage.module.scss';

export const PresetsPage = withErrorBoundary(() => {
  return (<div className={styles.PresetsPage}>
    Here will be presets once I implement them!
  </div>);
});

PresetsPage.displayName = 'PresetsPage';
