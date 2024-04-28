import { withErrorBoundary } from '@client/components/ErrorBoundary';
import styles from './PresetsPage.module.scss';
import { Card } from '@client/components/Card';
import { usePageTitle } from '@client/utils/hooks';

export const PresetsPage = withErrorBoundary(() => {
  usePageTitle('Presets');
  return (<Card flexGrow><div className={styles.PresetsPage}>
    Here will be presets once I implement them!
  </div></Card>);
});

PresetsPage.displayName = 'PresetsPage';
