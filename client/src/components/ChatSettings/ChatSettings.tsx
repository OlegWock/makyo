import { Updater, useImmer } from 'use-immer';
import styles from './ChatSettings.module.scss';
import { ChatSchemaType, Model } from '@shared/api';
import { Switch } from '@client/components/Switch';
import { Textarea } from '@client/components/Input';
import { Slider } from '@client/components/Slider';
import { Button } from '@client/components/Button';

export type ChatSettings = {
  system: {
    enabled: boolean,
    value: string
  },
  temperature: {
    enabled: boolean,
    value: number
  }
}

export const useChatSettings = (defaultSettings: Model["defaultParameters"] | ChatSchemaType) => {
  const state = useImmer<ChatSettings>({
    system: {
      enabled: typeof defaultSettings.system === 'string',
      value: defaultSettings.system ?? '',
    },
    temperature: {
      enabled: typeof defaultSettings.temperature === 'number',
      value: defaultSettings.temperature ?? 0.8,
    }
  });

  return state;
};

export type ChatSettingsProps = {
  settings: ChatSettings,
  settingsUpdater: Updater<ChatSettings>,
  isSubmitting?: boolean;
  onSubmit?: VoidFunction;
};

export const ChatSettings = ({ settings, settingsUpdater, isSubmitting, onSubmit }: ChatSettingsProps) => {
  return (<div className={styles.ChatSettings}>
    <div className={styles.title}>Chat settings</div>
    <div className={styles.row}>
      <Switch
        checked={settings.system.enabled}
        onChange={(enabled) => settingsUpdater(draft => {
          draft.system.enabled = enabled
        })}
      >
        System message
      </Switch>
      {settings.system.enabled && <Textarea
        className={styles.textarea}
        rows={10}
        placeholder='System prompt'
        value={settings.system.value}
        onValueChange={newVal => settingsUpdater(draft => {
          draft.system.value = newVal;
        })}
      />}
    </div>
    <div className={styles.row}>
      <Switch
        checked={settings.temperature.enabled}
        onChange={(enabled) => settingsUpdater(draft => {
          draft.temperature.enabled = enabled
        })}
      >
        Temperature
      </Switch>
      {settings.temperature.enabled && <Slider
        value={settings.temperature.value}
        onValueChange={(value) => {
          console.log('New temperature', value);
          settingsUpdater(draft => {
            draft.temperature.value = value;
          })
        }}
        minLabel='Predictive'
        maxLabel='Creative'
        min={0}
        max={1}
        precision={2}
      />}
    </div>
    {!!onSubmit && <Button
      onClick={onSubmit}
      loading={isSubmitting}
      variant='primary'
      size='large'
      className={styles.submitButton}
    >
      Save changes
    </Button>}
  </div>);
};
