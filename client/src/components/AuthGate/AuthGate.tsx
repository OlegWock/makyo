import { ReactNode, useEffect, useMemo, useState } from 'react';
import styles from './AuthGate.module.scss';
import { AuthProvider, createApiClient, createHttpClient } from '@client/api';
import { Input } from '@client/components/Input';
import { Button } from '@client/components/Button';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

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
      if (!resp.ok || !json.valid) throw new Error('Wrong password');
      setIsLoading(false);
      setError('');
      setApiKeyDraft('');
      queryClient.setQueryData(['auth'], true);
    } catch (err) {
      console.log(err);
      setError('Incorrect password');
    } finally {
      setIsLoading(false);
    }
  };
  const apiClient = useMemo(() => createApiClient(), []);
  const queryClient = useQueryClient();

  const authQuery = useSuspenseQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      console.log('Making auth verify request');
      const resp = await apiClient.auth.verify.$get();
      if (!resp.ok) return false;
      return true;
    }
  });

  console.log('Auth query', authQuery);

  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const [error, setError] = useState('');

  if (isLoading || !authQuery.data) {
    console.log('Render authgate, is loading', isLoading);
    return (<div className={styles.AuthGate}>
      <div className={styles.card}>

        {window.isSecureContext ? <>
          <div className={styles.title}>Please enter the password</div>
          <div className={styles.inputWrapper}>
            <Input type='password' className={styles.input} value={apiKeyDraft} onValueChange={setApiKeyDraft} />
            <Button variant='primary' size='large' onClick={tryLogin} loading={isLoading}>Log in</Button>
          </div>
          {!!error && <div className={styles.error}>{error}</div>}
        </> : <>
          <div className={styles.error}>Makyo should be run either on localhost or over HTTPS, otherwise auth won't work.</div>
        </>}
      </div>
    </div>);
  }

  return (<AuthProvider value={apiClient}>
    {children}
  </AuthProvider>);
};
