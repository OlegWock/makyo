import styles from './RootPage.module.scss';
import { useChats, useModels, useNewChatMutation, usePersonas } from '@client/api';
import { useEffect, useMemo, useRef, useState, KeyboardEvent } from 'react';
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
import { Link } from '@client/components/Link';
import { HiChevronRight, HiOutlinePaperAirplane } from 'react-icons/hi2';
import { useIsMobile } from '@client/utils/responsive';
import { WithSnippets } from '@client/components/WithSnippets';
import { Textarea } from '@client/components/Input';

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
  const { data: chats } = useChats();

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

  useEffect(() => {
    const defaultPersona = personas.find(p => p.isDefault);
    if (defaultPersona) {
      applyPersona(defaultPersona);
    }
  }, []);

  const onKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const result = await onSend?.(text);
      if (result !== false) {
        setText('');
      }
      return;
    }
  };

  const [text, setText] = useState('');
  const isMobile = useIsMobile();

  const onSend = (text: string) => newChat.mutateAsync({
    providerId: selectedModel.providerId,
    modelId: selectedModel.modelId,
    text,
    personaId: activePersona?.id,
    parameters: {
      temperature: chatSettings.temperature.enabled ? chatSettings.temperature.value : undefined,
      system: chatSettings.system.enabled ? chatSettings.system.value : undefined,
    }
  }).then((res) => {
    navigate(`/chats/${res.id}`);
    return true;
  }).catch((err) => {
    return false;
  });

  return (<div className={styles.RootPage}>
    <Card flexGrow withScrollArea={false}>

      <div className={styles.ChatLayout}>
        <div className={styles.chat}>
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

              {chats.length > 0 && <section>
                <div className={styles.sectionTitle}>Pick up where you left off</div>
                <div className={styles.chatsList}>
                  {chats.slice(0, 5).map(chat => <Link variant='unstyled' key={chat.id} className={styles.chatCard} href={`/chats/${chat.id}`}>
                    <div>{chat.title}</div>
                    <HiChevronRight />
                  </Link>)}
                </div>
              </section>}
            </div>
          </div>
        </div>

        <div className={styles.messageArea}>
          <div className={styles.contentWrapper}>
            <div className={styles.textareaWrapper}>
              <WithSnippets>
                <Textarea
                  className={styles.textarea}
                  autoFocus={!isMobile}
                  minRows={1}
                  maxRows={20}
                  value={text}
                  placeholder='Enter your message...'
                  onKeyDown={onKeyDown}
                  onValueChange={setText}
                  ref={inputRef}
                />
              </WithSnippets>
              <Button
                className={styles.sendButton}
                icon={<HiOutlinePaperAirplane />}
                iconPosition='after'
                size='large'
                variant='primary'
                onClick={() => {
                  onSend?.(text);
                  setText('');
                }}
                disabled={text.length === 0}
                children={isMobile ? undefined : 'Send'}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div >);
});

RootPage.displayName = 'RootPage'
