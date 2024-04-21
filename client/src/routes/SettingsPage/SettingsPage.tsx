import { useSettings, useSettingsMutation } from '@client/api';
import styles from './SettingsPage.module.scss';
import { useState } from 'react';
import { PiFloppyDiskLight } from 'react-icons/pi';
import { Input } from '@client/components/Input';
import { Button } from '@client/components/Button';

export const SettingsPage = () => {
  const { data } = useSettings();
  const settingsMutation = useSettingsMutation();
  const [openaiKey, setOpenaiKey] = useState(data.openai.apiKey);
  const [anthropicKey, setAnthropicKey] = useState(data.anthropic.apiKey);

  return (<div className={styles.SettingsPage}>
    <div className={styles.content}>
      <section>
        <div className={styles.sectionTitle}>Cloud providers</div>
        {/* TODO: user proper alert component here? */}
        {settingsMutation.isError ? (
          <div>An error occurred: {settingsMutation.error.message}</div>
        ) : null}
        {settingsMutation.isSuccess ? (
          <div>Saved!</div>
        ) : null}
        <div className={styles.row}>
          <label>OpenAI API key</label>
          <Input value={openaiKey} onValueChange={setOpenaiKey} placeholder='sk-proj-scr*******' />
        </div>
        <div className={styles.row}>
          <label>Anthropic API key</label>
          <Input value={anthropicKey} onValueChange={setAnthropicKey} placeholder='sk-ant-api*******' />
        </div>

        <Button
          className={styles.save}
          icon={<PiFloppyDiskLight />}
          loading={settingsMutation.isPending}
          onClick={() => settingsMutation.mutate({
            openai: { apiKey: openaiKey },
            anthropic: { apiKey: anthropicKey },
          })}
        >Save</Button>
      </section>

      {/* <section> 
        <div className={styles.sectionTitle}>Ollama</div>
      </section> */}
    </div>
  </div>);
};
