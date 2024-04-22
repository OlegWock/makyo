import { ReactNode, useEffect, useMemo, useState } from 'react';
import styles from './AuthGate.module.scss';
import { AuthProvider, createApiClient, createHttpClient } from '@client/api';
import { Input } from '@client/components/Input';
import { Button } from '@client/components/Button';

export type AuthGateProps = {
  children: ReactNode
};

export const AuthGate = ({ children }: AuthGateProps) => {
  const tryLogin = async () => {
    console.log('Try login');
    if (!apiKeyDraft) return;
    try {
      setIsLoading(true);
      setError('');
      const http = createHttpClient();
      const resp = await http.authenticate.$post({ json: { token: apiKeyDraft } });
      const json = await resp.json();
      setIsLoading(false);
      setError('');
      setApiKeyDraft('');
      setIsAuthenticated(true);
    } catch (err) {
      console.log(err);
      setError('Incorrect password');
    } finally {
      setIsLoading(false);
    }
  };
  const apiClient = useMemo(() => createApiClient(), []);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.auth.verify.$get().then((res) => {
      setIsAuthenticated(res.ok);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !isAuthenticated) {
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
