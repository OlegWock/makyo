import { ChatLayout } from '@client/components/ChatLayout';
import styles from './RootPage.module.scss';
import { useModels, useNewChatMutation, usePersonas } from '@client/api';
import { useMemo, useRef, useState } from 'react';
import { useAtom } from 'jotai/react';
import { lastUsedModelAtom } from '@client/atoms/chat';
import { withErrorBoundary } from '@client/components/ErrorBoundary';
import { Button } from '@client/components/Button';
import { Card } from '@client/components/Card';
import { ChatSettings, useChatSettings } from '@client/components/ChatSettings';
import { usePageTitle } from '@client/utils/hooks';
import { useLocation } from 'wouter';
import { ModelSelect } from '@client/components/ModelSelect';
import { PersonaSchemaType } from '@server/schemas/personas';

export const RootPage = withErrorBoundary(() => {
  const applyPersona = (persona: PersonaSchemaType | null) => {
    setActivePersona(persona);
    if (persona) {
      if (persona.providerId !== null && persona.modelId !== null) {
        const model = options.find(m => m.modelId === persona.modelId && m.providerId === persona.providerId);
        if (model) {
          setLastUsedModel(model);
        }
      }
      updateChatSettings({
        system: {
          enabled: persona.system !== null,
          value: persona.system ?? '',
        },
        temperature: {
          enabled: persona.temperature !== null,
          value: persona.temperature ?? 0.8,
        }
      });
      inputRef.current?.focus();
    } else {
      updateChatSettings({
        system: {
          enabled: false,
          value: '',
        },
        temperature: {
          enabled: false,
          value: 0.8
        }
      });
    }
  };

  const newChat = useNewChatMutation();
  const { data: providers } = useModels();

  const options = useMemo(() => {
    return providers.flatMap(p => p.models.map(m => {
      return {
        ...m,
        providerId: p.provider.id,
        modelId: m.id,
      };
    }));
  }, [providers]);


  const [lastUsedModel, setLastUsedModel] = useAtom(lastUsedModelAtom);
  const selectedModel = options.find(o => o.providerId === lastUsedModel?.providerId && o.modelId === lastUsedModel?.modelId) || options[0];

  const [chatSettings, updateChatSettings] = useChatSettings(selectedModel.defaultParameters);
  const [activePersona, setActivePersona] = useState<PersonaSchemaType | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [_, navigate] = useLocation();

  const { data: personas } = usePersonas();

  usePageTitle('New chat');

  return (<div className={styles.RootPage}>
    <Card flexGrow withScrollArea={false}>
      <ChatLayout
        inputRef={inputRef}
        onSend={(text) => {
          newChat.mutateAsync({
            providerId: selectedModel.providerId,
            modelId: selectedModel.modelId,
            text,
            personaId: activePersona?.id,
            parameters: {
              temperature: chatSettings.temperature.enabled ? chatSettings.temperature.value : undefined,
              system: chatSettings.system.enabled ? chatSettings.system.value : undefined,
            }
          }).then((res) => {
            // TODO: we need to handle error and don't navigate if chat wasn't created (e.g. selected invalid/no longer available model)
            navigate(`/chats/${res.id}`);
          })
        }}
      >
        <ChatLayout.Title>New chat</ChatLayout.Title>

        <ChatLayout.MessagesArea>
          <div className={styles.startMenuWrapper}>
            <div className={styles.startMenu}>
              {personas.length > 0 && <section>
                <div className={styles.sectionTitle}>Start with persona</div>
                <div className={styles.personasList}>
                  {personas.map(p => {
                    return (<Button
                      key={p.id}
                      className={styles.personaButton}
                      variant={activePersona?.id === p.id ? 'primary' : 'normal'}
                      onClick={() => {
                        if (activePersona?.id === p.id) {
                          applyPersona(null);
                        } else {
                          applyPersona(p);
                        }
                      }}
                    >
                      <div className={styles.personaCard}>
                        <div className={styles.avatar}>{p.avatar}</div>
                        <div className={styles.name}>{p.name}</div>
                      </div>
                    </Button>)
                  })}
                </div>
              </section>}
              <section>
                <div className={styles.sectionTitle}>{personas.length === 0 ? 'Chat parameters' : 'Or set chat parameters manually'}</div>
                <Card className={styles.settingsCard} withScrollArea={false}>
                  <ModelSelect
                    value={selectedModel}
                    onChange={setLastUsedModel}
                  />
                  <ChatSettings settings={chatSettings} settingsUpdater={updateChatSettings} />
                </Card>
              </section>
            </div>
          </div>
        </ChatLayout.MessagesArea>

        <ChatLayout.TextareaActions>

        </ChatLayout.TextareaActions>
      </ChatLayout>
    </Card>
  </div>);
});

RootPage.displayName = 'RootPage'
