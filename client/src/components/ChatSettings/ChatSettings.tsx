import { Updater, useImmer } from 'use-immer';
import styles from './ChatSettings.module.scss';
import { ChatSchemaType, Model } from '@shared/api';
import { Switch } from '@client/components/Switch';
import { Textarea } from '@client/components/Input';
import { Slider } from '@client/components/Slider';
import { Button } from '@client/components/Button';
import { usePrevious } from '@client/utils/hooks';
import { ModelSelect } from '@client/components/ModelSelect';
import { useRef } from 'react';
import { WithSnippets } from '@client/components/WithSnippets';

export type ChatSettings = {
  model?: {
    modelId: string,
    providerId: string,
  },
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
  const prevDefaultSettingsRef = useRef<typeof defaultSettings | null>(null);

  const state = useImmer<ChatSettings>({
    model: ('modelId' in defaultSettings) ? {
      modelId: defaultSettings.modelId,
      providerId: defaultSettings.providerId,
    } : undefined,
    system: {
      enabled: typeof defaultSettings.system === 'string',
      value: defaultSettings.system ?? '',
    },
    temperature: {
      enabled: typeof defaultSettings.temperature === 'number',
      value: defaultSettings.temperature ?? 0.8,
    }
  });

  // TODO: technically, we need to reset settings if model changes, but this doesn't work well with personas currently, might need to rewrite this part??
  // if (prevDefaultSettingsRef.current !== null && prevDefaultSettingsRef.current !== defaultSettings) {
    // prevDefaultSettingsRef.current = defaultSettings;
    // state[1]({
      // model: ('modelId' in defaultSettings) ? {
        // modelId: defaultSettings.modelId,
        // providerId: defaultSettings.providerId,
      // } : undefined,
      // system: {
        // enabled: typeof defaultSettings.system === 'string',
        // value: defaultSettings.system ?? '',
      // },
      // temperature: {
        // enabled: typeof defaultSettings.temperature === 'number',
        // value: defaultSettings.temperature ?? 0.8,
      // }
    // });
  // } else {
    // prevDefaultSettingsRef.current = defaultSettings;
  // }

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
    {/* <div className={styles.title}>Chat settings</div> */}
    {!!settings.model && <div className={styles.row}>
      <ModelSelect
        value={settings.model}
        onChange={(newVal) => settingsUpdater((draft) => {
          draft.model = newVal;
        })}
      />
    </div>}
    <div className={styles.row}>
      <Switch
        checked={settings.system.enabled}
        onChange={(enabled) => settingsUpdater(draft => {
          draft.system.enabled = enabled
        })}
      >
        Custom system message
      </Switch>

      {settings.system.enabled && <WithSnippets>
        <Textarea
          className={styles.textarea}
          minRows={6}
          maxRows={20}
          placeholder='System prompt'
          value={settings.system.value}
          onValueChange={newVal => settingsUpdater(draft => {
            draft.system.value = newVal;
          })}
        />
      </WithSnippets>}
    </div>
    <div className={styles.row}>
      <Switch
        checked={settings.temperature.enabled}
        onChange={(enabled) => settingsUpdater(draft => {
          draft.temperature.enabled = enabled
        })}
      >
        Adjust temperature
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
