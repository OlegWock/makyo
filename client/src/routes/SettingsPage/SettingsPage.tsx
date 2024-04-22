import { useModels, useSettings } from '@client/api';
import styles from './SettingsPage.module.scss';
import { HiNoSymbol, HiOutlineCheckCircle } from 'react-icons/hi2';

export const SettingsPage = () => {
  const { data: { openai, anthropic, ollama } } = useSettings();
  const { data: models } = useModels();

  return (<div className={styles.SettingsPage}>
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
            <HiOutlineCheckCircle /> – Enabled
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
  </div>);
};
