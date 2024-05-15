import { withErrorBoundary } from '@client/components/ErrorBoundary';
import styles from './PresetsPage.module.scss';
import { Card } from '@client/components/Card';
import { usePageTitle } from '@client/utils/hooks';
import { Snippets } from '@client/routes/PresetsPage/Snippets';

export const PresetsPage = withErrorBoundary(() => {
  usePageTitle('Presets');
  return (<Card flexGrow>
    <div className={styles.PresetsPage}>
      <div className={styles.content}>
        <Snippets />
      </div>
    </div>
  </Card>);
});

PresetsPage.displayName = 'PresetsPage';
