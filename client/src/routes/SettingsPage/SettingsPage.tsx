import { useApiClient, useAuthStatus, useSettings } from '@client/api';
import styles from './SettingsPage.module.scss';
import { HiNoSymbol, HiOutlineCheckCircle } from 'react-icons/hi2';
import { withErrorBoundary } from '@client/components/ErrorBoundary';
import { Card } from '@client/components/Card';
import { usePageTitle } from '@client/utils/hooks';
import { localOllamaProxyEnabled } from '@client/api/ollama-proxy';
import { OllamaSettings } from './OllamaSettings';
import { Button } from '@client/components/Button';


export const SettingsPage = withErrorBoundary(() => {
  const { data: { openai, google, anthropic, ollama } } = useSettings();
  const { logOut } = useApiClient();

  usePageTitle('Settings');

  return (<Card flexGrow>
    <div className={styles.SettingsPage}>
      <div className={styles.content}>
        <section>
          <div className={styles.sectionTitle}>Providers</div>

          <div className={styles.status}>{openai.enabled ? <HiOutlineCheckCircle /> : <HiNoSymbol />} OpenAI – {openai.enabled ? 'enabled' : 'API key not set'}</div>
          <div className={styles.status}>{anthropic.enabled ? <HiOutlineCheckCircle /> : <HiNoSymbol />} Anthropic – {anthropic.enabled ? 'enabled' : 'API key not set'}</div>
          <div className={styles.status}>{google.enabled ? <HiOutlineCheckCircle /> : <HiNoSymbol />} Google – {google.enabled ? 'enabled' : 'API key not set'}</div>
          <div className={styles.status}>{ollama.enabled ? <HiOutlineCheckCircle /> : <HiNoSymbol />} Ollama – {ollama.enabled ? `enabled${localOllamaProxyEnabled ? ' (through proxy in browser)' : ''}` : 'disabled'}</div>
        </section>

        {ollama.enabled && <section>
          <div className={styles.sectionTitle}>Ollama</div>
          <OllamaSettings />
        </section>}

        <section>
          <Button className={styles.logOutButton} variant="danger" size="large" onClick={logOut}>Log out</Button>
        </section>
      </div>
    </div>
  </Card>);
});

SettingsPage.displayName = 'SettingsPage';
