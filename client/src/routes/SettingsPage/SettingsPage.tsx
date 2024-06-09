import { useModels, useSettings } from '@client/api';
import styles from './SettingsPage.module.scss';
import { HiNoSymbol, HiOutlineCheckCircle } from 'react-icons/hi2';
import { withErrorBoundary } from '@client/components/ErrorBoundary';
import { Card } from '@client/components/Card';
import { usePageTitle } from '@client/utils/hooks';
import { localOllamaProxyEnabled } from '@client/api/ollama-proxy';

export const SettingsPage = withErrorBoundary(() => {
  const { data: { openai, anthropic, ollama } } = useSettings();
  const { data: models } = useModels();

  usePageTitle('Settings');

  return (<Card flexGrow>
    <div className={styles.SettingsPage}>
      <div className={styles.content}>
        <section>
          <div className={styles.sectionTitle}>Cloud providers</div>

          <div className={styles.status}>{openai.enabled ? <HiOutlineCheckCircle /> : <HiNoSymbol />} OpenAI – {openai.enabled ? 'enabled' : 'API key not set'}</div>
          <div className={styles.status}>{anthropic.enabled ? <HiOutlineCheckCircle /> : <HiNoSymbol />} Anthropic – {anthropic.enabled ? 'enabled' : 'API key not set'}</div>
        </section>

        <section>
          <div className={styles.sectionTitle}>Ollama</div>
          <div className={styles.status}>
            {ollama.enabled ? <>
              <HiOutlineCheckCircle /> – Enabled {localOllamaProxyEnabled ? '(through proxy in browser)' : ''}
            </> : <>
              <HiNoSymbol /> – Disabled
            </>}
          </div>
        </section>
        <section>
          <div className={styles.sectionTitle}>Available models</div>
          <pre>{JSON.stringify(models, null, 4)}</pre>
        </section>
      </div>
    </div>
  </Card>);
});

SettingsPage.displayName = 'SettingsPage';
