import { ReactNode, useMemo, useState } from 'react';
import styles from './AuthGate.module.scss';
import { AuthProvider, createApiClient } from '@client/api';
import { apiKeyAtom } from '@client/atoms/auth';
import { useAtom } from 'jotai';
import { Input } from '@client/components/Input';
import { Button } from '@client/components/Button';

export type AuthGateProps = {
  children: ReactNode
};

export const AuthGate = ({ children }: AuthGateProps) => {
  const tryLogin = async () => {
    if (!apiKeyDraft) return;
    try {
      setIsLoading(true);
      setError('');
      const api = createApiClient(apiKeyDraft);
      const resp = await api.auth.validate.$get();
      const json = await resp.json();
      setIsLoading(false);
      setApiKeyAtom({
        apiKey: apiKeyDraft,
        lastCheck: Date.now(),
      });
      setError('');
      setApiKeyDraft('');
    } catch (err) {
      console.log(err);
      setError('Incorrect password');
    } finally {
      setIsLoading(false);
    }
  };
  const [{ apiKey, lastCheck }, setApiKeyAtom] = useAtom(apiKeyAtom);
  const apiClient = useMemo(() => createApiClient(apiKey), [apiKey]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const [error, setError] = useState('');

  const authenticated = !!apiKey && (Date.now() - lastCheck) < 1000 * 60 * 60 * 12;

  if (isLoading || !authenticated) {
    console.log('Render authgate, is loading', isLoading);
    return (<div className={styles.AuthGate}>
      <div className={styles.card}>
        <div className={styles.title}>Please enter the password</div>
        <div className={styles.inputWrapper}>
          <Input className={styles.input} value={apiKeyDraft} onValueChange={setApiKeyDraft} />
          <Button onClick={tryLogin} loading={isLoading}>Log in</Button>
        </div>
        {!!error && <div className={styles.error}>{error}</div>}
      </div>
    </div>);
  }

  return (<AuthProvider value={apiClient}>
    {children}
  </AuthProvider>);
};
